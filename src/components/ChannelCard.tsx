import { Activity, ArrowRight, Clapperboard, HelpCircle, MessageSquare, Tv } from 'lucide-react';
import type { ChannelOverviewItem } from '../api/types';
import { sentimentMeta } from './SummaryCards';

const fmt = (n: number) => n.toLocaleString('pt-PT');

interface Props {
  channel: ChannelOverviewItem;
  onOpen: (channelId: string) => void;
}

/**
 * Cartão de canal do ecrã inicial: os dados gerais daquele canal e a porta de
 * entrada para o seu detalhe. Substitui os KPIs globais, que misturavam canais.
 */
export function ChannelCard({ channel, onOpen }: Props) {
  const pct = channel.total_comments > 0
    ? Math.round((channel.analyzed_comments / channel.total_comments) * 100)
    : 0;
  const m = sentimentMeta(channel.average_sentiment);
  const title = channel.channel_title ?? channel.channel_id;

  return (
    <button
      type="button"
      onClick={() => onOpen(channel.channel_id)}
      aria-label={`Abrir canal ${title}`}
      className="group relative text-left glass-card rounded-2xl p-5 flex flex-col gap-4 overflow-hidden hover:border-primary/30 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
    >
      {/* Brilho de canto: dá profundidade sem introduzir cor nova */}
      <span className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-start gap-3">
        <span className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <Tv size={20} className="text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-on-surface leading-snug line-clamp-2">{title}</p>
          <p className="text-[10px] font-mono text-on-surface-variant/60 truncate mt-0.5">{channel.channel_id}</p>
        </div>
        <ArrowRight
          size={16}
          className="shrink-0 text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
        />
      </div>

      <div className="relative flex items-center gap-4 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <Clapperboard size={13} className="text-primary/70" />
          <span className="font-bold text-on-surface">{fmt(channel.total_videos)}</span>
          {channel.total_videos === 1 ? 'vídeo' : 'vídeos'}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageSquare size={13} className="text-secondary/80" />
          <span className="font-bold text-on-surface">{fmt(channel.total_comments)}</span>
          {channel.total_comments === 1 ? 'comentário' : 'comentários'}
        </span>
      </div>

      <div className="relative space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold tracking-wide">
          <span className="flex items-center gap-1 text-tertiary">
            <Activity size={11} />
            {pct}% ANALISADO
          </span>
          <span className="text-on-surface-variant/70">{fmt(channel.analyzed_comments)} de {fmt(channel.total_comments)}</span>
        </div>
        <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-tertiary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="relative flex items-center justify-between pt-3 border-t border-outline-variant/10">
        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant/70">Sentimento</span>
        {channel.average_sentiment != null ? (
          <span className="flex items-center gap-2">
            <span className={`text-lg font-black leading-none ${m.color}`}>
              {channel.average_sentiment.toFixed(1)}
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${m.bg} ${m.color}`}>
              {m.label.toUpperCase()}
            </span>
          </span>
        ) : (
          <span className="text-xs text-on-surface-variant/60">sem dados</span>
        )}
      </div>
    </button>
  );
}

interface NoChannelProps {
  count: number;
  onOpen: () => void;
}

/**
 * Cartão dos vídeos sem canal identificado. Não é um canal, por isso não tem
 * agregados do backend; serve só para esses vídeos terem caminho de navegação
 * antes de correr o backfill.
 */
export function NoChannelCard({ count, onOpen }: NoChannelProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Abrir vídeos sem canal identificado"
      className="group text-left glass-card rounded-2xl p-5 flex flex-col gap-4 border-dashed border-tertiary/30 hover:border-tertiary/60 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <span className="h-11 w-11 rounded-xl bg-tertiary/10 flex items-center justify-center shrink-0 group-hover:bg-tertiary/20 transition-colors">
          <HelpCircle size={20} className="text-tertiary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-on-surface leading-snug">Sem canal identificado</p>
          <p className="text-[10px] text-on-surface-variant/70 mt-0.5">Registados antes do filtro por canal</p>
        </div>
        <ArrowRight
          size={16}
          className="shrink-0 text-on-surface-variant/40 group-hover:text-tertiary group-hover:translate-x-0.5 transition-all"
        />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
        <Clapperboard size={13} className="text-tertiary/70" />
        <span className="font-bold text-on-surface">{fmt(count)}</span>
        {count === 1 ? 'vídeo' : 'vídeos'}
      </div>

      <p className="text-[11px] text-on-surface-variant/70 pt-3 border-t border-outline-variant/10">
        Sem agregados de canal até serem identificados.
      </p>
    </button>
  );
}
