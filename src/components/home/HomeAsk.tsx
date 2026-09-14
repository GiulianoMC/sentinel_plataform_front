import { Activity, MessageSquareText, Tv } from 'lucide-react';
import type { AskRequest, VideoOverviewItem } from '../../api/types';
import { AskInsight } from '../insights/AskInsight';

interface Props {
  videos: VideoOverviewItem[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (youtubeId: string) => void;
  /** Pergunta a disparar de imediato, vinda do histórico. */
  pendingRequest: AskRequest | null;
}

const thumbnail = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
const fmt = (n: number) => n.toLocaleString('pt-PT');

/**
 * O RAG à frente de tudo na Home. Como /insights/{id}/ask é por vídeo, o
 * âmbito escolhe-se aqui em fita: com poucos vídeos vê-se tudo de uma vez, e
 * com muitos rola na horizontal sem esconder nada atrás de um dropdown.
 */
export function HomeAsk({ videos, loading, selectedId, onSelect, pendingRequest }: Props) {
  const selected = videos.find(v => v.youtube_id === selectedId) ?? null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-surface-container p-6 md:p-8">
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative space-y-5">
        <div>
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <MessageSquareText size={20} className="text-primary" />
            Pergunte à IA
          </h3>
          <p className="text-sm text-on-surface-variant mt-1">
            Respostas fundamentadas nos comentários, com as fontes citadas e clicáveis
          </p>
        </div>

        {/* Fita de âmbito: a pergunta é sempre sobre um vídeo */}
        {loading ? (
          <div className="flex gap-2">
            {[0, 1, 2].map(i => <div key={i} className="h-14 w-48 shimmer rounded-xl shrink-0" />)}
          </div>
        ) : videos.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            Registe um vídeo para começar a fazer perguntas aos comentários.
          </p>
        ) : (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 mb-2">
              Sobre que vídeo
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {videos.map(v => {
                const isSelected = v.youtube_id === selectedId;
                const pct = v.total_comments > 0
                  ? Math.round((v.analyzed_comments / v.total_comments) * 100)
                  : 0;
                return (
                  <button
                    key={v.youtube_id}
                    type="button"
                    onClick={() => onSelect(v.youtube_id)}
                    aria-pressed={isSelected}
                    title={v.titulo ?? v.youtube_id}
                    className={`flex items-center gap-2.5 shrink-0 max-w-[15rem] rounded-xl border p-1.5 pr-3 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/30'
                        : 'border-outline-variant/20 bg-surface-container-high hover:border-outline-variant/50'
                    }`}
                  >
                    <img
                      src={thumbnail(v.youtube_id)}
                      alt=""
                      loading="lazy"
                      className="h-9 w-14 rounded-lg object-cover bg-surface-dim shrink-0"
                    />
                    <span className="min-w-0">
                      <span className="block text-[12px] font-semibold text-on-surface truncate">
                        {v.titulo ?? v.youtube_id}
                      </span>
                      <span className="block text-[10px] text-on-surface-variant truncate">
                        {fmt(v.analyzed_comments)} analisados · {pct}%
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selected && (
          <>
            <p className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/80">
              <Tv size={11} className="shrink-0" />
              <span className="truncate">{selected.channel_title ?? 'Canal não identificado'}</span>
              <span className="text-outline">•</span>
              <Activity size={11} className="shrink-0" />
              {fmt(selected.analyzed_comments)} de {fmt(selected.total_comments)} comentários analisados
            </p>
            <AskInsight
              youtubeId={selected.youtube_id}
              videoTitle={selected.titulo}
              initialQuestion={pendingRequest}
            />
          </>
        )}
      </div>
    </section>
  );
}
