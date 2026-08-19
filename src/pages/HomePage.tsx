import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  ChevronRight,
  Clapperboard,
  MessageSquare,
  PlusSquare,
  RefreshCw,
  Smile,
} from 'lucide-react';
import { fetchOverview } from '../api/analytics';
import type { Video, VideoOverview } from '../api/types';
import { sentimentMeta } from '../components/SummaryCards';

const thumbnail = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

const fmt = (n: number) => n.toLocaleString('pt-PT');

interface Props {
  videos: Video[];
  onSelectVideo: (id: string) => void;
  onRegister: () => void;
}

export function HomePage({ videos, onSelectVideo, onRegister }: Props) {
  const [overview, setOverview] = useState<VideoOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchOverview()
      .then(setOverview)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Recarrega quando a lista de vídeos muda (registo/apagar)
  useEffect(() => {
    load();
  }, [load, videos]);

  const coverage = useMemo(() => {
    if (!overview || overview.total_comments === 0) return 0;
    return Math.round((overview.analyzed_comments / overview.total_comments) * 100);
  }, [overview]);

  const sentiment = sentimentMeta(overview?.average_sentiment ?? null);

  const stats = [
    {
      icon: Clapperboard,
      iconClass: 'text-primary bg-primary/10',
      label: 'Vídeos registados',
      value: String(overview?.total_videos ?? 0),
      sub: null as string | null,
      progress: null as number | null,
      valueClass: 'text-on-surface',
    },
    {
      icon: MessageSquare,
      iconClass: 'text-secondary bg-secondary/10',
      label: 'Comentários',
      value: fmt(overview?.total_comments ?? 0),
      sub: null as string | null,
      progress: null as number | null,
      valueClass: 'text-on-surface',
    },
    {
      icon: Activity,
      iconClass: 'text-tertiary bg-tertiary/10',
      label: 'Comentários analisados',
      value: fmt(overview?.analyzed_comments ?? 0),
      sub: `${coverage}% cobertura`,
      progress: coverage,
      valueClass: 'text-on-surface',
    },
    {
      icon: Smile,
      iconClass: 'text-green-400 bg-green-500/10',
      label: 'Sentimento médio geral',
      value: overview?.average_sentiment != null ? overview.average_sentiment.toFixed(1) : '—',
      sub: overview?.average_sentiment != null ? '/ 5' : 'sem dados',
      progress: null as number | null,
      valueClass: sentiment.color,
    },
  ];

  const empty = !loading && !error && overview != null && overview.videos.length === 0;

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-[10px] text-primary/50 uppercase tracking-widest mb-1">
            <span>Início</span>
            <ChevronRight size={12} />
            <span>Visão Geral</span>
          </nav>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#dae2fd]">
            Visão Geral
          </h2>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-tr from-primary to-primary-container text-on-primary-container text-xs font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-fit"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Erros */}
      {error && (
        <div className="glass-card rounded-xl p-4 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      {/* Sem vídeos */}
      {empty && (
        <div className="glass-card rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Clapperboard size={28} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Nenhum vídeo registado ainda</p>
            <p className="text-xs text-on-surface-variant mt-1">
              Registe um vídeo do YouTube para começar a analisar os comentários.
            </p>
          </div>
          <button
            onClick={onRegister}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
          >
            <PlusSquare size={16} />
            Registar primeiro vídeo
          </button>
        </div>
      )}

      {/* Dados gerais agregados */}
      {!empty && (
        <>
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
              Dados Gerais
            </h3>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
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
                        <p className={`text-2xl font-black leading-tight ${s.valueClass}`}>
                          {s.value}
                        </p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">{s.label}</p>
                      </div>
                      {s.sub && (
                        <p className={`text-[10px] font-bold tracking-wide ${s.progress != null ? 'text-tertiary' : 'text-on-surface-variant/70'}`}>
                          {s.sub.toUpperCase()}
                        </p>
                      )}
                      {s.progress != null && (
                        <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                          <div
                            className="h-full bg-tertiary transition-all"
                            style={{ width: `${s.progress}%` }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Grelha de vídeos */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
              Vídeos
            </h3>
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
                : (overview?.videos ?? []).map(v => {
                    const isLive = v.analyzed_comments < v.total_comments;
                    const pct =
                      v.total_comments > 0
                        ? Math.round((v.analyzed_comments / v.total_comments) * 100)
                        : 0;
                    const m = v.average_sentiment != null ? sentimentMeta(v.average_sentiment) : null;
                    return (
                      <button
                        key={v.youtube_id}
                        type="button"
                        onClick={() => onSelectVideo(v.youtube_id)}
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
                            Ver análise →
                          </span>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <p className="text-sm font-bold text-on-surface leading-snug line-clamp-2">
                            {v.titulo ?? v.youtube_id}
                          </p>
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
          </section>
        </>
      )}
    </div>
  );
}