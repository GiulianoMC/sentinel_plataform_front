import { useNavigate } from 'react-router-dom';
import { Activity, MessageSquareText, Tv, Video } from 'lucide-react';
import type { AskRequest, AskScope, VideoOverviewItem } from '../../api/types';
import { useChannelsData } from '../../context/ChannelsContext';
import { VIDEO_PICKER_PATH } from '../../lib/routes';
import { BackfillBanner } from '../BackfillBanner';
import { AskInsight } from '../insights/AskInsight';

interface Props {
  videos: VideoOverviewItem[];
  loading: boolean;
  scope: AskScope | null;
  onSelect: (scope: AskScope) => void;
  /** Pergunta a disparar de imediato, vinda do histórico. */
  pendingRequest: AskRequest | null;
}

const thumbnail = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
const fmt = (n: number) => n.toLocaleString('pt-PT');

const chipClass = (selected: boolean, clickable = true) =>
  `flex items-center gap-2.5 shrink-0 max-w-[15rem] rounded-xl border p-1.5 pr-3 text-left transition-all ${
    clickable ? 'cursor-pointer' : ''
  } ${
    selected
      ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/30'
      : 'border-outline-variant/20 bg-surface-container-high hover:border-outline-variant/50'
  }`;

/**
 * O RAG à frente de tudo na Home. O âmbito por omissão é um canal inteiro, que
 * é onde uma pergunta única cobre mais comentários; a fita mostra os canais
 * todos de uma vez porque são poucos. Sem canais identificados não há /ask por
 * canal no backend, e a fita volta a ser de vídeos.
 */
export function HomeAsk({ videos, loading, scope, onSelect, pendingRequest }: Props) {
  const navigate = useNavigate();
  const { channels, overview, loading: channelsLoading, refetchChannels } = useChannelsData();

  const byChannel = channels.length > 0;
  const busy = loading || channelsLoading;

  const channel = scope?.kind === 'channel'
    ? channels.find(c => c.channel_id === scope.id) ?? null
    : null;
  const video = scope?.kind === 'video'
    ? videos.find(v => v.youtube_id === scope.id) ?? null
    : null;

  const scopeTitle = channel
    ? channel.channel_title ?? channel.channel_id
    : video?.titulo ?? null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-surface-container p-6 md:p-8">
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative min-w-0 space-y-5">
        <div>
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <MessageSquareText size={20} className="text-primary" />
            Pergunte à IA
          </h3>
          <p className="text-sm text-on-surface-variant mt-1">
            {byChannel
              ? 'Respostas fundamentadas nos comentários de todos os vídeos deste canal, com as fontes citadas'
              : 'Respostas fundamentadas nos comentários, com as fontes citadas e clicáveis'}
          </p>
        </div>

        {busy ? (
          <div className="flex gap-2">
            {[0, 1, 2].map(i => <div key={i} className="h-14 w-48 shimmer rounded-xl shrink-0" />)}
          </div>
        ) : !byChannel && videos.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            Registe um vídeo para começar a fazer perguntas aos comentários.
          </p>
        ) : (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 mb-2">
              {byChannel ? 'Sobre que canal' : 'Sobre que vídeo'}
            </p>
            <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 -mx-1 px-1">
              {byChannel ? (
                <>
                  {/* Uma pergunta repetida do histórico pode ser sobre um vídeo:
                      o âmbito em vigor tem de estar visível na fita dos canais. */}
                  {video && (
                    <div
                      title={video.titulo ?? video.youtube_id}
                      className={chipClass(true, false)}
                    >
                      <img
                        src={thumbnail(video.youtube_id)}
                        alt=""
                        loading="lazy"
                        className="h-9 w-14 rounded-lg object-cover bg-surface-dim shrink-0"
                      />
                      <span className="min-w-0">
                        <span className="block text-[12px] font-semibold text-on-surface truncate">
                          {video.titulo ?? video.youtube_id}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-on-surface-variant truncate">
                          <Video size={10} className="shrink-0" />
                          só este vídeo
                        </span>
                      </span>
                    </div>
                  )}
                  {channels.map(c => {
                    const selected = c.channel_id === scope?.id && scope.kind === 'channel';
                    return (
                      <button
                        key={c.channel_id}
                        type="button"
                        onClick={() => onSelect({ kind: 'channel', id: c.channel_id })}
                        aria-pressed={selected}
                        title={c.channel_title ?? c.channel_id}
                        className={chipClass(selected)}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                          <Tv size={16} className="text-primary" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[12px] font-semibold text-on-surface truncate">
                            {c.channel_title ?? c.channel_id}
                          </span>
                          <span className="block text-[10px] text-on-surface-variant truncate">
                            {c.total_videos} {c.total_videos === 1 ? 'vídeo' : 'vídeos'} ·{' '}
                            {fmt(c.analyzed_comments)} analisados
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </>
              ) : (
                videos.map(v => {
                  const selected = v.youtube_id === scope?.id && scope.kind === 'video';
                  const pct = v.total_comments > 0
                    ? Math.round((v.analyzed_comments / v.total_comments) * 100)
                    : 0;
                  return (
                    <button
                      key={v.youtube_id}
                      type="button"
                      onClick={() => onSelect({ kind: 'video', id: v.youtube_id })}
                      aria-pressed={selected}
                      title={v.titulo ?? v.youtube_id}
                      className={chipClass(selected)}
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
                })
              )}
            </div>

            {byChannel && (
              <button
                type="button"
                onClick={() => navigate(VIDEO_PICKER_PATH)}
                className="mt-2 text-[11px] text-on-surface-variant/80 hover:text-primary transition-colors"
              >
                ou pergunte sobre um vídeo específico
              </button>
            )}
          </div>
        )}

        {/* Sem canais identificados o /ask por canal não existe: o caminho para
            o ter é o backfill, e ele é que devolve a fita de canais. */}
        {!byChannel && !channelsLoading && (
          <BackfillBanner
            count={overview?.videos_without_channel ?? 0}
            onDone={refetchChannels}
          />
        )}

        {scope && (channel || video) && (
          <>
            <p className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/80">
              <Tv size={11} className="shrink-0" />
              <span className="truncate">
                {channel
                  ? channel.channel_title ?? channel.channel_id
                  : video!.channel_title ?? 'Canal não identificado'}
              </span>
              <span className="text-outline">•</span>
              <Activity size={11} className="shrink-0" />
              {fmt((channel ?? video!).analyzed_comments)} de{' '}
              {fmt((channel ?? video!).total_comments)} comentários analisados
            </p>
            <AskInsight scope={scope} scopeTitle={scopeTitle} initialQuestion={pendingRequest} />
          </>
        )}

      </div>
    </section>
  );
}
