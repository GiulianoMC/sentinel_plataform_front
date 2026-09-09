import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Info, Loader2, Sparkles, RotateCcw, FilterX } from 'lucide-react';
import { useInsightsChat } from '../../hooks/useInsightsChat';
import { useSuggestedQuestions } from '../../hooks/useSuggestedQuestions';
import type { AskRequest, SuggestedQuestion } from '../../api/types';
import { SuggestedQuestions } from './SuggestedQuestions';
import { EvidenceList } from './EvidenceList';
import { InsightError, isRateLimited } from './InsightError';
import { renderCitations, useCitationRefs } from './citations';
import { describeFilters } from './labels';

const SLOW_HINT_MS = 10_000;

interface Props {
  youtubeId: string;
}

/**
 * Hero do painel: a pergunta à IA é a interacção principal do produto, por
 * isso a caixa é grande, fica sempre visível e a resposta abre no mesmo lugar.
 */
export function AskInsight({ youtubeId }: Props) {
  const [input, setInput] = useState('');
  const [slow, setSlow] = useState(false);
  const lastRequest = useRef<AskRequest | null>(null);
  const { registerRef, resetRefs, focusIndex } = useCitationRefs();

  const { asking, result, error, usedFallback, ask, clearError, reset } = useInsightsChat(youtubeId);
  const { questions, loading: loadingQuestions } = useSuggestedQuestions(youtubeId);

  // Limpa o input ao trocar de vídeo (o hook já limpa resposta e erro)
  useEffect(() => { setInput(''); }, [youtubeId]);

  // Aviso de "ainda a processar" — o /ask não faz streaming, a resposta chega inteira
  useEffect(() => {
    if (!asking) { setSlow(false); return; }
    const id = setTimeout(() => setSlow(true), SLOW_HINT_MS);
    return () => clearTimeout(id);
  }, [asking]);

  const send = useCallback((req: AskRequest) => {
    lastRequest.current = req;
    resetRefs();
    ask(req);
  }, [ask, resetRefs]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    send({ question: input });
  };

  // Uma sugestão sem `strategy` e `filters` perde o seu sentido: "principais
  // reclamações" sem sentiment_max vira uma pergunta genérica.
  const handleSuggestion = (s: SuggestedQuestion) => {
    setInput(s.question);
    send({ question: s.question, strategy: s.strategy, filters: s.filters });
  };

  const startOver = () => {
    reset();
    resetRefs();
    setInput('');
  };

  // Repete a última pergunta sem os filtros que a sugestão trazia por baixo
  const askWithoutFilters = () => {
    if (!lastRequest.current) return;
    send({ question: lastRequest.current.question, strategy: 'auto', filters: null });
  };

  const handleExpire = useCallback(() => clearError(), [clearError]);
  const handleRetry = useCallback(() => {
    if (lastRequest.current) send(lastRequest.current);
  }, [send]);

  const blocked = asking || isRateLimited(error);
  const tooLong = input.trim().length > 500;
  const hasAnswer = !asking && result != null;
  const appliedFilters = describeFilters(lastRequest.current?.filters);

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="relative">
        <Sparkles
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
        />
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          maxLength={500}
          placeholder="O que os comentários dizem sobre… (ex.: bateria, preço, entrega)"
          className="w-full rounded-2xl bg-surface-container-high border border-primary/20 py-4 pl-12 pr-32
                     text-base text-on-surface placeholder:text-on-surface-variant/60
                     focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all"
        />
        <button
          type="submit"
          disabled={blocked || input.trim().length < 3 || tooLong}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2.5 rounded-xl
                     bg-gradient-to-tr from-primary to-primary-container text-on-primary-container text-xs font-bold
                     shadow-lg shadow-primary/10 active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {asking ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {asking ? 'A pensar…' : 'Perguntar'}
        </button>
      </form>

      {/* Sugestões só antes de haver resposta: depois, o foco é a resposta */}
      {!hasAnswer && !asking && (
        <SuggestedQuestions
          questions={questions}
          loading={loadingQuestions}
          disabled={blocked}
          onSelect={handleSuggestion}
        />
      )}

      {error && <InsightError error={error} onExpire={handleExpire} onRetry={handleRetry} />}

      {asking && (
        <div className="space-y-3 pt-2">
          <div className="h-4 w-3/4 shimmer rounded" />
          <div className="h-4 w-full shimmer rounded" />
          <div className="h-4 w-2/3 shimmer rounded" />
          {slow && (
            <p className="text-xs text-on-surface-variant/70">
              Ainda a processar — perguntas com muito contexto podem levar algumas dezenas de segundos.
            </p>
          )}
        </div>
      )}

      {hasAnswer && (
        <div className="space-y-5 pt-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-wider text-on-surface-variant">Resposta</p>
            <button
              type="button"
              onClick={startOver}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-on-surface-variant
                         hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <RotateCcw size={12} />
              Nova pergunta
            </button>
          </div>

          {/* Sem evidência é um estado informativo, não uma falha */}
          {!result.llm_called ? (
            <div className="flex items-start gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-high/60 p-4">
              <Info size={16} className="text-on-surface-variant flex-shrink-0 mt-0.5" />
              <div className="text-sm text-on-surface-variant space-y-2 min-w-0">
                <p>{result.answer}</p>
                {appliedFilters.length > 0 ? (
                  <>
                    {/* O utilizador clicou num chip — não sabe que havia filtro por baixo */}
                    <p className="text-xs opacity-80">
                      Esta pergunta aplicou filtros: <span className="font-medium">{appliedFilters.join(' · ')}</span>.
                      Pode não haver comentários analisados que os satisfaçam.
                    </p>
                    <button
                      type="button"
                      onClick={askWithoutFilters}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium
                                 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <FilterX size={13} />
                      Perguntar sem filtros
                    </button>
                  </>
                ) : (
                  <p className="text-xs opacity-80">
                    Tente reformular a pergunta de forma mais concreta.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {usedFallback && (
                <p className="text-xs text-on-surface-variant/80 flex items-start gap-2">
                  <Info size={13} className="flex-shrink-0 mt-0.5" />
                  A busca semântica não encontrou comentários suficientes; esta resposta usa uma amostra
                  equilibrada{appliedFilters.length > 0 ? ' com os mesmos filtros' : ''}.
                </p>
              )}
              <div className="rounded-xl border border-primary/15 bg-surface-container-high/60 p-5">
                <p className="text-[15px] text-on-surface leading-7 whitespace-pre-wrap">
                  {renderCitations(result.answer, result.sources.length, focusIndex)}
                </p>
              </div>
            </div>
          )}

          <EvidenceList
            sources={result.sources}
            strategyUsed={result.strategy_used}
            commentsInContext={result.comments_in_context}
            registerRef={registerRef}
          />
        </div>
      )}
    </div>
  );
}
