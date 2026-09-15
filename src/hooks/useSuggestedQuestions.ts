import { useEffect, useRef, useState } from 'react';
import { fetchSuggestedQuestions } from '../api/insights';
import type { AskScope, SuggestedQuestion } from '../api/types';

/** Determinístico e sem custo de LLM — pode carregar junto com o painel. */
export function useSuggestedQuestions(scope: AskScope | null) {
  const [questions, setQuestions] = useState<SuggestedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Como no chat: a identidade do âmbito é a chave, não o objecto.
  const key = scope ? `${scope.kind}:${scope.id}` : null;
  const scopeRef = useRef(scope);
  scopeRef.current = scope;

  useEffect(() => {
    const target = scopeRef.current;
    if (!target) {
      setQuestions([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchSuggestedQuestions(target, controller.signal)
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
  }, [key]);

  return { questions, loading, error };
}
