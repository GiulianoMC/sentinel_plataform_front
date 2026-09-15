import { Video } from 'lucide-react';
import { SentimentBadge } from './SentimentBadge';
import { IntentBadge } from './IntentBadge';
import { formatDateTime, relevanceLabel, titleCase } from './labels';

interface Props {
  author: string;
  text: string;
  publishedAt?: string | null;
  sentiment: number | null;
  intent: string | null;
  product: string | null;
  /** Distância de cosseno; `null` quando a fonte veio de strategy=sample. */
  distance?: number | null;
  /** Número da citação [i], quando o card é uma fonte do /ask. */
  index?: number;
  /** Vídeo de origem; só vale a pena mostrar quando as fontes misturam vídeos. */
  videoTitle?: string | null;
  videoHref?: string | null;
  innerRef?: (el: HTMLDivElement | null) => void;
}

export function CommentCard({
  author,
  text,
  publishedAt,
  sentiment,
  intent,
  product,
  distance,
  index,
  videoTitle,
  videoHref,
  innerRef,
}: Props) {
  const relevance = relevanceLabel(distance ?? null);

  return (
    <div
      ref={innerRef}
      className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {index != null && (
            <span className="flex-shrink-0 rounded bg-primary/15 px-1.5 py-0.5 text-[11px] font-bold text-primary">
              {index}
            </span>
          )}
          <span className="text-sm font-semibold text-on-surface truncate">{author}</span>
        </div>
        {publishedAt && (
          <span className="text-[10px] text-on-surface-variant flex-shrink-0">
            {formatDateTime(publishedAt)}
          </span>
        )}
      </div>

      {videoTitle && videoHref && (
        <a
          href={videoHref}
          title={videoTitle}
          className="mb-2 flex items-center gap-1 text-[10px] text-on-surface-variant/70 hover:text-primary transition-colors"
        >
          <Video size={10} className="shrink-0" />
          <span className="truncate">no vídeo {videoTitle}</span>
        </a>
      )}

      <p className="text-sm text-on-surface-variant whitespace-pre-wrap break-words">{text}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SentimentBadge sentiment={sentiment} />
        <IntentBadge intent={intent} />
        {product && (
          <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
            {titleCase(product).toUpperCase()}
          </span>
        )}
        {relevance && (
          <span className="ml-auto text-[10px] text-on-surface-variant/70">{relevance}</span>
        )}
      </div>
    </div>
  );
}
