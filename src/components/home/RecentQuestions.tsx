import { Clock, History, RotateCcw, Trash2, Tv, Video, X } from 'lucide-react';
import type { AskRequest, AskScope } from '../../api/types';
import { useAskHistory, type AskHistoryEntry } from '../../hooks/useAskHistory';
import { describeFilters } from '../insights/labels';

interface Props {
  /** Repete a pergunta: troca o âmbito para o dela e reenvia. */
  onRepeat: (scope: AskScope, request: AskRequest) => void;
}

function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  return new Date(iso).toLocaleDateString('pt-PT');
}

/**
 * Perguntas já feitas neste navegador. O backend não guarda histórico, por isso
 * sem esta lista cada visita à Home recomeçava do zero.
 */
export function RecentQuestions({ onRepeat }: Props) {
  const { entries, clear, remove } = useAskHistory();

  const repeat = (e: AskHistoryEntry) => {
    // A estratégia guardada é a que o backend usou; ao repetir deixa-se decidir
    // de novo, porque o contexto pode ter mudado desde então.
    onRepeat(e.scope, { question: e.question, strategy: 'auto', filters: e.filters });
  };

  return (
    <div className="glass-card rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
          <History size={13} className="text-primary" />
          Perguntas recentes
        </h3>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={clear}
            title="Limpar histórico"
            className="text-on-surface-variant/50 hover:text-error transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-on-surface-variant/70 flex-1">
          As perguntas que fizer à IA ficam aqui, para retomar uma investigação sem reescrever tudo.
        </p>
      ) : (
        <ul className="space-y-1.5 flex-1">
          {entries.slice(0, 5).map(e => {
            const filters = describeFilters(e.filters);
            return (
              <li key={`${e.scope.kind}:${e.scope.id}-${e.question}`} className="group relative">
                <button
                  type="button"
                  onClick={() => repeat(e)}
                  className="w-full text-left rounded-xl px-3 py-2.5 pr-8 transition-colors hover:bg-surface-container-high/60 cursor-pointer"
                >
                  <p className="text-[13px] text-on-surface leading-snug line-clamp-2">{e.question}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[10px] text-on-surface-variant/70 min-w-0">
                    <Clock size={10} className="shrink-0" />
                    {relative(e.askedAt)}
                    <span className="text-outline">•</span>
                    {e.scope.kind === 'channel'
                      ? <Tv size={10} className="shrink-0" />
                      : <Video size={10} className="shrink-0" />}
                    <span className="truncate">{e.scopeTitle ?? e.scope.id}</span>
                    {!e.answered && (
                      <span className="shrink-0 text-tertiary font-bold">sem evidência</span>
                    )}
                  </p>
                  {filters.length > 0 && (
                    <p className="mt-0.5 text-[10px] text-primary/60 truncate">{filters.join(' · ')}</p>
                  )}
                  <RotateCcw
                    size={12}
                    className="absolute right-3 top-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
                {/* Fora do botão principal: aninhar botões é inválido em HTML */}
                <button
                  type="button"
                  onClick={() => remove(e)}
                  aria-label="Remover do histórico"
                  className="absolute right-3 bottom-2.5 text-on-surface-variant opacity-0 group-hover:opacity-60 hover:text-error hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
