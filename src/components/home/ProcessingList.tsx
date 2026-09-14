import { Activity, CheckCircle2 } from 'lucide-react';
import type { VideoOverviewItem } from '../../api/types';

interface Props {
  videos: VideoOverviewItem[];
  loading: boolean;
  onOpenVideo: (youtubeId: string) => void;
}

const fmt = (n: number) => n.toLocaleString('pt-PT');

/**
 * Vídeos com comentários ainda por analisar. Diz de relance se os números da
 * Home ainda vão mudar, em vez de deixar o utilizador a desconfiar deles.
 */
export function ProcessingList({ videos, loading, onOpenVideo }: Props) {
  const pending = videos
    .filter(v => v.analyzed_comments < v.total_comments)
    .sort((a, b) => (b.total_comments - b.analyzed_comments) - (a.total_comments - a.analyzed_comments));

  return (
    <div className="glass-card rounded-2xl p-5 h-full flex flex-col">
      <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-3">
        <Activity size={13} className="text-tertiary" />
        Em processamento
        {!loading && pending.length > 0 && (
          <span className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-tertiary">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" />
            AO VIVO
          </span>
        )}
      </h3>

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map(i => <div key={i} className="h-10 shimmer rounded-lg" />)}
        </div>
      ) : pending.length === 0 ? (
        <p className="text-xs text-on-surface-variant/70 flex items-start gap-2 flex-1">
          <CheckCircle2 size={14} className="text-green-400 shrink-0 mt-0.5" />
          Todos os comentários registados já foram analisados.
        </p>
      ) : (
        <ul className="space-y-3 flex-1">
          {pending.slice(0, 4).map(v => {
            const pct = v.total_comments > 0
              ? Math.round((v.analyzed_comments / v.total_comments) * 100)
              : 0;
            return (
              <li key={v.youtube_id}>
                <button
                  type="button"
                  onClick={() => onOpenVideo(v.youtube_id)}
                  className="w-full text-left group cursor-pointer"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[12px] font-medium text-on-surface truncate group-hover:text-primary transition-colors">
                      {v.titulo ?? v.youtube_id}
                    </p>
                    <span className="text-[10px] font-bold text-tertiary shrink-0 tabular-nums">{pct}%</span>
                  </div>
                  <div className="mt-1 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] text-on-surface-variant/70">
                    faltam {fmt(v.total_comments - v.analyzed_comments)} de {fmt(v.total_comments)}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
