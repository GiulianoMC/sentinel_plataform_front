import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clapperboard, PlusSquare, Tv, Video } from 'lucide-react';
import { useChannelsData } from '../context/ChannelsContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CHANNELS_PATH, HOME_PATH, NO_CHANNEL, REGISTER_PATH, channelPath } from '../lib/routes';

const fmt = (n: number) => n.toLocaleString('pt-PT');

/**
 * Estado vazio do item Vídeo da barra lateral, quando ainda não há vídeo em
 * foco. Em vez de um beco sem saída, oferece os canais para descer até um.
 */
export function PickerPage() {
  const navigate = useNavigate();
  const { channels, overview, loading } = useChannelsData();
  const withoutChannel = overview?.videos_without_channel ?? 0;

  return (
    <div className="space-y-8">
      <div className="min-w-0">
        <Breadcrumbs
          items={[
            { label: 'Início', to: HOME_PATH },
            { label: 'Canais', to: CHANNELS_PATH },
            { label: 'Vídeo' },
          ]}
        />
        <h2 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
          <Video size={26} className="text-primary shrink-0" />
          Escolha um vídeo
        </h2>
        <p className="text-xs text-on-surface-variant mt-1">
          Os relatórios completos são por vídeo. Comece pelo canal a que ele pertence.
        </p>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 shimmer rounded-xl" />
          ))}
        </div>
      )}

      {!loading && channels.length === 0 && withoutChannel === 0 && (
        <div className="glass-card rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Clapperboard size={28} className="text-primary" />
          </div>
          <p className="text-sm font-bold text-on-surface">Nenhum vídeo registado ainda</p>
          <button
            onClick={() => navigate(REGISTER_PATH)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
          >
            <PlusSquare size={16} />
            Registar primeiro vídeo
          </button>
        </div>
      )}

      {!loading && (channels.length > 0 || withoutChannel > 0) && (
        <ul className="glass-card rounded-2xl divide-y divide-outline-variant/10 overflow-hidden">
          {channels.map(c => (
            <li key={c.channel_id}>
              <button
                type="button"
                onClick={() => navigate(channelPath(c.channel_id))}
                className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-high/60 cursor-pointer"
              >
                <span className="h-9 w-9 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Tv size={15} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-on-surface truncate">{c.channel_title ?? c.channel_id}</p>
                  <p className="text-[11px] text-on-surface-variant truncate">
                    {c.total_videos} {c.total_videos === 1 ? 'vídeo' : 'vídeos'} · {fmt(c.total_comments)} comentários
                  </p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </button>
            </li>
          ))}
          {withoutChannel > 0 && (
            <li>
              <button
                type="button"
                onClick={() => navigate(channelPath(NO_CHANNEL))}
                className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-high/60 cursor-pointer"
              >
                <span className="h-9 w-9 rounded-lg bg-tertiary/10 flex items-center justify-center shrink-0">
                  <Tv size={15} className="text-tertiary" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-on-surface truncate">Sem canal identificado</p>
                  <p className="text-[11px] text-on-surface-variant truncate">
                    {withoutChannel} {withoutChannel === 1 ? 'vídeo' : 'vídeos'}
                  </p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-on-surface-variant/40 group-hover:text-tertiary group-hover:translate-x-0.5 transition-all" />
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
