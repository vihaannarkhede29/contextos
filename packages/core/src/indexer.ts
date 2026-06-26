import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { FileMetadata } from '@contextosai/shared';
import type { EmbeddingProvider } from './embeddings.js';
import { ensureContextOSDir, generateId, hashContent, loadConfig, saveConfig } from './config.js';
import { ContextDatabase } from './database.js';
import { createEmbeddingProvider } from './embeddings.js';
import { extractDecisionsFromGit } from './git-analyzer.js';
import { exportAgentContext } from './export.js';
import { generateSummary, parseFile } from './parser.js';
import {
  extractArchitectureRules,
  generateProjectMemory,
  writeProjectMemory,
} from './rules.js';
import { scanRepository } from './scanner.js';
import { VectorStore } from './vectors.js';

export interface IndexOptions {
  incremental?: boolean;
  force?: boolean;
  onProgress?: (message: string) => void;
}

export interface IndexResult {
  filesIndexed: number;
  filesSkipped: number;
  decisionsLearned: number;
  rulesExtracted: number;
}

export class Indexer {
  private db: ContextDatabase;
  private vectors: VectorStore;
  private rootPath: string;
  private embedder: EmbeddingProvider | null = null;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
    ensureContextOSDir(rootPath);
    this.db = new ContextDatabase(rootPath);
    this.vectors = new VectorStore(rootPath);
  }

  private async getEmbedder(): Promise<EmbeddingProvider> {
    if (!this.embedder) {
      const config = loadConfig(this.rootPath);
      this.embedder = await createEmbeddingProvider(config);
    }
    return this.embedder;
  }

  async index(options: IndexOptions = {}): Promise<IndexResult> {
    const { incremental = false, force = false, onProgress } = options;
    let config = loadConfig(this.rootPath);

    if (force) {
      this.embedder = null;
    }

    const embedder = await this.getEmbedder();
    await this.vectors.init();

    const files = scanRepository(this.rootPath);
    let filesIndexed = 0;
    let filesSkipped = 0;

    onProgress?.(`Scanning ${files.length} files...`);

    for (const file of files) {
      let content: string;
      try {
        content = readFileSync(file.absolutePath, 'utf-8');
      } catch {
        filesSkipped++;
        continue;
      }

      const hash = hashContent(content);

      if (incremental && !force) {
        const existing = this.db.getFile(file.relativePath);
        if (existing && existing.hash === hash) {
          filesSkipped++;
          continue;
        }
      }

      const indexed = await this.indexFileContent(
        file.relativePath,
        file.extension,
        file.size,
        content,
        hash,
        embedder,
        onProgress,
      );
      if (indexed) filesIndexed++;
      else filesSkipped++;

      if (filesIndexed > 0 && filesIndexed % 10 === 0) {
        onProgress?.(`Indexed ${filesIndexed}/${files.length} files...`);
      }
    }

    onProgress?.('Extracting architectural decisions from git...');
    const decisions = await extractDecisionsFromGit(this.rootPath);
    for (const decision of decisions) {
      this.db.upsertDecision(decision);
    }

    onProgress?.('Extracting architecture rules...');
    const allFiles = this.db.getAllFiles();
    const rules = extractArchitectureRules(this.rootPath, allFiles);
    this.db.clearRules();
    for (const rule of rules) {
      this.db.upsertRule(rule);
    }

    const projectMemory = generateProjectMemory(this.rootPath, rules, allFiles);
    writeProjectMemory(this.rootPath, projectMemory);

    if (config.agentExportEnabled !== false) {
      exportAgentContext(this.rootPath, this.db);
    }

    const now = new Date().toISOString();
    this.db.setMeta('lastIndexedAt', now);
    this.db.setMeta('vectorDimensions', String(embedder.dimensions));
    this.db.setMeta('actualEmbeddingProvider', embedder.name);

    config = {
      ...config,
      lastIndexedAt: now,
      actualEmbeddingProvider: embedder.name,
      vectorDimensions: embedder.dimensions,
      embeddingProvider: embedder.name,
    };
    saveConfig(this.rootPath, config);

    onProgress?.('Indexing complete.');

    return {
      filesIndexed,
      filesSkipped,
      decisionsLearned: decisions.length,
      rulesExtracted: rules.length,
    };
  }

  private async indexFileContent(
    relativePath: string,
    extension: string,
    size: number,
    content: string,
    hash: string,
    embedder: EmbeddingProvider,
    onProgress?: (message: string) => void,
  ): Promise<boolean> {
    const symbols = await parseFile(content, extension);
    const summary = generateSummary(relativePath, symbols, content);

    const existing = this.db.getFile(relativePath);
    const fileId = existing?.id ?? generateId();

    let vector: number[];
    try {
      vector = await embedder.embed(summary);
    } catch {
      onProgress?.(`Warning: Could not embed ${relativePath}`);
      return false;
    }

    const metadata: FileMetadata = {
      id: fileId,
      path: relativePath,
      extension,
      size,
      hash,
      imports: symbols.imports,
      exports: symbols.exports,
      classes: symbols.classes,
      functions: symbols.functions,
      comments: symbols.comments,
      summary,
      indexedAt: new Date().toISOString(),
    };

    this.db.upsertFile(metadata);
    await this.vectors.upsert({
      id: fileId,
      path: relativePath,
      summary,
      vector,
    });
    return true;
  }

  async reindexFile(relativePath: string): Promise<void> {
    const absolutePath = join(this.rootPath, relativePath);
    let content: string;
    try {
      content = readFileSync(absolutePath, 'utf-8');
    } catch {
      this.db.deleteFile(relativePath);
      await this.vectors.deleteByPath(relativePath);
      return;
    }

    await this.vectors.init();
    const embedder = await this.getEmbedder();
    const ext = relativePath.includes('.') ? '.' + relativePath.split('.').pop()!.toLowerCase() : '';
    const hash = hashContent(content);

    await this.indexFileContent(relativePath, ext, content.length, content, hash, embedder);
  }

  async refreshMetadata(onProgress?: (message: string) => void): Promise<void> {
    onProgress?.('Refreshing architecture rules and agent context...');
    const decisions = await extractDecisionsFromGit(this.rootPath);
    for (const decision of decisions) {
      this.db.upsertDecision(decision);
    }
    const allFiles = this.db.getAllFiles();
    const rules = extractArchitectureRules(this.rootPath, allFiles);
    this.db.clearRules();
    for (const rule of rules) {
      this.db.upsertRule(rule);
    }
    const projectMemory = generateProjectMemory(this.rootPath, rules, allFiles);
    writeProjectMemory(this.rootPath, projectMemory);
    const config = loadConfig(this.rootPath);
    if (config.agentExportEnabled !== false) {
      exportAgentContext(this.rootPath, this.db);
    }
  }

  getDatabase(): ContextDatabase {
    return this.db;
  }

  getVectorStore(): VectorStore {
    return this.vectors;
  }

  async close(): Promise<void> {
    await this.vectors.close();
    this.db.close();
  }
}
