import { useCallback, useEffect, useState } from 'react';
import { fetchOverview } from '../api/analytics';
import type { VideoOverview } from '../api/types';

/**
 * Agregados e lista de vídeos de um âmbito: sem channelId é global, com
 * channelId é só daquele canal.
 */
export function useOverview(channelId: string | null = null) {
  const [overview, setOverview] = useState<VideoOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchOverview(channelId)
      .then(setOverview)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [channelId]);

  useEffect(() => { load(); }, [load]);

  return { overview, loading, error, refetch: load };
}
