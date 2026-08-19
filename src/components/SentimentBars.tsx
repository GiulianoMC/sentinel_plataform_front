import type { SentimentResponse } from '../api/types';

const LEVELS = [
  { key: '5', label: 'Muito Positivo', short: 'M. Positivo', color: '#4ade80' },
  { key: '4', label: 'Positivo',       short: 'Positivo',    color: '#89ceff' },
  { key: '3', label: 'Neutro',         short: 'Neutro',      color: '#bdc2ff' },
  { key: '2', label: 'Negativo',       short: 'Negativo',    color: '#ffcc80' },
  { key: '1', label: 'Muito Negativo', short: 'M. Negativo', color: '#ffb4ab' },
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

      <div className="space-y-3">
        {LEVELS.map(level => {
          const count = dist[level.key] ?? 0;
          const pct = loading ? 40 : (count / max) * 100;

          return (
            <div key={level.key} className="flex items-center gap-2">
              <span
                className="text-[10px] font-semibold flex-shrink-0 text-right"
                style={{ color: level.color, width: '72px' }}
              >
                {level.short}
              </span>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <div className="flex-1 h-3 bg-surface-container-highest rounded-full overflow-hidden min-w-0">
                  <div
                    className={`h-full rounded-r-full transition-all duration-500 ${loading ? 'shimmer' : ''}`}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: loading ? undefined : level.color,
                      minWidth: count > 0 || loading ? '6px' : '0',
                    }}
                  />
                </div>
                {loading ? (
                  <div className="h-3 w-6 shimmer rounded bg-surface-container-highest flex-shrink-0" />
                ) : (
                  <span className="text-xs font-mono font-bold text-on-surface-variant w-7 text-right flex-shrink-0">{count}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
