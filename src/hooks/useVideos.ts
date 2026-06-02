import { useState, useEffect, useCallback } from 'react';
import { fetchVideos } from '../api/videos';
import type { Video } from '../api/types';

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchVideos()
      .then(setVideos)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return { videos, loading, error, refetchVideos: load };
}
