import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Layers, Tv } from 'lucide-react';
import type { ChannelOverviewItem } from '../api/types';

interface Props {
  channels: ChannelOverviewItem[];
  /** null = todos os canais */
  selectedId: string | null;
  onChange: (id: string | null) => void;
  loading: boolean;
}

const fmt = (n: number) => n.toLocaleString('pt-PT');

/**
 * Filtro por canal da Visão Geral. Primeira opção é sempre "Todos os canais";
 * cada canal mostra quantos vídeos e comentários agrega. Vídeos sem canal
 * identificado não aparecem aqui (só entram em "Todos").
 */
export function ChannelSelector({ channels, selectedId, onChange, loading }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = channels.find(c => c.channel_id === selectedId) ?? null;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (loading) {
    return <div className="h-10 w-52 shimmer rounded-xl bg-surface-container-highest" />;
  }

  // Sem canais identificados não há o que filtrar; o aviso de backfill trata do resto.
  if (channels.length === 0) return null;

  const pick = (id: string | null) => { onChange(id); setOpen(false); };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filtrar por canal"
        className={`flex items-center gap-2.5 max-w-xs rounded-xl border bg-surface-container-high pl-3 pr-2 py-2 text-left cursor-pointer transition-colors ${
          open
            ? 'border-primary/60 ring-1 ring-primary/40'
            : 'border-outline-variant/20 hover:border-outline-variant/50 hover:bg-surface-container'
        }`}
      >
        {selected ? <Tv size={15} className="text-primary shrink-0" /> : <Layers size={15} className="text-primary shrink-0" />}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-on-surface truncate">
            {selected ? (selected.channel_title ?? selected.channel_id) : 'Todos os canais'}
          </p>
          <p className="text-[10px] text-on-surface-variant truncate">
            {selected
              ? `${selected.total_videos} ${selected.total_videos === 1 ? 'vídeo' : 'vídeos'}`
              : `${channels.length} ${channels.length === 1 ? 'canal' : 'canais'}`}
          </p>
        </div>
        <ChevronDown
          size={15}
          className={`shrink-0 text-primary/70 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 z-50 rounded-2xl bg-surface-container-high border border-outline-variant/20 shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in">
          <ul role="listbox" aria-label="Canais" className="max-h-80 overflow-y-auto py-1.5">
            <li>
              <button
                type="button"
                role="option"
                aria-selected={selectedId === null}
                onClick={() => pick(null)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left cursor-pointer transition-colors ${
                  selectedId === null ? 'bg-primary/10' : 'hover:bg-surface-container'
                }`}
              >
                <span className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Layers size={15} className="text-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-on-surface">Todos os canais</p>
                  <p className="text-[11px] text-on-surface-variant">Análise global de todos os vídeos</p>
                </div>
                <Check size={15} className={`shrink-0 ${selectedId === null ? 'text-primary' : 'opacity-0'}`} />
              </button>
            </li>
            <li className="my-1 border-t border-outline-variant/10" role="presentation" />
            {channels.map(c => {
              const isSelected = c.channel_id === selectedId;
              return (
                <li key={c.channel_id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => pick(c.channel_id)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10' : 'hover:bg-surface-container'
                    }`}
                  >
                    <span className="h-9 w-9 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                      <Tv size={15} className="text-on-surface-variant" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-on-surface truncate">
                        {c.channel_title ?? c.channel_id}
                      </p>
                      <p className="text-[11px] text-on-surface-variant truncate">
                        {c.total_videos} {c.total_videos === 1 ? 'vídeo' : 'vídeos'} · {fmt(c.total_comments)} comentários
                        {c.average_sentiment != null && ` · ${c.average_sentiment.toFixed(1)}/5`}
                      </p>
                    </div>
                    <Check size={15} className={`shrink-0 ${isSelected ? 'text-primary' : 'opacity-0'}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
