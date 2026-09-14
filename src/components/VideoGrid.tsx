import { Activity, Calendar, MessageSquare, Tv } from 'lucide-react';
import type { VideoOverviewItem } from '../api/types';
import { sentimentMeta } from './SummaryCards';

interface Props {
  videos: VideoOverviewItem[];
  loading: boolean;
  /** Mostra o canal em cada cartão; desnecessário dentro de um canal. */
  showChannel?: boolean;
  onSelect: (youtubeId: string) => void;
}

const thumbnail = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
const fmt = (n: number) => n.toLocaleString('pt-PT');

/** Grelha de vídeos de um âmbito, cada cartão com as suas métricas. */
export function VideoGrid({ videos, loading, showChannel = false, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {loading
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-surface-container-high">
              <div className="aspect-video shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-3/4 shimmer rounded" />
                <div className="h-2.5 w-1/2 shimmer rounded" />
              </div>
            </div>
          ))
        : videos.map(v => {
            const isLive = v.analyzed_comments < v.total_comments;
            const pct = v.total_comments > 0
              ? Math.round((v.analyzed_comments / v.total_comments) * 100)
              : 0;
            const m = v.average_sentiment != null ? sentimentMeta(v.average_sentiment) : null;
            return (
              <button
                key={v.youtube_id}
                type="button"
                onClick={() => onSelect(v.youtube_id)}
                className="group text-left glass-card rounded-2xl overflow-hidden hover:border-primary/30 hover:-translate-y-1 transition-all duration-200 flex flex-col cursor-pointer"
              >
                <div className="relative aspect-video bg-surface-dim overflow-hidden">
                  <img
                    src={thumbnail(v.youtube_id)}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                  />
                  {isLive && (
                    <span className="absolute top-2 left-2 flex items-center gap-1.5 text-[9px] font-bold text-tertiary px-2 py-0.5 rounded bg-black/60 tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" />
                      AO VIVO
                    </span>
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver relatório →
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-sm font-bold text-on-surface leading-snug line-clamp-2">
                    {v.titulo ?? v.youtube_id}
                  </p>
                  {showChannel && (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-primary/80 truncate">
                      <Tv size={10} className="shrink-0" />
                      <span className="truncate">{v.channel_title ?? 'Canal não identificado'}</span>
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-on-surface-variant">
                    <span className="font-mono truncate">{v.youtube_id}</span>
                    <span className="text-outline">•</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar size={10} />
                      {new Date(v.created_at).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-outline-variant/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        {fmt(v.total_comments)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity size={12} />
                        {pct}%
                      </span>
                    </div>
                    {m && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${m.bg} ${m.color}`}>
                        {m.label.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
    </div>
  );
}
