import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clapperboard, LayoutGrid, PlusSquare, RefreshCw, Table2 } from 'lucide-react';
import { useChannelsData } from '../context/ChannelsContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ChannelCard, NoChannelCard } from '../components/ChannelCard';
import { ChannelsTable } from '../components/ChannelsTable';
import { BackfillBanner } from '../components/BackfillBanner';
import { HOME_PATH, NO_CHANNEL, REGISTER_PATH, channelPath } from '../lib/routes';

type View = 'grelha' | 'tabela';

/**
 * Nível 1 da navegação: só canais. Cada cartão traz os dados gerais do seu
 * canal e abre o detalhe. Não há KPIs globais aqui de propósito — somar canais
 * diferentes num número só não dizia nada a ninguém.
 */
export function ChannelsPage() {
  const navigate = useNavigate();
  const { channels, overview, loading, error, refetchChannels } = useChannelsData();
  const [view, setView] = useState<View>('grelha');

  const withoutChannel = overview?.videos_without_channel ?? 0;

  // Do maior para o menor: quem tem mais conversa costuma ser o que se abre.
  const sorted = useMemo(
    () => [...channels].sort((a, b) => b.total_comments - a.total_comments),
    [channels],
  );

  const openChannel = (channelId: string) => navigate(channelPath(channelId));

  // O botão de vista só existe com mais de um canal; sem ele, a vista é a grelha.
  const effectiveView: View = channels.length > 1 ? view : 'grelha';

  const nothingRegistered = !loading && channels.length === 0 && withoutChannel === 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="min-w-0">
          <Breadcrumbs items={[{ label: 'Início', to: HOME_PATH }, { label: 'Canais' }]} />
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Canais</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            {loading
              ? 'A carregar canais…'
              : channels.length === 0
                ? 'Nenhum canal identificado ainda.'
                : `${channels.length} ${channels.length === 1 ? 'canal' : 'canais'} · escolha um para ver os dados e os vídeos`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Grelha para explorar, tabela para comparar lado a lado */}
          {channels.length > 1 && (
            <div role="group" aria-label="Vista dos canais" className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-high border border-outline-variant/20">
              {([
                { key: 'grelha' as View, icon: LayoutGrid, label: 'Grelha' },
                { key: 'tabela' as View, icon: Table2, label: 'Tabela' },
              ]).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  aria-pressed={view === key}
                  title={`Ver em ${label.toLowerCase()}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                    view === key
                      ? 'bg-primary/15 text-primary'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={refetchChannels}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-tr from-primary to-primary-container text-on-primary-container text-xs font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-fit"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card rounded-xl p-4 border border-error/20 text-error text-sm">{error}</div>
      )}

      <BackfillBanner count={withoutChannel} onDone={refetchChannels} />

      {nothingRegistered && (
        <div className="glass-card rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Clapperboard size={28} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Nenhum vídeo registado ainda</p>
            <p className="text-xs text-on-surface-variant mt-1">
              Registe um vídeo do YouTube e o canal dele aparece aqui.
            </p>
          </div>
          <button
            onClick={() => navigate(REGISTER_PATH)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
          >
            <PlusSquare size={16} />
            Registar primeiro vídeo
          </button>
        </div>
      )}

      {!nothingRegistered && (
        effectiveView === 'tabela' ? (
          <ChannelsTable
            channels={channels}
            videosWithoutChannel={withoutChannel}
            loading={loading}
            onSelect={openChannel}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-surface-container-high p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shimmer rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 shimmer rounded" />
                        <div className="h-2 w-1/2 shimmer rounded" />
                      </div>
                    </div>
                    <div className="h-2.5 w-2/3 shimmer rounded" />
                    <div className="h-1.5 w-full shimmer rounded-full" />
                    <div className="h-6 w-full shimmer rounded" />
                  </div>
                ))
              : (
                <>
                  {sorted.map(c => (
                    <ChannelCard key={c.channel_id} channel={c} onOpen={openChannel} />
                  ))}
                  {withoutChannel > 0 && (
                    <NoChannelCard count={withoutChannel} onOpen={() => navigate(channelPath(NO_CHANNEL))} />
                  )}
                </>
              )}
          </div>
        )
      )}
    </div>
  );
}
