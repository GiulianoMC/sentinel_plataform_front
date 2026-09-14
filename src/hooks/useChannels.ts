import { useCallback, useEffect, useState } from 'react';
import { fetchChannelsOverview } from '../api/analytics';
import type { ChannelsOverview } from '../api/types';

/**
 * Canais do utilizador com agregados (vídeos/comentários/sentimento) e a
 * contagem de vídeos ainda sem canal. Alimenta o ChannelSelector e o aviso
 * de backfill na Visão Geral.
 */
export function useChannels() {
  const [data, setData] = useState<ChannelsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchChannelsOverview()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return { channels: data?.channels ?? [], overview: data, loading, error, refetchChannels: load };
}
