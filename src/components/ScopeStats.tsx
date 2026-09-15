import { Activity, Clapperboard, MessageSquare, Smile } from 'lucide-react';
import { sentimentMeta } from './SummaryCards';

export interface ScopeStatsData {
  total_videos: number;
  total_comments: number;
  analyzed_comments: number;
  average_sentiment: number | null;
}

interface Props {
  data: ScopeStatsData | null;
  loading: boolean;
  /** Rótulo do primeiro cartão, que muda com o âmbito (canal, global). */
  videosLabel?: string;
  sentimentLabel?: string;
  /**
   * O cartão de sentimento só faz sentido num âmbito real. Somar a média de
   * canais diferentes num número só não descreve nada, por isso a Visão Geral
   * dispensa-o e deixa o sentimento para a tela do canal e a do vídeo.
   */
  showSentiment?: boolean;
}

const fmt = (n: number) => n.toLocaleString('pt-PT');

/** Os números que resumem um âmbito: vídeos, comentários, cobertura e, quando o âmbito é um só, sentimento. */
export function ScopeStats({
  data,
  loading,
  videosLabel = 'Vídeos',
  sentimentLabel = 'Sentimento médio',
  showSentiment = true,
}: Props) {
  const coverage = data && data.total_comments > 0
    ? Math.round((data.analyzed_comments / data.total_comments) * 100)
    : 0;
  const meta = sentimentMeta(data?.average_sentiment ?? null);

  const stats = [
    {
      icon: Clapperboard,
      iconClass: 'text-primary bg-primary/10',
      label: videosLabel,
      value: fmt(data?.total_videos ?? 0),
      sub: null as string | null,
      progress: null as number | null,
      valueClass: 'text-on-surface',
    },
    {
      icon: MessageSquare,
      iconClass: 'text-secondary bg-secondary/10',
      label: 'Comentários',
      value: fmt(data?.total_comments ?? 0),
      sub: null as string | null,
      progress: null as number | null,
      valueClass: 'text-on-surface',
    },
    {
      icon: Activity,
      iconClass: 'text-tertiary bg-tertiary/10',
      label: 'Comentários analisados',
      value: fmt(data?.analyzed_comments ?? 0),
      sub: `${coverage}% cobertura`,
      progress: coverage,
      valueClass: 'text-on-surface',
    },
  ];

  if (showSentiment) {
    stats.push({
      icon: Smile,
      iconClass: 'text-green-400 bg-green-500/10',
      label: sentimentLabel,
      value: data?.average_sentiment != null ? data.average_sentiment.toFixed(1) : '—',
      sub: data?.average_sentiment != null ? '/ 5' : 'sem dados',
      progress: null as number | null,
      valueClass: meta.color,
    });
  }

  return (
    <div className={`grid grid-cols-2 gap-4 ${showSentiment ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
      {stats.map(s => (
        <div key={s.label} className="glass-card rounded-2xl p-4 flex flex-col gap-3">
          <div className={`p-2 rounded-lg w-fit ${s.iconClass}`}>
            <s.icon size={16} />
          </div>
          {loading ? (
            <div className="h-7 w-16 shimmer rounded" />
          ) : (
            <>
              <div>
                <p className={`text-2xl font-black leading-tight ${s.valueClass}`}>{s.value}</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">{s.label}</p>
              </div>
              {s.sub && (
                <p className={`text-[10px] font-bold tracking-wide ${s.progress != null ? 'text-tertiary' : 'text-on-surface-variant/70'}`}>
                  {s.sub.toUpperCase()}
                </p>
              )}
              {s.progress != null && (
                <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary transition-all" style={{ width: `${s.progress}%` }} />
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
