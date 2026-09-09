import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CommentDetail } from '../../api/types';
import { CommentCard } from './CommentCard';

interface Props {
  title: string;
  /** Ordem canónica das evidências — define o número da citação [n]. */
  evidenceIds: string[];
  comments: CommentDetail[] | null;
  loading: boolean;
  error: Error | null;
  /** Citação clicada (1-based); null quando aberto pelo rodapé do card. */
  initialIndex: number | null;
  onRetry: () => void;
  onClose: () => void;
}

/**
 * Mostra UM comentário de cada vez — o que foi citado — com navegação para os
 * restantes. Uma lista completa dentro do modal era o que tornava a leitura
 * difícil; aqui o comentário clicado ocupa o ecrã inteiro.
 */
export function EvidenceModal({
  title,
  evidenceIds,
  comments,
  loading,
  error,
  initialIndex,
  onRetry,
  onClose,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Posição 1-based em `evidence_ids` — é o número que aparece na citação
  const [target, setTarget] = useState<number | null>(initialIndex);

  // Números de citação dos comentários que o back devolveu, na ordem pedida
  const positions = useMemo(
    () => (comments ?? []).map(c => evidenceIds.indexOf(c.id) + 1),
    [comments, evidenceIds],
  );

  const currentIdx = target == null ? (positions.length > 0 ? 0 : -1) : positions.indexOf(target);
  const current = currentIdx >= 0 ? comments![currentIdx] : null;
  // Citação que aponta para um comentário que o back já não devolve
  const citedIsGone = comments != null && target != null && currentIdx < 0;

  const go = useCallback(
    (delta: number) => {
      if (positions.length === 0) return;
      if (currentIdx < 0) { setTarget(positions[0]); return; }
      const next = currentIdx + delta;
      if (next < 0 || next >= positions.length) return;
      setTarget(positions[next]);
    },
    [currentIdx, positions],
  );

  // Escape fecha, setas navegam; o scroll do body fica travado enquanto aberto
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, go]);

  const navClass =
    'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-on-surface-variant ' +
    'hover:text-on-surface hover:bg-surface-container-high transition-colors ' +
    'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent';

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto
                 bg-surface/80 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Comentário que fundamenta: ${title}`}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl my-auto rounded-2xl border border-outline-variant/20
                   bg-surface-container-low shadow-2xl focus:outline-none"
      >
        <header className="flex items-start justify-between gap-4 border-b border-outline-variant/20 p-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{title}</p>
            <h4 className="text-lg font-bold text-on-surface mt-0.5">
              {current != null ? `Comentário ${positions[currentIdx]}` : 'Comentário citado'}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex-shrink-0 rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high
                       hover:text-on-surface transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        <div className="p-5">
          {loading && <div className="h-40 rounded-xl shimmer" />}

          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">
              <p>Não foi possível carregar este comentário.</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 rounded-lg bg-error/15 px-3 py-1.5 text-xs font-semibold hover:bg-error/25 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {current && (
            <CommentCard
              index={positions[currentIdx]}
              author={current.author}
              text={current.text}
              publishedAt={current.published_at}
              sentiment={current.sentiment}
              intent={current.intent}
              product={current.product_mentioned}
            />
          )}

          {citedIsGone && (
            <p className="text-sm text-on-surface-variant text-center py-8">
              O comentário {target} já não está disponível.
              {positions.length > 0 && ' Use as setas para ver os restantes.'}
            </p>
          )}

          {comments != null && comments.length === 0 && !error && (
            <p className="text-sm text-on-surface-variant text-center py-8">
              Os comentários que fundamentaram este insight já não estão disponíveis.
            </p>
          )}
        </div>

        {/* Navegação só quando há mais de um comentário a citar */}
        {positions.length > 1 && (
          <footer className="flex items-center justify-between gap-3 border-t border-outline-variant/20 px-5 py-3">
            <button type="button" onClick={() => go(-1)} disabled={currentIdx <= 0} className={navClass}>
              <ChevronLeft size={14} />
              Anterior
            </button>
            <span className="text-[11px] text-on-surface-variant/70">
              {currentIdx >= 0 ? `${currentIdx + 1} de ${positions.length}` : `${positions.length} comentários`}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={currentIdx >= positions.length - 1}
              className={navClass}
            >
              Seguinte
              <ChevronRight size={14} />
            </button>
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
