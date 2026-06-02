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
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
        <h3 className="font-bold text-lg text-on-surface">Top Products Mentioned</h3>
        {loading && <div className="h-4 w-20 shimmer rounded bg-surface-container-highest" />}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-highest/50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-primary/60">Product</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-primary/60">Mentions</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-primary/60">Sentiment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {loading
              ? [1, 2, 3].map(i => (
                  <tr key={i} className="opacity-40">
                    <td className="px-6 py-4"><div className="h-4 w-36 shimmer bg-surface-container-highest rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 shimmer bg-surface-container-highest rounded" /></td>
                    <td className="px-6 py-4"><div className="h-1.5 w-28 shimmer bg-surface-container-highest rounded-full" /></td>
                  </tr>
                ))
              : products.length === 0
                ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-on-surface-variant">
                      Nenhum produto mencionado ainda.
                    </td>
                  </tr>
                )
                : products.map(p => (
                  <tr key={p.product_name} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="text-primary" size={16} />
                        </div>
                        <span className="text-sm font-semibold text-on-surface capitalize">{p.product_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-on-surface-variant">{p.count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
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
