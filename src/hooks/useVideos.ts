import { useState, useEffect, useCallback } from 'react';
import { fetchVideos } from '../api/videos';
import type { Video } from '../api/types';

/**
 * Lista de vídeos do utilizador. Com `channelId`, só os desse canal — o Painel
 * herda assim o filtro da Visão Geral. Enquanto recarrega, mantém a lista
 * anterior para não piscar; quem depende dela deve olhar para `loading`.
 */
export function useVideos(channelId: string | null = null) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchVideos(channelId)
      .then(setVideos)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [channelId]);

  useEffect(() => { load(); }, [load]);

  return { videos, loading, error, refetchVideos: load };
}
