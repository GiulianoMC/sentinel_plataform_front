import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import type { InsightCard, InsightCardKind, VideoOverviewItem } from '../../api/types';
import { useInsightsFeed } from '../../hooks/useInsightsFeed';
import { CARD_LABELS, CARD_ORDER } from '../insights/labels';

interface Props {
  /** Vídeos a resumir, já na ordem em que devem aparecer. */
  videos: VideoOverviewItem[];
  onOpenVideo: (youtubeId: string) => void;
}

const thumbnail = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

/** Primeiro cartão pronto, na ordem de importância definida em CARD_ORDER. */
function pickCard(cards: InsightCard[]): { kind: InsightCardKind; card: InsightCard } | null {
  for (const kind of CARD_ORDER) {
    const card = cards.find(c => c.kind === kind && c.status === 'ready' && c.content);
    if (card) return { kind, card };
  }
  return null;
}

/**
 * O que a IA já sintetizou dos vídeos mais recentes. É o widget que dá conteúdo
 * à Home: em vez de números, o que as pessoas realmente disseram.
 */
export function InsightsFeed({ videos, onOpenVideo }: Props) {
  const ids = videos.map(v => v.youtube_id);
  const { entries, loading } = useInsightsFeed(ids);

  if (videos.length === 0) return null;

  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-2">
        <Sparkles size={13} className="text-primary" />
        Insights recentes
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && entries.length === 0
          ? videos.map(v => <div key={v.youtube_id} className="h-48 rounded-2xl shimmer" />)
          : videos.map(v => {
              const entry = entries.find(e => e.youtubeId === v.youtube_id);
              const picked = entry?.data ? pickCard(entry.data.cards) : null;
              const generating = entry?.data?.generating ?? false;
              const stale = entry?.data?.stale ?? false;

              return (
                <button
                  key={v.youtube_id}
                  type="button"
                  onClick={() => onOpenVideo(v.youtube_id)}
                  className="group text-left glass-card rounded-2xl p-4 flex flex-col gap-3 hover:border-primary/30 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={thumbnail(v.youtube_id)}
                      alt=""
                      loading="lazy"
                      className="h-10 w-16 rounded-lg object-cover bg-surface-dim shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-on-surface leading-snug line-clamp-2">
                        {v.titulo ?? v.youtube_id}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        {picked && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary tracking-wide">
                            {CARD_LABELS[picked.kind].toUpperCase()}
                          </span>
                        )}
                        {generating && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-tertiary">
                            <Loader2 size={9} className="animate-spin" />
                            A GERAR
                          </span>
                        )}
                        {stale && !generating && (
                          <span className="text-[9px] font-bold text-tertiary/80">DESATUALIZADO</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight
                      size={15}
                      className="shrink-0 text-on-surface-variant/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                    />
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-5 flex-1">
                    {picked
                      ? picked.card.content
                      : entry?.error
                        ? 'Não foi possível carregar a síntese deste vídeo.'
                        : generating
                          ? 'A IA está a escrever a síntese deste vídeo.'
                          : 'Ainda sem síntese. Abra o vídeo para gerar os insights.'}
                  </p>
                </button>
              );
            })}
      </div>
    </section>
  );
}
