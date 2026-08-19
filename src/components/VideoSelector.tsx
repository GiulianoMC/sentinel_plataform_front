import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, Video } from 'lucide-react';
import type { Video as VideoType } from '../api/types';

interface Props {
  videos: VideoType[];
  selectedId: string | null;
  onChange: (id: string) => void;
  loading: boolean;
}

function thumbnail(id: string) {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

export function VideoSelector({ videos, selectedId, onChange, loading }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = videos.find(v => v.youtube_id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return videos;
    return videos.filter(v =>
      (v.titulo ?? v.youtube_id).toLowerCase().includes(q) ||
      v.youtube_id.toLowerCase().includes(q)
    );
  }, [videos, query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const id = selectedId;
    if (id) {
      const el = listRef.current?.querySelector<HTMLElement>(`[data-id="${id}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, selectedId]);

  if (loading) {
    return <div className="h-10 w-56 shimmer rounded-xl bg-surface-container-highest" />;
  }

  if (videos.length === 0) {
    return (
      <span className="flex items-center gap-2 text-xs text-on-surface-variant px-3 py-2 rounded-xl bg-surface-container-high">
        <Video size={14} />
        Nenhum vídeo registado
      </span>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`group flex items-center gap-2.5 max-w-[240px] sm:max-w-xs rounded-xl border bg-surface-container-high pl-1.5 pr-2 py-1.5 text-left cursor-pointer transition-colors ${
          open
            ? 'border-primary/60 ring-1 ring-primary/40'
            : 'border-outline-variant/20 hover:border-outline-variant/50 hover:bg-surface-container'
        }`}
      >
        {selected ? (
          <>
            <img
              src={thumbnail(selected.youtube_id)}
              alt=""
              className="h-9 w-14 rounded-lg object-cover bg-surface-dim shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-on-surface truncate">
                {selected.titulo ?? selected.youtube_id}
              </p>
              <p className="text-[10px] text-on-surface-variant truncate">
                {selected.youtube_id}
              </p>
            </div>
          </>
        ) : (
          <span className="px-2 py-1.5 text-sm text-on-surface-variant">
            Selecionar vídeo
          </span>
        )}
        <ChevronDown
          size={15}
          className={`shrink-0 text-primary/70 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 z-50 rounded-2xl bg-surface-container-high border border-outline-variant/20 shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in">
          <div className="p-2.5 border-b border-outline-variant/10">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Pesquisar vídeo…"
                className="w-full bg-surface pl-8 pr-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/70 rounded-lg border border-outline-variant/20 focus:outline-none focus:ring-1 focus:ring-primary/60"
              />
            </div>
          </div>

          <ul
            ref={listRef}
            role="listbox"
            aria-label="Vídeos"
            className="max-h-72 overflow-y-auto py-1.5"
          >
            {filtered.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-on-surface-variant">
                Nenhum vídeo encontrado
              </li>
            )}
            {filtered.map(v => {
              const isSelected = v.youtube_id === selectedId;
              return (
                <li key={v.youtube_id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-id={v.youtube_id}
                    onClick={() => {
                      onChange(v.youtube_id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-2.5 py-2 text-left cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10'
                        : 'hover:bg-surface-container'
                    }`}
                  >
                    <img
                      src={thumbnail(v.youtube_id)}
                      alt=""
                      className="h-10 w-16 rounded-md object-cover bg-surface-dim shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-on-surface truncate">
                        {v.titulo ?? v.youtube_id}
                      </p>
                      <p className="text-[11px] text-on-surface-variant truncate">
                        {v.youtube_id}
                      </p>
                    </div>
                    <Check
                      size={15}
                      className={`shrink-0 transition-opacity ${isSelected ? 'text-primary opacity-100' : 'opacity-0'}`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="px-3 py-2 text-[10px] text-on-surface-variant/80 border-t border-outline-variant/10">
            {videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'}
          </div>
        </div>
      )}
    </div>
  );
}