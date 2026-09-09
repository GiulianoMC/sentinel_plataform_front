import { useEffect, useState } from 'react';
import { fetchSuggestedQuestions } from '../api/insights';
import type { SuggestedQuestion } from '../api/types';

/** Determinístico e sem custo de LLM — pode carregar junto com o painel. */
export function useSuggestedQuestions(youtubeId: string | null) {
  const [questions, setQuestions] = useState<SuggestedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!youtubeId) {
      setQuestions([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchSuggestedQuestions(youtubeId, controller.signal)
      .then(res => {
        if (controller.signal.aborted) return;
        setQuestions(res.questions);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setError(err);
        setQuestions([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [youtubeId]);

  return { questions, loading, error };
}
