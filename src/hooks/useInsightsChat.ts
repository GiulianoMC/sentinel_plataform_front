import { useCallback, useEffect, useRef, useState } from 'react';
import { askInsight } from '../api/insights';
import type { ApiError } from '../api/client';
import type { AskRequest, AskResponse, AskScope } from '../api/types';

export function useInsightsChat(scope: AskScope | null) {
  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState<AskResponse | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  // true quando a resposta veio da 2ª tentativa (sample) — a UI explica porquê
  const [usedFallback, setUsedFallback] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // O âmbito chega como objecto novo a cada render; o que o identifica é a
  // chave, e é ela que entra nas dependências. O objecto em si vive num ref.
  const key = scope ? `${scope.kind}:${scope.id}` : null;
  const scopeRef = useRef(scope);
  scopeRef.current = scope;

  // Trocar de âmbito cancela a pergunta em voo e limpa o painel
  useEffect(() => {
    abortRef.current?.abort();
    setResult(null);
    setError(null);
    setAsking(false);
    setUsedFallback(false);
    return () => abortRef.current?.abort();
  }, [key]);

  const ask = useCallback(
    async (req: AskRequest) => {
      const target = scopeRef.current;
      if (!target) return;
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
        let res = await askInsight(target, { ...req, question }, controller.signal);
        if (controller.signal.aborted) return;

        // Fallback semantic → sample. A busca semântica falha sem evidência em
        // dois casos que o front não distingue: filtros que não casam com os
        // metadados do Chroma (comentários indexados antes do write-back) e
        // perguntas amplas que não embedam perto de nenhum comentário concreto.
        // Em `sample` os mesmos filtros viram WHERE no Postgres, que tem os
        // metadados sempre — a semântica da sugestão é preservada.
        if (!res.llm_called && res.strategy_used === 'semantic') {
          const retry = await askInsight(
            target,
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
    [key],
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
