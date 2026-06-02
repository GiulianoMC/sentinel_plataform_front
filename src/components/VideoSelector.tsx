import { ChevronDown } from 'lucide-react';
import type { Video } from '../api/types';

interface Props {
  videos: Video[];
  selectedId: string | null;
  onChange: (id: string) => void;
  loading: boolean;
}

export function VideoSelector({ videos, selectedId, onChange, loading }: Props) {
  if (loading) {
    return <div className="h-8 w-48 shimmer rounded-lg bg-surface-container-highest" />;
  }

  if (videos.length === 0) {
    return (
      <span className="text-xs text-on-surface-variant px-3 py-1.5 rounded-lg bg-surface-container-high">
        Nenhum vídeo registado
      </span>
    );
  }

  return (
    <div className="relative">
      <select
        value={selectedId ?? ''}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-surface-container-high border border-outline-variant/20 text-on-surface text-sm font-medium rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
      >
        {videos.map(v => (
          <option key={v.youtube_id} value={v.youtube_id}>
            {v.titulo ?? v.youtube_id}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary/60 pointer-events-none"
      />
    </div>
  );
}
