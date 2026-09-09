import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchInsightCards, generateInsightCards } from '../api/insights';
import type { InsightCardsResponse } from '../api/types';

const POLL_MS = 5_000;

/**
 * O GET /cards não é só leitura: quando os cards estão desatualizados e há
 * pelo menos 5 comentários analisados, ele marca-os como `pending` e enfileira
 * a geração. Chamar repetidamente é seguro — a marcação funciona como lock.
 */
export function useInsightCards(youtubeId: string | null) {
  const [data, setData] = useState<InsightCardsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (silent: boolean) => {
      if (!youtubeId) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (!silent) setLoading(true);
      try {
        const res = await fetchInsightCards(youtubeId, controller.signal);
        if (controller.signal.aborted) return;
        setData(res);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err as Error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [youtubeId],
  );

  // Carrega ao trocar de vídeo
  useEffect(() => {
    setData(null);
    setError(null);
    if (!youtubeId) return;
    load(false);
    return () => abortRef.current?.abort();
  }, [youtubeId, load]);

  // Polling só enquanto a geração está em curso; os cards ficam `ready` um a um
  useEffect(() => {
    if (!data?.generating) return;
    timerRef.current = setTimeout(() => load(true), POLL_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [data, load]);

  const regenerate = useCallback(async () => {
    if (!youtubeId || regenerating) return;
    setRegenerating(true);
    setError(null);
    try {
      setData(await generateInsightCards(youtubeId));
    } catch (err) {
      setError(err as Error);
    } finally {
      setRegenerating(false);
    }
  }, [youtubeId, regenerating]);

  return { data, loading, error, regenerate, regenerating };
}
