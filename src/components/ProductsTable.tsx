import { ShoppingBag } from 'lucide-react';
import type { ProductsResponse } from '../api/types';

function sentimentColor(avg: number): string {
  if (avg >= 4.0) return 'text-green-400';
  if (avg >= 3.0) return 'text-primary';
  return 'text-error';
}

function sentimentBarColor(avg: number): string {
  if (avg >= 4.0) return 'bg-green-400';
  if (avg >= 3.0) return 'bg-primary';
  return 'bg-error';
}

interface Props {
  data: ProductsResponse | null;
  loading: boolean;
}

export function ProductsTable({ data, loading }: Props) {
  const products = data?.products ?? [];

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Cabeçalho do card — fixo */}
      <div className="p-5 border-b border-outline-variant/10 flex justify-between items-center flex-shrink-0">
        <h3 className="font-bold text-lg text-on-surface">Produtos Mais Mencionados</h3>
        {loading && <div className="h-4 w-20 shimmer rounded bg-surface-container-highest" />}
      </div>
      {/* Cabeçalho da tabela — fixo */}
      <div className="flex-shrink-0 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-highest/50">
            <tr>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-primary/60">Produto</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-primary/60">Menções</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-primary/60">Sentimento</th>
            </tr>
          </thead>
        </table>
      </div>
      {/* Corpo com scroll */}
      <div
        className="flex-1 overflow-y-auto overflow-x-auto min-h-0"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(189,194,255,0.2) transparent' }}
      >
        <table className="w-full text-left">
          <tbody className="divide-y divide-outline-variant/10">
            {loading
              ? [1, 2, 3].map(i => (
                  <tr key={i} className="opacity-40">
                    <td className="px-5 py-3"><div className="h-4 w-36 shimmer bg-surface-container-highest rounded" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-8 shimmer bg-surface-container-highest rounded" /></td>
                    <td className="px-5 py-3"><div className="h-1.5 w-24 shimmer bg-surface-container-highest rounded-full" /></td>
                  </tr>
                ))
              : products.length === 0
                ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-sm text-on-surface-variant">
                      Nenhum produto mencionado ainda.
                    </td>
                  </tr>
                )
                : products.map(p => (
                  <tr key={p.product_name} className="hover:bg-primary/5 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="text-primary" size={14} />
                        </div>
                        <span className="text-sm font-semibold text-on-surface capitalize">{p.product_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-mono text-on-surface-variant">{p.count}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div
                            className={`h-full ${sentimentBarColor(p.average_sentiment)}`}
                            style={{ width: `${(p.average_sentiment / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${sentimentColor(p.average_sentiment)}`}>
                          {p.average_sentiment.toFixed(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
