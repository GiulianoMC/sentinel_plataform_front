import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, FileText, HelpCircle, MessagesSquare, RefreshCw, ThumbsUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useInsightCards } from '../../hooks/useInsightCards';
import { fetchCommentsByIds } from '../../api/insights';
import type { CommentDetail, InsightCard, InsightCardKind } from '../../api/types';
import { EvidenceModal } from './EvidenceModal';
import { renderCitations } from './citations';
import { CARD_LABELS, CARD_ORDER, formatDateTime } from './labels';

const CARD_ICONS: Record<InsightCardKind, LucideIcon> = {
  resumo: FileText,
  reclamacao_principal: AlertTriangle,
  elogio_principal: ThumbsUp,
  duvidas: HelpCircle,
};

const MIN_ANALYZED = 5;

interface Props {
  youtubeId: string;
}

export function InsightCards({ youtubeId }: Props) {
  const { data, loading, error, regenerate, regenerating } = useInsightCards(youtubeId);

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CARD_ORDER.map(kind => <div key={kind} className="h-40 rounded-2xl shimmer" />)}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="glass-card rounded-2xl p-4 border border-error/20 text-error text-sm">
        {error.message}
      </div>
    );
  }

  if (!data) return null;

  // cards: [] só acontece com menos de 5 analisados — e aí gerar também não
  // funcionaria, por isso não há botão, só o estado de espera.
  if (data.cards.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <p className="text-sm text-on-surface-variant">
          A aguardar a análise dos comentários ({data.analyzed_now} de {MIN_ANALYZED}).
        </p>
        <p className="text-xs text-on-surface-variant/70 mt-1">
          Os insights são gerados automaticamente assim que houver comentários analisados suficientes.
        </p>
      </div>
    );
  }

  const byKind = new Map(data.cards.map(c => [c.kind, c] as const));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[11px] uppercase tracking-wider text-on-surface-variant">Insights do vídeo</h3>
        <div className="flex items-center gap-2">
          {data.generating && (
            <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 tracking-wider animate-pulse">
              A GERAR…
            </span>
          )}
          {data.stale && !data.generating && (
            <span className="text-[10px] font-bold text-tertiary px-2 py-0.5 rounded bg-tertiary/10 tracking-wider">
              DADOS DESATUALIZADOS
            </span>
          )}
          <button
            type="button"
            onClick={regenerate}
            disabled={regenerating || data.generating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-[11px] font-semibold
                       border border-outline-variant/10 hover:bg-surface-container-highest transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={12} className={regenerating || data.generating ? 'animate-spin' : ''} />
            Atualizar insights
          </button>
        </div>
      </div>

      {/* Duas colunas: a 4-up deixava ~300px por card, estreito de mais para
          um parágrafo com citações. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CARD_ORDER.map(kind => (
          <InsightCardTile
            key={kind}
            kind={kind}
            card={byKind.get(kind) ?? null}
            youtubeId={youtubeId}
          />
        ))}
      </div>
    </div>
  );
}

interface TileProps {
  kind: InsightCardKind;
  card: InsightCard | null;
  youtubeId: string;
}

function InsightCardTile({ kind, card, youtubeId }: TileProps) {
  const Icon = CARD_ICONS[kind];

  // `card` é um objeto novo a cada poll, e `evidence_ids` um array novo com ele.
  // A chave estável evita refetch em loop e serve de sinal de invalidação
  // quando o card é regenerado com outras evidências.
  const idsKey = (card?.evidence_ids ?? []).join(',');
  const evidenceIds = useMemo(() => (idsKey ? idsKey.split(',') : []), [idsKey]);
  const evidenceCount = evidenceIds.length;

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [evidence, setEvidence] = useState<CommentDetail[] | null>(null);
  const [evidenceError, setEvidenceError] = useState<Error | null>(null);

  // Estado de carregamento derivado, não guardado: um `loading` em useState
  // teria de entrar nas deps do efeito abaixo, e a sua própria atualização
  // reexecutaria o efeito — cujo cleanup abortaria o pedido acabado de criar.
  const loadingEvidence = modalOpen && evidenceCount > 0 && evidence == null && evidenceError == null;

  // Card regenerado (ou vídeo trocado) invalida as evidências em cache
  useEffect(() => {
    setEvidence(null);
    setEvidenceError(null);
  }, [idsKey, youtubeId]);

  // Carregamento lazy: só busca quando o modal abre pela primeira vez, e o
  // resultado fica em cache para as aberturas seguintes. Resolver os 4 cards no
  // arranque do painel seriam 4 requisições que quase ninguém abre.
  useEffect(() => {
    if (!modalOpen || evidenceCount === 0) return;
    if (evidence != null || evidenceError != null) return;

    const controller = new AbortController();

    fetchCommentsByIds(youtubeId, evidenceIds, controller.signal)
      .then(res => { if (!controller.signal.aborted) setEvidence(res); })
      .catch((err: Error) => { if (!controller.signal.aborted) setEvidenceError(err); });

    // Fechar, trocar de vídeo ou regenerar o card cancela o pedido em voo
    return () => controller.abort();
  }, [modalOpen, evidence, evidenceError, evidenceCount, evidenceIds, youtubeId]);

  // Clicar numa citação abre o modal já focado nesse comentário
  const openAt = useCallback((index: number | null) => {
    setOpenIndex(index);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setOpenIndex(null);
  }, []);

  const retry = useCallback(() => setEvidenceError(null), []);

  // `pending` sem conteúdo é a primeira geração; com conteúdo é uma atualização
  // sobre um card antigo, que continua legível enquanto atualiza.
  const isFirstGeneration = card == null || (card.status === 'pending' && card.content == null);

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 min-h-[10rem]">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon size={15} className="text-primary" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
          {CARD_LABELS[kind]}
        </p>
        {card?.status === 'error' && (
          <AlertTriangle size={13} className="text-error ml-auto" aria-label="Falha ao gerar este insight" />
        )}
      </div>

      {isFirstGeneration ? (
        <div className="space-y-2">
          <div className="h-3 w-full shimmer rounded" />
          <div className="h-3 w-5/6 shimmer rounded" />
          <div className="h-3 w-2/3 shimmer rounded" />
        </div>
      ) : (
        <p
          className={`text-sm leading-7 flex-1 whitespace-pre-wrap ${
            card!.status === 'pending' ? 'text-on-surface-variant/50' : 'text-on-surface'
          }`}
        >
          {renderCitations(card!.content ?? '', evidenceCount, openAt)}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 text-[10px] text-on-surface-variant/70 pt-1">
        {card?.status === 'pending' && card.content != null ? (
          <span>a atualizar…</span>
        ) : (
          card?.generated_at && <span>{formatDateTime(card.generated_at)}</span>
        )}
        {evidenceCount > 0 && (
          <button
            type="button"
            onClick={() => openAt(null)}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-medium
                       text-primary hover:bg-primary/20 transition-colors"
          >
            <MessagesSquare size={11} />
            Ver {evidenceCount} comentário(s)
          </button>
        )}
      </div>

      {modalOpen && (
        <EvidenceModal
          // Remonta se a citação de origem mudar: o modo "só este comentário"
          // é estado inicial interno do modal.
          key={openIndex ?? 'todos'}
          title={CARD_LABELS[kind]}
          evidenceIds={evidenceIds}
          comments={evidence}
          loading={loadingEvidence}
          error={evidenceError}
          initialIndex={openIndex}
          onRetry={retry}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
