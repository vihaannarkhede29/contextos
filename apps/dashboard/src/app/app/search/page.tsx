'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatPercent } from '@/lib/utils';
import type { SearchResult } from '@contextosai/shared';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        setError((data as { error?: string }).error ?? 'Search failed');
        setResults([]);
        return;
      }
      setResults(data as SearchResult[]);
    } catch {
      setError('Network error. Is the index available?');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="mt-1 text-muted-foreground">Semantic search across indexed files</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g. "authentication middleware"'
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      <div className="mt-8 space-y-4">
        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}
        {searched && !error && results.length === 0 && !loading && (
          <p className="text-muted-foreground">No results found. Try indexing first.</p>
        )}
        {results.map((result) => (
          <Card key={result.path}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-mono text-base">{result.path}</CardTitle>
              <Badge className="bg-primary/20 text-primary">
                {formatPercent(result.score)} match
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {result.summary.slice(0, 400)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
