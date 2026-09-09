import { BarChart3, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type DashboardTab = 'analise' | 'insights';

// Uma aba por modo de consumo, não por tecnologia: números, síntese, leitura.
const TABS: { key: DashboardTab; label: string; hint: string; icon: LucideIcon }[] = [
  { key: 'analise',     label: 'Análise',      hint: 'Sentimento, intenções e produtos', icon: BarChart3 },
  { key: 'insights',    label: 'Insights',     hint: 'Síntese automática do vídeo',      icon: Sparkles },
];

export const tabPanelId = (tab: DashboardTab) => `painel-${tab}`;

interface Props {
  active: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

export function DashboardTabs({ active, onChange }: Props) {
  return (
    <div role="tablist" aria-label="Secções do painel" className="flex flex-wrap gap-1 border-b border-outline-variant/20">
      {TABS.map(({ key, label, hint, icon: Icon }) => {
        const selected = key === active;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            id={`aba-${key}`}
            aria-selected={selected}
            aria-controls={tabPanelId(key)}
            onClick={() => onChange(key)}
            className={`group flex items-center gap-2.5 px-4 py-3 -mb-px border-b-2 whitespace-nowrap transition-colors ${
              selected
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/40'
            }`}
          >
            <Icon size={16} className={selected ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'} />
            <span className="flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-[10px] font-normal opacity-70 hidden sm:block">{hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
