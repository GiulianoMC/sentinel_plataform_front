import type { SentimentResponse } from '../api/types';

const LEVELS = [
  { key: '5', label: 'Muito Positivo', color: '#4ade80' },
  { key: '4', label: 'Positivo',       color: '#89ceff' },
  { key: '3', label: 'Neutro',         color: '#bdc2ff' },
  { key: '2', label: 'Negativo',       color: '#ffcc80' },
  { key: '1', label: 'Muito Negativo', color: '#ffb4ab' },
];

interface Props {
  data: SentimentResponse | null;
  loading: boolean;
}

export function SentimentBars({ data, loading }: Props) {
  const dist = data?.distribution ?? {};
  const max = Math.max(...LEVELS.map(l => dist[l.key] ?? 0), 1);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg text-on-surface">Distribuição de Sentimento</h3>
          <p className="text-xs text-on-surface-variant">Escala 1–5 por volume de comentários</p>
        </div>
        {!loading && data && (
          <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 tracking-wider uppercase">
            {Object.values(dist).reduce((a, b) => a + b, 0)} analisados
          </span>
        )}
      </div>

      <div className="space-y-4">
        {LEVELS.map(level => {
          const count = dist[level.key] ?? 0;
          const pct = loading ? 40 : (count / max) * 100;

          return (
            <div key={level.key} className="flex items-center gap-4">
              <div className="w-6 text-center text-sm font-black text-on-surface-variant">{level.key}</div>
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 h-6 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${loading ? 'shimmer' : ''}`}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: loading ? undefined : level.color,
                      minWidth: count > 0 || loading ? '4px' : '0',
                    }}
                  />
                </div>
                {loading ? (
                  <div className="h-3 w-8 shimmer rounded bg-surface-container-highest" />
                ) : (
                  <span className="text-sm font-mono font-bold text-on-surface-variant w-8 text-right">{count}</span>
                )}
              </div>
              <span className="text-xs text-on-surface-variant w-28 hidden sm:block">{level.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
