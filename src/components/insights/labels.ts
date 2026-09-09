import type { InsightCardKind, InsightFilters } from '../../api/types';

/**
 * `distance` é distância de cosseno (0 = idêntico; o back corta em 0.6).
 * Converter isto em percentagem daria uma precisão falsa — daí as faixas.
 */
export function relevanceLabel(distance: number | null): string | null {
  if (distance == null) return null;            // veio de strategy=sample
  if (distance <= 0.25) return 'Muito relevante';
  if (distance <= 0.45) return 'Relevante';
  return 'Relacionado';
}

export function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// Intenções — rótulos de exibição para os valores crus da API
// ---------------------------------------------------------------------------

const INTENT_LABELS: Record<string, string> = {
  Intencao_Compra: 'Intenção de compra',
  Duvida: 'Dúvida',
  Elogio: 'Elogio',
  Critica: 'Crítica',
  Comparacao: 'Comparação',
  Sugestao: 'Sugestão',
  Informacao_Preco: 'Informação de preço',
  Informacao_Tecnica: 'Informação técnica',
  Descontentamento: 'Descontentamento',
};

export function intentLabel(intent: string): string {
  return INTENT_LABELS[intent] ?? intent.replace(/_/g, ' ');
}

// ---------------------------------------------------------------------------
// Motivos das perguntas sugeridas — `reason` é slug de máquina, não texto
// ---------------------------------------------------------------------------

const REASON_LABELS: Record<string, string> = {
  sem_analise: 'Este vídeo ainda não tem comentários analisados pela IA',
  fallback: 'Ponto de partida sugerido para qualquer vídeo',
  duvidas_dominantes: 'A maioria dos comentários são dúvidas',
  intencao_compra_dominante: 'Predomina intenção de compra nos comentários',
  sentimento_baixo: 'O sentimento médio deste vídeo está baixo',
  sentimento_misto: 'As opiniões estão divididas',
  sentimento_alto: 'O sentimento médio deste vídeo está alto',
};

export function reasonLabel(reason: string): string {
  const [kind, product] = reason.split(':');
  if (kind === 'produto_critico' && product) return `${titleCase(product)} está com avaliações negativas`;
  if (kind === 'produto_elogiado' && product) return `${titleCase(product)} está bem avaliado`;
  return REASON_LABELS[reason] ?? 'Sugerido a partir dos dados deste vídeo';
}

// ---------------------------------------------------------------------------
// Cards de insights
// ---------------------------------------------------------------------------

export const CARD_ORDER: InsightCardKind[] = [
  'resumo',
  'reclamacao_principal',
  'elogio_principal',
  'duvidas',
];

export const CARD_LABELS: Record<InsightCardKind, string> = {
  resumo: 'Resumo geral',
  reclamacao_principal: 'Principal reclamação',
  elogio_principal: 'Principal elogio',
  duvidas: 'Dúvidas recorrentes',
};

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('pt-PT');

// ---------------------------------------------------------------------------
// Filtros — descrição legível do que uma sugestão aplicou por baixo
// ---------------------------------------------------------------------------

export function describeFilters(filters: InsightFilters | null | undefined): string[] {
  if (!filters) return [];
  const out: string[] = [];
  const { sentiment_min: min, sentiment_max: max, intent, product } = filters;

  if (min != null && max != null) {
    out.push(min === max ? `sentimento = ${min}` : `sentimento entre ${min} e ${max}`);
  } else if (max != null) {
    out.push(`sentimento ≤ ${max}`);
  } else if (min != null) {
    out.push(`sentimento ≥ ${min}`);
  }
  if (intent) out.push(`intenção: ${intentLabel(intent)}`);
  if (product) out.push(`produto: ${titleCase(product)}`);
  return out;
}
