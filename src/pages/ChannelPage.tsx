import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Info, PlusSquare, RefreshCw, Tv } from 'lucide-react';
import type { VideoOverviewItem } from '../api/types';
import { useChannelsData } from '../context/ChannelsContext';
import { useChannelAnalytics } from '../hooks/useChannelAnalytics';
import { useOverview } from '../hooks/useOverview';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ChannelSelector } from '../components/ChannelSelector';
import { ScopeStats, type ScopeStatsData } from '../components/ScopeStats';
import { VideoGrid } from '../components/VideoGrid';
import { BackfillBanner } from '../components/BackfillBanner';
import { IntentionsDonut } from '../components/IntentionsDonut';
import { ProductsTable } from '../components/ProductsTable';
import { SentimentBars } from '../components/SentimentBars';
import { CHANNELS_PATH, HOME_PATH, NO_CHANNEL, REGISTER_PATH, channelPath, isNoChannel, videoPath } from '../lib/routes';

/**
 * Média do canal a partir dos vídeos, para o pseudo-canal "sem canal", que não
 * tem agregados no backend. Ponderar pelos comentários analisados devolve o
 * mesmo valor que a média global, já que cada média de vídeo é a média dos
 * comentários analisados desse vídeo.
 */
function aggregate(videos: VideoOverviewItem[]): ScopeStatsData {
  let comments = 0;
  let analyzed = 0;
  let weighted = 0;
  let weight = 0;
  for (const v of videos) {
    comments += v.total_comments;
    analyzed += v.analyzed_comments;
    if (v.average_sentiment != null && v.analyzed_comments > 0) {
      weighted += v.average_sentiment * v.analyzed_comments;
      weight += v.analyzed_comments;
    }
  }
  return {
    total_videos: videos.length,
    total_comments: comments,
    analyzed_comments: analyzed,
    average_sentiment: weight > 0 ? weighted / weight : null,
  };
}

/**
 * Nível 2 da navegação: um canal. Dados gerais do canal, análise agregada dos
 * seus vídeos e a grelha de vídeos que desce para o relatório completo.
 */
export function ChannelPage() {
  const { channelId = '' } = useParams();
  const navigate = useNavigate();
  const { channels, overview: channelsOverview, loading: channelsLoading, refetchChannels } = useChannelsData();

  const noChannel = isNoChannel(channelId);

  // O pseudo-canal não é filtrável no backend: pede tudo e separa-se aqui.
  const { overview, loading, error, refetch: load } = useOverview(noChannel ? null : channelId);

  // Sem canal identificado não há endpoints agregados; fica só a lista.
  const analytics = useChannelAnalytics(noChannel ? null : channelId);

  const channel = channels.find(c => c.channel_id === channelId) ?? null;
  const title = noChannel
    ? 'Sem canal identificado'
    : channel?.channel_title ?? channelId;

  const videos = useMemo(() => {
    const all = overview?.videos ?? [];
    return noChannel ? all.filter(v => v.channel_id == null) : all;
  }, [overview, noChannel]);

  // Para o pseudo-canal os totais globais não servem: soma só os vídeos dele.
  const stats: ScopeStatsData | null = noChannel
    ? (overview ? aggregate(videos) : null)
    : overview;

  const withoutChannel = channelsOverview?.videos_without_channel ?? 0;
  const unknownChannel = !noChannel && !channelsLoading && channel == null;

  function refreshAll() {
    load();
    if (!noChannel) analytics.refetch();
    refetchChannels();
  }

  // Canal que já não existe (últimos vídeos apagados, ou link antigo).
  if (unknownChannel) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Início', to: HOME_PATH }, { label: 'Canais', to: CHANNELS_PATH }, { label: 'Canal desconhecido' }]} />
        <div className="glass-card rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Tv size={28} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Este canal não existe entre os seus vídeos</p>
            <p className="text-xs font-mono text-on-surface-variant mt-1">{channelId}</p>
          </div>
          <button
            onClick={() => navigate(CHANNELS_PATH)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
          >
            <ArrowLeft size={16} />
            Ver todos os canais
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="min-w-0">
          <Breadcrumbs items={[{ label: 'Início', to: HOME_PATH }, { label: 'Canais', to: CHANNELS_PATH }, { label: title }]} />
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3 min-w-0">
            {noChannel
              ? <HelpCircle size={26} className="text-tertiary shrink-0" />
              : <Tv size={26} className="text-primary shrink-0" />}
            <span className="truncate">{title}</span>
          </h2>
          <p className="text-xs text-on-surface-variant mt-1 flex flex-wrap items-center gap-x-1.5">
            {noChannel ? (
              <>Vídeos registados antes do filtro por canal existir.</>
            ) : (
              <>
                <span className="font-mono">{channelId}</span>
                <span className="text-outline">•</span>
                <span>
                  {stats?.total_videos ?? 0} {stats?.total_videos === 1 ? 'vídeo registado' : 'vídeos registados'}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Trocar de canal sem voltar atrás: navega, não filtra */}
          {!noChannel && (
            <ChannelSelector
              channels={channels}
              selectedId={channelId}
              onChange={id => navigate(id ? channelPath(id) : CHANNELS_PATH)}
              loading={channelsLoading}
            />
          )}
          <button
            onClick={refreshAll}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-tr from-primary to-primary-container text-on-primary-container text-xs font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-fit"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {(error || analytics.error) && (
        <div className="glass-card rounded-xl p-4 border border-error/20 text-error text-sm">
          {error ?? analytics.error}
        </div>
      )}

      {/* Dados gerais do canal */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
          {noChannel ? 'Dados destes vídeos' : 'Dados do Canal'}
        </h3>
        <ScopeStats
          data={stats}
          loading={loading}
          videosLabel={noChannel ? 'Vídeos sem canal' : 'Vídeos no canal'}
          sentimentLabel={noChannel ? 'Sentimento médio' : 'Sentimento médio do canal'}
        />
      </section>

      {/* Sem canal identificado: caminho para resolver, em vez de um beco */}
      {noChannel && (
        <>
          <div className="glass-card rounded-xl p-4 border border-tertiary/20 flex items-start gap-3">
            <Info size={16} className="text-tertiary shrink-0 mt-0.5" />
            <p className="text-xs text-on-surface-variant">
              Estes vídeos não têm canal no backend, por isso não há análise agregada de intenções, produtos e
              sentimento para eles. Cada vídeo continua com o relatório completo. Identifique os canais para
              que passem a contar nos agregados.
            </p>
          </div>
          <BackfillBanner count={withoutChannel} onDone={() => { refetchChannels(); load(); }} />
        </>
      )}

      {/* Análise agregada do canal */}
      {!noChannel && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
            Análise do Canal
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-4">
              <IntentionsDonut data={analytics.intentions} loading={analytics.loading} />
            </div>
            <div className="lg:col-span-5 relative min-h-[300px]">
              <div className="absolute inset-0">
                <ProductsTable data={analytics.products} loading={analytics.loading} />
              </div>
            </div>
            <div className="lg:col-span-3">
              <SentimentBars data={analytics.sentiment} loading={analytics.loading} />
            </div>
          </div>
        </section>
      )}

      {/* Vídeos do canal */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
          {noChannel ? 'Vídeos sem canal' : 'Vídeos do Canal'}
        </h3>
        {!loading && videos.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Tv size={28} className="text-primary" />
            </div>
            <p className="text-sm font-bold text-on-surface">
              {noChannel ? 'Já não há vídeos sem canal identificado' : 'Este canal já não tem vídeos registados'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(CHANNELS_PATH)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <ArrowLeft size={16} />
                Ver todos os canais
              </button>
              <button
                onClick={() => navigate(REGISTER_PATH)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface-variant text-xs font-bold hover:text-on-surface transition-colors border border-outline-variant/10"
              >
                <PlusSquare size={16} />
                Registar vídeo
              </button>
            </div>
          </div>
        ) : (
          <VideoGrid
            videos={videos}
            loading={loading}
            onSelect={youtubeId => navigate(videoPath(noChannel ? NO_CHANNEL : channelId, youtubeId))}
          />
        )}
      </section>
    </div>
  );
}
