import { MessageSquare, Activity, Smile } from 'lucide-react';
import type { VideoSummary } from '../api/types';

function sentimentMeta(avg: number | null): { label: string; color: string } {
  if (avg === null) return { label: '—', color: 'text-on-surface-variant' };
  if (avg >= 4.5) return { label: 'Excelente', color: 'text-green-400' };
  if (avg >= 3.5) return { label: 'Positivo',  color: 'text-green-400' };
  if (avg >= 2.5) return { label: 'Neutro',    color: 'text-primary' };
  if (avg >= 1.5) return { label: 'Negativo',  color: 'text-error' };
  return              { label: 'Crítico',    color: 'text-error' };
}

interface Props {
  data: VideoSummary | null;
  loading: boolean;
}

export function SummaryCards({ data, loading }: Props) {
  const meta = sentimentMeta(data?.average_sentiment ?? null);
  const coveragePct =
    data && data.total_comments > 0
      ? Math.round((data.analyzed_comments / data.total_comments) * 100)
      : 0;
  const isLive = !loading && data != null && data.analyzed_comments < data.total_comments;

  return (
    <div className="glass-card rounded-2xl flex items-stretch divide-x divide-outline-variant/15">
      {/* Total de Comentários */}
      <div className="flex-1 flex items-center gap-4 px-6 py-4">
        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
          <MessageSquare className="text-primary" size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-on-surface-variant font-medium">Total de Comentários</p>
          {loading
            ? <div className="h-7 w-16 shimmer rounded mt-1" />
            : <p className="text-2xl font-black text-on-surface leading-tight">{data?.total_comments ?? 0}</p>
          }
        </div>
        {isLive && (
          <span className="ml-auto text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 tracking-wider self-start mt-1 animate-pulse">
            AO VIVO
          </span>
        )}
      </div>

      {/* Analisados */}
      <div className="flex-1 flex items-center gap-4 px-6 py-4">
        <div className="p-2 rounded-lg bg-tertiary/10 flex-shrink-0">
          <Activity className="text-tertiary" size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-on-surface-variant font-medium">Analisados</p>
          {loading
            ? <div className="h-7 w-20 shimmer rounded mt-1" />
            : (
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-on-surface leading-tight">{data?.analyzed_comments ?? 0}</p>
                <span className="text-xs text-tertiary/70 font-medium">{coveragePct}% Cobertura</span>
              </div>
            )
          }
          {!loading && (
            <div className="mt-1.5 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-tertiary transition-all" style={{ width: `${coveragePct}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* Sentimento Médio */}
      <div className="flex-1 flex items-center gap-4 px-6 py-4">
        <div className="p-2 rounded-lg bg-green-500/10 flex-shrink-0">
          <Smile className="text-green-400" size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-on-surface-variant font-medium">Sentimento Médio</p>
          {loading
            ? <div className="h-7 w-16 shimmer rounded mt-1" />
            : (
              <div className="flex items-baseline gap-1.5">
                <p className={`text-2xl font-black leading-tight ${meta.color}`}>
                  {data?.average_sentiment != null ? data.average_sentiment.toFixed(1) : '—'}
                </p>
                {data?.average_sentiment != null && (
                  <span className={`text-xs font-medium opacity-60 ${meta.color}`}>/ 5</span>
                )}
              </div>
            )
          }
        </div>
        {!loading && data?.average_sentiment != null && (
          <div className="ml-auto flex gap-0.5 self-center">
            {[1,2,3,4,5].map(i => (
              <div
                key={i}
                className={`w-2 h-4 rounded-sm ${i <= Math.round(data.average_sentiment!) ? 'bg-green-400' : 'bg-green-400/15'}`}
              />
            ))}
          </div>
        )}
        {!loading && data?.average_sentiment != null && (
          <span className={`text-[10px] font-bold tracking-wider self-start mt-1 px-2 py-0.5 rounded bg-green-500/10 ${meta.color}`}>
            {meta.label.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
