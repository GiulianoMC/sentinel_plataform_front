import type { SourceComment } from '../../api/types';
import { videoPath } from '../../lib/routes';
import { CommentCard } from './CommentCard';

interface Props {
  sources: SourceComment[];
  strategyUsed: 'semantic' | 'sample';
  commentsInContext: number;
  /**
   * Canal a usar nos links das fontes. Só o âmbito canal o passa: aí as
   * evidências vêm de vídeos diferentes e vale a pena dizer de qual. No âmbito
   * vídeo são todas do vídeo que já está em ecrã, e a linha seria ruído.
   */
  channelId?: string | null;
  registerRef: (index: number, el: HTMLDivElement | null) => void;
}

export function EvidenceList({
  sources,
  strategyUsed,
  commentsInContext,
  channelId = null,
  registerRef,
}: Props) {
  if (sources.length === 0) return null;

  // Explica porque as fontes mudam de natureza entre perguntas.
  const provenance =
    strategyUsed === 'sample'
      ? `Amostra equilibrada de ${commentsInContext} comentário(s).`
      : `Os ${commentsInContext} comentário(s) mais parecidos com a pergunta.`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wider text-on-surface-variant">
          Fontes ({sources.length})
        </p>
        <p className="text-[11px] text-on-surface-variant/70">{provenance}</p>
      </div>

      {/* Duas colunas em ecrãs largos: até 10 fontes empilhadas empurravam
          tudo o que vem a seguir para muito longe. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sources.map(s => (
        <CommentCard
          key={s.id}
          index={s.index}
          author={s.author}
          text={s.text}
          sentiment={s.sentiment}
          intent={s.intent}
          product={s.product_mentioned}
          // Em `sample` a distância é null; o rótulo de relevância não se aplica.
          distance={strategyUsed === 'semantic' ? s.distance : null}
          videoTitle={channelId ? s.video_title : null}
          videoHref={channelId ? videoPath(channelId, s.youtube_id) : null}
          innerRef={el => { registerRef(s.index, el); }}
        />
      ))}
      </div>

      <p className="text-[11px] text-on-surface-variant/60">
        O texto das fontes é o excerto que entrou no prompt (até 300 caracteres), não o comentário completo.
      </p>
    </div>
  );
}
