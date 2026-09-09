import { useCallback, useEffect, useRef, useState } from 'react';
import { askInsight } from '../api/insights';
import type { ApiError } from '../api/client';
import type { AskRequest, AskResponse } from '../api/types';

export function useInsightsChat(youtubeId: string | null) {
  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState<AskResponse | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  // true quando a resposta veio da 2ª tentativa (sample) — a UI explica porquê
  const [usedFallback, setUsedFallback] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Trocar de vídeo cancela a pergunta em voo e limpa o painel
  useEffect(() => {
    abortRef.current?.abort();
    setResult(null);
    setError(null);
    setAsking(false);
    setUsedFallback(false);
    return () => abortRef.current?.abort();
  }, [youtubeId]);

  const ask = useCallback(
    async (req: AskRequest) => {
      if (!youtubeId) return;
      const question = req.question.trim();
      if (question.length < 3 || question.length > 500) {
        setError(new Error('A pergunta deve ter entre 3 e 500 caracteres.'));
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setAsking(true);
      setError(null);
      setResult(null);
      setUsedFallback(false);

      try {
        let res = await askInsight(youtubeId, { ...req, question }, controller.signal);
        if (controller.signal.aborted) return;

        // Fallback semantic → sample. A busca semântica falha sem evidência em
        // dois casos que o front não distingue: filtros que não casam com os
        // metadados do Chroma (comentários indexados antes do write-back) e
        // perguntas amplas que não embedam perto de nenhum comentário concreto.
        // Em `sample` os mesmos filtros viram WHERE no Postgres, que tem os
        // metadados sempre — a semântica da sugestão é preservada.
        if (!res.llm_called && res.strategy_used === 'semantic') {
          const retry = await askInsight(
            youtubeId,
            { ...req, question, strategy: 'sample' },
            controller.signal,
          );
          if (controller.signal.aborted) return;
          if (retry.llm_called) {
            res = retry;
            setUsedFallback(true);
          }
        }

        setResult(res);
      } catch (err) {
        if (controller.signal.aborted) return;   // cancelamento não é erro
        setError(err as Error);
      } finally {
        if (!controller.signal.aborted) setAsking(false);
      }
    },
    [youtubeId],
  );

  const clearError = useCallback(() => setError(null), []);

  // "Nova pergunta": cancela o que estiver em voo e volta ao estado inicial
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setResult(null);
    setError(null);
    setAsking(false);
    setUsedFallback(false);
  }, []);

  return { asking, result, error, usedFallback, ask, clearError, reset };
}
