import { useMemo, useState, type KeyboardEvent } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, Info, Tv } from 'lucide-react';
import type { ChannelOverviewItem } from '../api/types';
import { sentimentMeta } from './SummaryCards';

type SortKey = 'channel' | 'videos' | 'comments' | 'analyzed' | 'sentiment';
type SortDir = 'asc' | 'desc';

interface Props {
  channels: ChannelOverviewItem[];
  /** Vídeos com channel_id NULL — vão para a nota de rodapé, não são linha. */
  videosWithoutChannel: number;
  loading: boolean;
  /** Clicar numa linha aplica o canal como filtro. */
  onSelect: (channelId: string) => void;
}

const fmt = (n: number) => n.toLocaleString('pt-PT');
const label = (c: ChannelOverviewItem) => c.channel_title ?? c.channel_id;
const coverage = (c: ChannelOverviewItem) =>
  c.total_comments > 0 ? Math.round((c.analyzed_comments / c.total_comments) * 100) : 0;

const COLUMNS: { key: SortKey; title: string; numeric: boolean; defaultDir: SortDir }[] = [
  { key: 'channel', title: 'Canal', numeric: false, defaultDir: 'asc' },
  { key: 'videos', title: 'Vídeos', numeric: true, defaultDir: 'desc' },
  { key: 'comments', title: 'Comentários', numeric: true, defaultDir: 'desc' },
  { key: 'analyzed', title: 'Analisados', numeric: true, defaultDir: 'desc' },
  { key: 'sentiment', title: 'Sentimento', numeric: true, defaultDir: 'desc' },
];

function compare(a: ChannelOverviewItem, b: ChannelOverviewItem, key: SortKey, dir: SortDir): number {
  const sign = dir === 'asc' ? 1 : -1;
  switch (key) {
    case 'channel':
      return sign * label(a).localeCompare(label(b), 'pt-PT', { sensitivity: 'base' });
    case 'videos':
      return sign * (a.total_videos - b.total_videos);
    case 'comments':
      return sign * (a.total_comments - b.total_comments);
    case 'analyzed':
      return sign * (a.analyzed_comments - b.analyzed_comments) || sign * (coverage(a) - coverage(b));
    case 'sentiment': {
      // Sem dados fica sempre no fim, independentemente da direção.
      if (a.average_sentiment == null && b.average_sentiment == null) return 0;
      if (a.average_sentiment == null) return 1;
      if (b.average_sentiment == null) return -1;
      return sign * (a.average_sentiment - b.average_sentiment);
    }
  }
}

/**
 * Comparativo dos canais do utilizador (Visão Geral, só sem filtro ativo).
 * Todos os números vêm de useChannels(); não há chamadas próprias.
 */
export function ChannelsTable({ channels, videosWithoutChannel, loading, onSelect }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('comments');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(
    () => [...channels].sort((a, b) => compare(a, b, sortKey, sortDir) || label(a).localeCompare(label(b), 'pt-PT')),
    [channels, sortKey, sortDir],
  );

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(COLUMNS.find(c => c.key === key)?.defaultDir ?? 'desc');
    }
  }

  function onRowKey(e: KeyboardEvent<HTMLTableRowElement>, id: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id);
    }
  }

  // Sem canais identificados não há comparação possível; o aviso de backfill
  // na Visão Geral já explica o que fazer.
  if (!loading && channels.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/15 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {COLUMNS.map(col => {
                const active = col.key === sortKey;
                const Icon = !active ? ArrowUpDown : sortDir === 'asc' ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className={`px-4 py-3 font-bold ${col.numeric ? 'text-right' : 'text-left'}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={`inline-flex items-center gap-1.5 rounded px-1 -mx-1 transition-colors hover:text-on-surface ${
                        active ? 'text-primary' : ''
                      } ${col.numeric ? 'flex-row-reverse' : ''}`}
                    >
                      {col.title}
                      <Icon size={12} className={active ? 'text-primary' : 'opacity-40'} />
                    </button>
                  </th>
                );
              })}
              <th scope="col" className="w-8 px-2" aria-label="Abrir canal" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 shimmer rounded-lg shrink-0" />
                        <div className="h-3 w-40 shimmer rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-3"><div className="h-3 w-8 shimmer rounded ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-14 shimmer rounded ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-24 shimmer rounded ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-16 shimmer rounded ml-auto" /></td>
                    <td />
                  </tr>
                ))
              : sorted.map(c => {
                  const pct = coverage(c);
                  const m = sentimentMeta(c.average_sentiment);
                  return (
                    <tr
                      key={c.channel_id}
                      tabIndex={0}
                      role="button"
                      aria-label={`Filtrar por ${label(c)}`}
                      onClick={() => onSelect(c.channel_id)}
                      onKeyDown={e => onRowKey(e, c.channel_id)}
                      className="group cursor-pointer transition-colors hover:bg-surface-container-high/60 focus-visible:bg-surface-container-high/60 focus-visible:outline-none"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="h-8 w-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                            <Tv size={14} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface truncate max-w-[18rem]">{label(c)}</p>
                            {c.channel_title && (
                              <p className="text-[10px] font-mono text-on-surface-variant/60 truncate max-w-[18rem]">{c.channel_id}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-on-surface">{fmt(c.total_videos)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-on-surface">{fmt(c.total_comments)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-end gap-1.5 min-w-[7rem]">
                          <span className="tabular-nums text-on-surface">
                            {fmt(c.analyzed_comments)}
                            <span className="ml-1.5 text-[10px] font-bold text-tertiary">{pct}%</span>
                          </span>
                          <div className="h-1 w-24 bg-surface-container-highest rounded-full overflow-hidden">
                            <div className="h-full bg-tertiary transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.average_sentiment != null ? (
                          <span className="inline-flex items-center gap-2 justify-end">
                            <span className={`font-black tabular-nums ${m.color}`}>{c.average_sentiment.toFixed(1)}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${m.bg} ${m.color}`}>
                              {m.label.toUpperCase()}
                            </span>
                          </span>
                        ) : (
                          <span className="text-on-surface-variant/60 text-xs">sem dados</span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-right">
                        <ChevronRight size={16} className="text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {!loading && videosWithoutChannel > 0 && (
        <p className="flex items-start gap-2 border-t border-outline-variant/10 px-4 py-3 text-xs text-on-surface-variant">
          <Info size={14} className="shrink-0 mt-0.5 text-tertiary" />
          <span>
            {videosWithoutChannel === 1
              ? '1 vídeo sem canal identificado não entra nesta comparação'
              : `${videosWithoutChannel} vídeos sem canal identificado não entram nesta comparação`}
            ; os seus comentários só contam em "Todos os canais".
          </span>
        </p>
      )}
    </div>
  );
}
