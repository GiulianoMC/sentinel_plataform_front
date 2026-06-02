import type { IntentionsResponse } from '../api/types';

const CIRCUMFERENCE = 2 * Math.PI * 80;

const INTENT_COLORS: Record<string, string> = {
  Intencao_Compra:      '#bdc2ff',
  Elogio:               '#89ceff',
  Duvida:               '#d3e4fe',
  Comparacao:           '#a9bad3',
  Sugestao:             '#7c87f3',
  Informacao_Preco:     '#009ada',
  Informacao_Tecnica:   '#b7c8e1',
  Critica:              '#ffb4ab',
  Descontentamento:     '#ff8a80',
  Erro_IA:              '#464554',
};

const INTENT_LABELS: Record<string, string> = {
  Intencao_Compra:    'Intenção de Compra',
  Elogio:             'Elogio',
  Duvida:             'Dúvida',
  Comparacao:         'Comparação',
  Sugestao:           'Sugestão',
  Informacao_Preco:   'Info. Preço',
  Informacao_Tecnica: 'Info. Técnica',
  Critica:            'Crítica',
  Descontentamento:   'Descontentamento',
  Erro_IA:            'Não Analisado',
};

interface Props {
  data: IntentionsResponse | null;
  loading: boolean;
}

export function IntentionsDonut({ data, loading }: Props) {
  const intentions = data?.intentions ?? [];
  const total = intentions.reduce((s, i) => s + i.count, 0);

  let cumulative = 0;
  const segments = intentions.map(item => {
    const segLen = (item.count / total) * CIRCUMFERENCE;
    const offset = -cumulative;
    cumulative += segLen;
    return { ...item, segLen, offset, color: INTENT_COLORS[item.intent] ?? '#464554' };
  });

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col">
      <div className="mb-6">
        <h3 className="font-bold text-lg text-on-surface">Distribuição de Intenções</h3>
        <p className="text-xs text-on-surface-variant">Classificação dos {total} comentários analisados</p>
      </div>

      <div className="relative flex items-center justify-center py-4">
        {loading ? (
          <div className="w-48 h-48 flex items-center justify-center">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle cx="96" cy="96" r="80" fill="transparent" stroke="#2d3449" strokeWidth="20" />
              <circle
                cx="96" cy="96" r="80" fill="transparent"
                stroke="#222a3d" strokeWidth="20"
                strokeDasharray={`${CIRCUMFERENCE * 0.6} ${CIRCUMFERENCE}`}
                className="shimmer"
              />
            </svg>
          </div>
        ) : (
          <svg className="w-48 h-48 transform -rotate-90">
            <circle cx="96" cy="96" r="80" fill="transparent" stroke="#2d3449" strokeWidth="20" />
            {total > 0 && segments.map(seg => (
              <circle
                key={seg.intent}
                cx="96" cy="96" r="80"
                fill="transparent"
                stroke={seg.color}
                strokeWidth="20"
                strokeLinecap="butt"
                strokeDasharray={`${seg.segLen} ${CIRCUMFERENCE}`}
                strokeDashoffset={seg.offset}
              />
            ))}
          </svg>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-on-surface">{total}</span>
          <span className="text-[10px] text-primary/60 font-bold uppercase tracking-tighter">Comentários</span>
        </div>
      </div>

      <div className="mt-4 space-y-2 max-h-52 overflow-y-auto pr-1">
        {loading
          ? [1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shimmer bg-surface-container-highest" />
                  <div className="h-3 w-28 shimmer rounded bg-surface-container-highest" />
                </div>
                <div className="h-3 w-8 shimmer rounded bg-surface-container-highest" />
              </div>
            ))
          : segments.map(seg => (
              <div key={seg.intent} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-xs font-medium text-on-surface-variant">
                    {INTENT_LABELS[seg.intent] ?? seg.intent}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface">{seg.count}</span>
                  <span className="text-[10px] text-on-surface-variant/60">
                    {total > 0 ? `${Math.round((seg.count / total) * 100)}%` : ''}
                  </span>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
