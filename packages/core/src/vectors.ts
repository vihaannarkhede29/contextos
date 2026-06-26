import * as lancedb from '@lancedb/lancedb';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { CONTEXTOS_LANCE } from '@contextosai/shared';
import type { SearchResult } from '@contextosai/shared';
import { getContextOSPath } from './config.js';

const TABLE_NAME = 'embeddings';

type VectorRecord = Record<string, unknown> & {
  id: string;
  path: string;
  summary: string;
  vector: number[];
};

export function cosineDistanceToScore(distance: number): number {
  return Math.max(0, Math.min(1, 1 - distance / 2));
}

function escapePath(path: string): string {
  return path.replace(/'/g, "''");
}

export class VectorStore {
  private db: lancedb.Connection | null = null;
  private table: lancedb.Table | null = null;
  private readonly lancePath: string;

  constructor(rootPath: string) {
    const dir = getContextOSPath(rootPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    this.lancePath = join(dir, CONTEXTOS_LANCE);
  }

  async init(): Promise<void> {
    this.db = await lancedb.connect(this.lancePath);
    const tables = await this.db.tableNames();
    if (tables.includes(TABLE_NAME)) {
      this.table = await this.db.openTable(TABLE_NAME);
    }
  }

  async upsert(record: VectorRecord): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Vector store not initialized');

    if (!this.table) {
      this.table = await this.db.createTable(TABLE_NAME, [record]);
      return;
    }

    await this.deleteByPath(record.path as string);
    await this.table.add([record]);
  }

  async deleteByPath(path: string): Promise<void> {
    if (!this.table) {
      if (!this.db) await this.init();
      if (!this.db) return;
      const tables = await this.db.tableNames();
      if (!tables.includes(TABLE_NAME)) return;
      this.table = await this.db.openTable(TABLE_NAME);
    }
    try {
      await this.table!.delete(`path = '${escapePath(path)}'`);
    } catch {
      // ignore
    }
  }

  async search(queryVector: number[], limit = 10): Promise<SearchResult[]> {
    if (!this.table) {
      if (!this.db) await this.init();
      if (!this.db) return [];
      const tables = await this.db.tableNames();
      if (!tables.includes(TABLE_NAME)) return [];
      this.table = await this.db.openTable(TABLE_NAME);
    }

    const results = await this.table!
      .vectorSearch(queryVector)
      .distanceType('cosine')
      .limit(limit)
      .toArray();

    return results.map((row) => {
      const r = row as Record<string, unknown>;
      const distance = (r._distance as number) ?? 2;
      return {
        path: r.path as string,
        score: cosineDistanceToScore(distance),
        summary: (r.summary as string) ?? '',
        snippet: ((r.summary as string) ?? '').slice(0, 200),
      };
    });
  }

  async close(): Promise<void> {
    this.table = null;
    this.db = null;
  }
}
