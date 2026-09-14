import { MessageSquare, ThumbsUp, TrendingDown } from 'lucide-react';
import type { VideoOverviewItem } from '../../api/types';
import { sentimentMeta } from '../SummaryCards';

/** Abaixo disto a média é ruído estatístico, não sinal. */
const MIN_ANALYZED = 5;

interface Props {
  videos: VideoOverviewItem[];
  loading: boolean;
  mode: 'atencao' | 'melhores';
  onOpenVideo: (youtubeId: string) => void;
}

const fmt = (n: number) => n.toLocaleString('pt-PT');

/**
 * Extremos do sentimento entre os vídeos. Um ranking diz onde ir a seguir, o
 * que a média global nunca diz.
 */
export function SentimentRanking({ videos, loading, mode, onOpenVideo }: Props) {
  const attention = mode === 'atencao';

  const ranked = videos
    .filter(v => v.average_sentiment != null && v.analyzed_comments >= MIN_ANALYZED)
    .sort((a, b) => attention
      ? (a.average_sentiment ?? 0) - (b.average_sentiment ?? 0)
      : (b.average_sentiment ?? 0) - (a.average_sentiment ?? 0))
    .slice(0, 4);

  const Icon = attention ? TrendingDown : ThumbsUp;

  return (
    <div className="glass-card rounded-2xl p-5 h-full flex flex-col">
      <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-3">
        <Icon size={13} className={attention ? 'text-error' : 'text-green-400'} />
        {attention ? 'Pedem atenção' : 'Melhor recebidos'}
      </h3>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map(i => <div key={i} className="h-9 shimmer rounded-lg" />)}
        </div>
      ) : ranked.length === 0 ? (
        <p className="text-xs text-on-surface-variant/70 flex-1">
          Sem vídeos com {MIN_ANALYZED} ou mais comentários analisados. O ranking aparece quando a
          análise avançar.
        </p>
      ) : (
        <ol className="space-y-2 flex-1">
          {ranked.map((v, i) => {
            const m = sentimentMeta(v.average_sentiment);
            return (
              <li key={v.youtube_id}>
                <button
                  type="button"
                  onClick={() => onOpenVideo(v.youtube_id)}
                  className="w-full flex items-center gap-3 text-left rounded-xl px-2 py-1.5 -mx-2 transition-colors hover:bg-surface-container-high/60 cursor-pointer group"
                >
                  <span className="text-[10px] font-black text-on-surface-variant/40 w-3 shrink-0 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-medium text-on-surface truncate group-hover:text-primary transition-colors">
                      {v.titulo ?? v.youtube_id}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-on-surface-variant/70">
                      <MessageSquare size={9} />
                      {fmt(v.analyzed_comments)} analisados
                    </span>
                  </span>
                  <span className={`shrink-0 text-sm font-black tabular-nums ${m.color}`}>
                    {v.average_sentiment?.toFixed(1)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
