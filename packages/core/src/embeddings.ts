import type { ContextOSConfig } from '@contextosai/shared';
import { DEFAULT_OLLAMA_URL } from '@contextosai/shared';

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  readonly name: 'ollama' | 'transformers';
  readonly dimensions: number;
}

export class EmbeddingDimensionMismatchError extends Error {
  constructor(
    public readonly indexDimensions: number,
    public readonly queryDimensions: number,
  ) {
    super(
      `Embedding dimension mismatch: index has ${indexDimensions} dims but query has ${queryDimensions}. Run: contextosai index --force`,
    );
    this.name = 'EmbeddingDimensionMismatchError';
  }
}

class OllamaEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'ollama' as const;
  readonly dimensions: number;

  constructor(
    private url: string,
    private model: string,
    dimensions: number,
  ) {
    this.dimensions = dimensions;
  }

  async embed(text: string): Promise<number[]> {
    const results = await this.embedBatch([text]);
    return results[0] ?? [];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      const response = await fetch(`${this.url}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.model, prompt: text }),
      });
      if (!response.ok) {
        throw new Error(`Ollama embedding failed: ${response.statusText}`);
      }
      const data = (await response.json()) as { embedding: number[] };
      if (!data.embedding?.length) {
        throw new Error('Ollama returned empty embedding');
      }
      results.push(data.embedding);
    }
    return results;
  }
}

class TransformersEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'transformers' as const;
  readonly dimensions = 384;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pipeline: any = null;

  private async getPipeline() {
    if (!this.pipeline) {
      const { pipeline } = await import('@xenova/transformers');
      this.pipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return this.pipeline as (
      text: string,
      opts: { pooling: string; normalize: boolean },
    ) => Promise<{ data: Float32Array }>;
  }

  async embed(text: string): Promise<number[]> {
    const pipe = await this.getPipeline();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      results.push(await this.embed(text));
    }
    return results;
  }
}

export interface CreateEmbeddingProviderOptions {
  probe?: boolean;
}

export async function createEmbeddingProvider(
  config: ContextOSConfig,
  options: CreateEmbeddingProviderOptions = {},
): Promise<EmbeddingProvider> {
  const { probe = true } = options;

  if (config.embeddingProvider === 'ollama') {
    try {
      const provider = new OllamaEmbeddingProvider(
        config.ollamaUrl ?? DEFAULT_OLLAMA_URL,
        config.embeddingModel,
        config.vectorDimensions ?? 768,
      );
      if (probe) {
        const testVector = await provider.embed('contextos dimension probe');
        return new OllamaEmbeddingProvider(
          config.ollamaUrl ?? DEFAULT_OLLAMA_URL,
          config.embeddingModel,
          testVector.length,
        );
      }
      return provider;
    } catch {
      console.warn('Ollama unavailable, falling back to Transformers.js');
    }
  }
  return new TransformersEmbeddingProvider();
}

export function validateEmbeddingDimensions(
  indexDimensions: number | null | undefined,
  queryDimensions: number,
): void {
  if (indexDimensions != null && indexDimensions !== queryDimensions) {
    throw new EmbeddingDimensionMismatchError(indexDimensions, queryDimensions);
  }
}

export async function isOllamaAvailable(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}
