import Database from 'better-sqlite3';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import type {
  ActivityRecord,
  ArchitectureRule,
  DecisionRecord,
  FileMetadata,
  IndexStats,
} from '@contextos/shared';
import { CONTEXTOS_DB } from '@contextos/shared';
import { getContextOSPath } from './config.js';

export class ContextDatabase {
  private db: Database.Database;

  constructor(rootPath: string) {
    const dir = getContextOSPath(rootPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const dbPath = join(dir, CONTEXTOS_DB);
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.migrate();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        path TEXT UNIQUE NOT NULL,
        extension TEXT NOT NULL,
        size INTEGER NOT NULL,
        hash TEXT NOT NULL,
        imports TEXT NOT NULL DEFAULT '[]',
        exports TEXT NOT NULL DEFAULT '[]',
        classes TEXT NOT NULL DEFAULT '[]',
        functions TEXT NOT NULL DEFAULT '[]',
        comments TEXT NOT NULL DEFAULT '[]',
        summary TEXT,
        indexed_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS decisions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        decision TEXT NOT NULL,
        source TEXT NOT NULL,
        confidence REAL NOT NULL,
        commit_hash TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS rules (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        confidence REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS activity (
        id TEXT PRIMARY KEY,
        path TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);
      CREATE INDEX IF NOT EXISTS idx_decisions_created ON decisions(created_at);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_decisions_dedup ON decisions(title, decision, commit_hash);
      CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity(timestamp);
    `);
  }

  upsertFile(file: FileMetadata): void {
    const stmt = this.db.prepare(`
      INSERT INTO files (id, path, extension, size, hash, imports, exports, classes, functions, comments, summary, indexed_at)
      VALUES (@id, @path, @extension, @size, @hash, @imports, @exports, @classes, @functions, @comments, @summary, @indexedAt)
      ON CONFLICT(path) DO UPDATE SET
        id = files.id,
        extension = excluded.extension,
        size = excluded.size,
        hash = excluded.hash,
        imports = excluded.imports,
        exports = excluded.exports,
        classes = excluded.classes,
        functions = excluded.functions,
        comments = excluded.comments,
        summary = excluded.summary,
        indexed_at = excluded.indexed_at
    `);
    stmt.run({
      ...file,
      imports: JSON.stringify(file.imports),
      exports: JSON.stringify(file.exports),
      classes: JSON.stringify(file.classes),
      functions: JSON.stringify(file.functions),
      comments: JSON.stringify(file.comments),
    });
  }

  deleteFile(path: string): void {
    this.db.prepare('DELETE FROM files WHERE path = ?').run(path);
  }

  getFile(path: string): FileMetadata | null {
    const row = this.db.prepare('SELECT * FROM files WHERE path = ?').get(path) as
      | Record<string, unknown>
      | undefined;
    if (!row) return null;
    return this.rowToFile(row);
  }

  getAllFiles(): FileMetadata[] {
    const rows = this.db.prepare('SELECT * FROM files ORDER BY path').all() as Record<
      string,
      unknown
    >[];
    return rows.map((r) => this.rowToFile(r));
  }

  getFileCount(): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM files').get() as { count: number };
    return row.count;
  }

  private rowToFile(row: Record<string, unknown>): FileMetadata {
    return {
      id: row.id as string,
      path: row.path as string,
      extension: row.extension as string,
      size: row.size as number,
      hash: row.hash as string,
      imports: JSON.parse(row.imports as string) as string[],
      exports: JSON.parse(row.exports as string) as string[],
      classes: JSON.parse(row.classes as string) as string[],
      functions: JSON.parse(row.functions as string) as string[],
      comments: JSON.parse(row.comments as string) as string[],
      summary: (row.summary as string) ?? undefined,
      indexedAt: row.indexed_at as string,
    };
  }

  upsertDecision(decision: DecisionRecord): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO decisions (id, title, decision, source, confidence, commit_hash, created_at)
         VALUES (@id, @title, @decision, @source, @confidence, @commitHash, @createdAt)`,
      )
      .run(decision);
  }

  getDecisions(): DecisionRecord[] {
    return this.db
      .prepare('SELECT * FROM decisions ORDER BY created_at DESC')
      .all()
      .map((row) => {
        const r = row as Record<string, unknown>;
        return {
          id: r.id as string,
          title: r.title as string,
          decision: r.decision as string,
          source: r.source as DecisionRecord['source'],
          confidence: r.confidence as number,
          commitHash: (r.commit_hash as string) ?? undefined,
          createdAt: r.created_at as string,
        };
      });
  }

  clearRules(): void {
    this.db.prepare('DELETE FROM rules').run();
  }

  upsertRule(rule: ArchitectureRule): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO rules (id, category, name, description, confidence)
         VALUES (@id, @category, @name, @description, @confidence)`,
      )
      .run(rule);
  }

  getRules(): ArchitectureRule[] {
    return this.db.prepare('SELECT * FROM rules ORDER BY confidence DESC').all() as ArchitectureRule[];
  }

  addActivity(activity: ActivityRecord): void {
    this.db
      .prepare(
        `INSERT INTO activity (id, path, action, timestamp) VALUES (@id, @path, @action, @timestamp)`,
      )
      .run(activity);
  }

  getRecentActivity(limit = 50): ActivityRecord[] {
    return this.db
      .prepare('SELECT * FROM activity ORDER BY timestamp DESC LIMIT ?')
      .all(limit)
      .map((row) => {
        const r = row as Record<string, unknown>;
        return {
          id: r.id as string,
          path: r.path as string,
          action: r.action as ActivityRecord['action'],
          timestamp: r.timestamp as string,
        };
      });
  }

  setMeta(key: string, value: string): void {
    this.db
      .prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)')
      .run(key, value);
  }

  getMeta(key: string): string | null {
    const row = this.db.prepare('SELECT value FROM meta WHERE key = ?').get(key) as
      | { value: string }
      | undefined;
    return row?.value ?? null;
  }

  getStats(): IndexStats {
    return {
      filesIndexed: this.getFileCount(),
      decisionsLearned: (
        this.db.prepare('SELECT COUNT(*) as count FROM decisions').get() as { count: number }
      ).count,
      rulesExtracted: (
        this.db.prepare('SELECT COUNT(*) as count FROM rules').get() as { count: number }
      ).count,
      lastIndexedAt: this.getMeta('lastIndexedAt'),
    };
  }

  close(): void {
    this.db.close();
  }
}
