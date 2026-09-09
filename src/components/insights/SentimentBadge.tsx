import { sentimentMeta } from '../SummaryCards';

interface Props {
  sentiment: number | null;
}

/**
 * Escala 1–5. Reutiliza sentimentMeta() para não divergir dos cards de resumo;
 * `null` significa "ainda não analisado pela IA", não "neutro".
 */
export function SentimentBadge({ sentiment }: Props) {
  if (sentiment == null) {
    return (
      <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
        NÃO ANALISADO
      </span>
    );
  }

  const meta = sentimentMeta(sentiment);
  return (
    <span
      className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${meta.bg} ${meta.color}`}
      title={`Sentimento ${sentiment} de 5`}
    >
      {meta.label.toUpperCase()} · {sentiment}/5
    </span>
  );
}
