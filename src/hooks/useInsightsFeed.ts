import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchInsightCards } from '../api/insights';
import type { InsightCardsResponse } from '../api/types';

export interface FeedEntry {
  youtubeId: string;
  data: InsightCardsResponse | null;
  error: string | null;
}

/**
 * Sínteses já geradas de vários vídeos, para a Home mostrar o que a audiência
 * disse sem obrigar a entrar em cada vídeo. Só lê: quem gera os cartões é a
 * tela do vídeo, porque gerar custa uma chamada ao modelo.
 */
export function useInsightsFeed(youtubeIds: string[]) {
  // A lista chega recriada a cada render do pai; a chave estabiliza o efeito.
  const key = youtubeIds.join(',');
  const ids = useMemo(() => (key ? key.split(',') : []), [key]);

  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback((signal?: AbortSignal) => {
    if (ids.length === 0) {
      setEntries([]);
      return;
    }
    setLoading(true);
    Promise.all(
      ids.map(id =>
        fetchInsightCards(id, signal)
          .then((data): FeedEntry => ({ youtubeId: id, data, error: null }))
          // Um vídeo sem síntese não pode derrubar o feed inteiro.
          .catch((e: Error): FeedEntry => ({ youtubeId: id, data: null, error: e.message })),
      ),
    ).then(result => {
      if (signal?.aborted) return;
      setEntries(result);
      setLoading(false);
    });
  }, [ids]);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  return { entries, loading, refetch: () => load() };
}
