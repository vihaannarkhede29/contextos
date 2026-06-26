import type { SearchResult } from '@contextosai/shared';
import { loadConfig } from './config.js';
import {
  createEmbeddingProvider,
  validateEmbeddingDimensions,
} from './embeddings.js';
import { ContextDatabase } from './database.js';
import { VectorStore } from './vectors.js';

export async function searchRepository(
  rootPath: string,
  query: string,
  limit = 10,
): Promise<SearchResult[]> {
  const config = loadConfig(rootPath);
  const db = new ContextDatabase(rootPath);
  const indexDimensions =
    config.vectorDimensions ??
    (parseInt(db.getMeta('vectorDimensions') ?? '', 10) || undefined);
  db.close();

  const embedder = await createEmbeddingProvider(config, { probe: false });
  validateEmbeddingDimensions(indexDimensions, embedder.dimensions);

  const vectors = new VectorStore(rootPath);
  await vectors.init();
  const queryVector = await embedder.embed(query);
  const results = await vectors.search(queryVector, limit);
  await vectors.close();
  return results;
}
