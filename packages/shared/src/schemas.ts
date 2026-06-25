import { z } from 'zod';

export const ContextOSConfigSchema = z.object({
  version: z.string().default('1'),
  embeddingProvider: z.enum(['ollama', 'transformers']).default('ollama'),
  actualEmbeddingProvider: z.enum(['ollama', 'transformers']).optional(),
  ollamaUrl: z.string().url().default('http://localhost:11434'),
  embeddingModel: z.string().default('nomic-embed-text'),
  vectorDimensions: z.number().int().positive().optional(),
  agentExportEnabled: z.boolean().default(true),
  lastIndexedAt: z.string().datetime().optional(),
});

export type ContextOSConfig = z.infer<typeof ContextOSConfigSchema>;

export const FileMetadataSchema = z.object({
  id: z.string(),
  path: z.string(),
  extension: z.string(),
  size: z.number(),
  hash: z.string(),
  imports: z.array(z.string()),
  exports: z.array(z.string()),
  classes: z.array(z.string()),
  functions: z.array(z.string()),
  comments: z.array(z.string()),
  summary: z.string().optional(),
  indexedAt: z.string().datetime(),
});

export type FileMetadata = z.infer<typeof FileMetadataSchema>;

export const DecisionRecordSchema = z.object({
  id: z.string(),
  title: z.string(),
  decision: z.string(),
  source: z.enum(['git commit', 'file pattern', 'inferred']),
  confidence: z.number().min(0).max(1),
  commitHash: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type DecisionRecord = z.infer<typeof DecisionRecordSchema>;

export const ArchitectureRuleSchema = z.object({
  id: z.string(),
  category: z.enum(['framework', 'convention', 'module', 'dependency']),
  name: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
});

export type ArchitectureRule = z.infer<typeof ArchitectureRuleSchema>;

export const SearchResultSchema = z.object({
  path: z.string(),
  score: z.number(),
  summary: z.string(),
  snippet: z.string().optional(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

export const IndexStatsSchema = z.object({
  filesIndexed: z.number(),
  decisionsLearned: z.number(),
  rulesExtracted: z.number(),
  lastIndexedAt: z.string().datetime().nullable(),
});

export type IndexStats = z.infer<typeof IndexStatsSchema>;

export const ActivityRecordSchema = z.object({
  id: z.string(),
  path: z.string(),
  action: z.enum(['created', 'modified', 'deleted']),
  timestamp: z.string().datetime(),
});

export type ActivityRecord = z.infer<typeof ActivityRecordSchema>;
