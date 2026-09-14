import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  /** Sem `to` é o nível atual, que não é clicável. */
  to?: string;
}

/** Trilha de navegação dos três níveis: canais → canal → vídeo. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="flex items-center gap-2 text-[10px] uppercase tracking-widest mb-1 min-w-0">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2 min-w-0">
          {i > 0 && <ChevronRight size={12} className="text-primary/40 shrink-0" />}
          {item.to ? (
            <Link
              to={item.to}
              className="text-primary/60 hover:text-primary transition-colors truncate max-w-[12rem]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-on-surface-variant/70 normal-case tracking-normal truncate max-w-[16rem]">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
