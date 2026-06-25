import chokidar, { type FSWatcher } from 'chokidar';
import { relative } from 'node:path';
import { IGNORED_DIRS, SUPPORTED_EXTENSIONS } from '@contextos/shared';
import { generateId } from './config.js';
import { Indexer } from './indexer.js';

export interface WatchOptions {
  onEvent?: (message: string) => void;
}

export class FileWatcher {
  private watcher: FSWatcher | null = null;
  private indexer: Indexer;
  private rootPath: string;
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private metadataRefreshTimer: ReturnType<typeof setTimeout> | null = null;
  private changeCount = 0;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
    this.indexer = new Indexer(rootPath);
  }

  private scheduleMetadataRefresh(onEvent?: (message: string) => void): void {
    this.changeCount++;
    if (this.metadataRefreshTimer) clearTimeout(this.metadataRefreshTimer);
    this.metadataRefreshTimer = setTimeout(async () => {
      this.metadataRefreshTimer = null;
      this.changeCount = 0;
      try {
        await this.indexer.refreshMetadata(onEvent);
        onEvent?.('Refreshed architecture rules and agent context');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Metadata refresh failed';
        onEvent?.(`Error: ${msg}`);
      }
    }, 30000);
  }

  start(options: WatchOptions = {}): void {
    const { onEvent } = options;

    this.watcher = chokidar.watch(this.rootPath, {
      ignored: (path) => {
        const parts = path.split(/[/\\]/);
        return parts.some((p) => IGNORED_DIRS.has(p));
      },
      persistent: true,
      ignoreInitial: true,
    });

    const scheduleReindex = (filePath: string, action: 'modified' | 'created' | 'deleted') => {
      const relPath = relative(this.rootPath, filePath);
      const existing = this.debounceTimers.get(relPath);
      if (existing) clearTimeout(existing);

      this.debounceTimers.set(
        relPath,
        setTimeout(() => {
          void (async () => {
            this.debounceTimers.delete(relPath);
            onEvent?.(`${action}: ${relPath}`);

            const db = this.indexer.getDatabase();
            db.addActivity({
              id: generateId(),
              path: relPath,
              action,
              timestamp: new Date().toISOString(),
            });

            try {
              if (action === 'deleted') {
                db.deleteFile(relPath);
                await this.indexer.getVectorStore().deleteByPath(relPath);
              } else {
                const ext = '.' + relPath.split('.').pop()?.toLowerCase();
                if (SUPPORTED_EXTENSIONS.has(ext)) {
                  await this.indexer.reindexFile(relPath);
                }
              }
              this.scheduleMetadataRefresh(onEvent);
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Reindex failed';
              onEvent?.(`Error reindexing ${relPath}: ${msg}`);
            }
          })();
        }, 500),
      );
    };

    this.watcher
      .on('add', (path) => scheduleReindex(path, 'created'))
      .on('change', (path) => scheduleReindex(path, 'modified'))
      .on('unlink', (path) => scheduleReindex(path, 'deleted'));

    onEvent?.('Watching for file changes...');
  }

  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    if (this.metadataRefreshTimer) {
      clearTimeout(this.metadataRefreshTimer);
      this.metadataRefreshTimer = null;
    }
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    await this.indexer.close();
  }
}
