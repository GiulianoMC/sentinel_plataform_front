import { MessageSquare, Activity, Smile } from 'lucide-react';
import type { VideoSummary } from '../api/types';

function sentimentMeta(avg: number | null): { label: string; color: string } {
  if (avg === null) return { label: '—', color: 'text-on-surface-variant' };
  if (avg >= 4.5) return { label: 'Excelente', color: 'text-green-400' };
  if (avg >= 3.5) return { label: 'Positivo', color: 'text-green-400' };
  if (avg >= 2.5) return { label: 'Neutro', color: 'text-primary' };
  if (avg >= 1.5) return { label: 'Negativo', color: 'text-error' };
  return { label: 'Crítico', color: 'text-error' };
}

function Shimmer() {
  return <div className="h-10 w-28 shimmer rounded-lg mt-1" />;
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Comments */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageSquare className="text-primary" size={20} />
          </div>
          <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 tracking-wider">LIVE</span>
        </div>
        <p className="text-sm font-medium text-on-surface-variant mb-1">Total Comments</p>
        {loading ? (
          <Shimmer />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-on-surface">{data?.total_comments ?? 0}</span>
          </div>
        )}
        <div className="mt-4 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary w-2/3" />
        </div>
      </div>

      {/* Analyzed */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full blur-3xl group-hover:bg-tertiary/10 transition-colors" />
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg bg-tertiary/10">
            <Activity className="text-tertiary" size={20} />
          </div>
          <span className="text-[10px] font-bold text-tertiary px-2 py-0.5 rounded bg-tertiary/10 tracking-wider">SYNCED</span>
        </div>
        <p className="text-sm font-medium text-on-surface-variant mb-1">Analyzed</p>
        {loading ? (
          <Shimmer />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-on-surface">{data?.analyzed_comments ?? 0}</span>
            <span className="text-xs text-tertiary/60 font-medium">{coveragePct}% Coverage</span>
          </div>
        )}
        <div className={`mt-4 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden ${loading ? 'shimmer opacity-20' : ''}`}>
          {!loading && (
            <div className="h-full bg-tertiary transition-all" style={{ width: `${coveragePct}%` }} />
          )}
        </div>
      </div>

      {/* Avg Sentiment */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-colors" />
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Smile className="text-green-400" size={20} />
          </div>
          {!loading && data?.average_sentiment != null && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className={`text-[10px] font-bold tracking-wider uppercase ${meta.color}`}>{meta.label}</span>
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-on-surface-variant mb-1">Average Sentiment</p>
        {loading ? (
          <Shimmer />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-black ${meta.color}`}>
              {data?.average_sentiment != null ? data.average_sentiment.toFixed(1) : '—'}
            </span>
            {data?.average_sentiment != null && (
              <span className={`text-xs font-medium opacity-60 ${meta.color}`}>/ 5</span>
            )}
          </div>
        )}
        {!loading && data?.average_sentiment != null && (
          <div className="mt-4 flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i <= Math.round(data.average_sentiment!) ? 'bg-green-400' : 'bg-green-400/20'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
