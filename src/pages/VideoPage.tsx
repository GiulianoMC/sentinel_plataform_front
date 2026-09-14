import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, Cpu, MessageSquareText, RefreshCw, Sparkles, Trash2, Tv } from 'lucide-react';
import { useVideos } from '../hooks/useVideos';
import { useAnalytics } from '../hooks/useAnalytics';
import { useChannelsData } from '../context/ChannelsContext';
import { reprocessAI } from '../api/analytics';
import { deleteVideo } from '../api/videos';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { VideoSelector } from '../components/VideoSelector';
import { SummaryCards } from '../components/SummaryCards';
import { IntentionsDonut } from '../components/IntentionsDonut';
import { ProductsTable } from '../components/ProductsTable';
import { SentimentBars } from '../components/SentimentBars';
import { InsightCards } from '../components/insights/InsightCards';
import { AskInsight } from '../components/insights/AskInsight';
import { CHANNELS_PATH, HOME_PATH, channelPath, isNoChannel, videoPath } from '../lib/routes';

/**
 * Nível 3 da navegação: um vídeo, com tudo o que existe sobre ele. Nada aqui
 * fica escondido atrás de abas — esta é a tela do detalhe completo, e os
 * níveis acima é que ficaram leves.
 */
export function VideoPage() {
  const { channelId = '', youtubeId = '' } = useParams();
  const navigate = useNavigate();
  const noChannel = isNoChannel(channelId);
  const { channels, refetchChannels } = useChannelsData();

  // O seletor lista só os vídeos deste canal: é o âmbito em que se está.
  const { videos, loading: videosLoading, error: videosError, refetchVideos } =
    useVideos(noChannel ? null : channelId);

  const scopedVideos = useMemo(
    () => (noChannel ? videos.filter(v => v.channel_id == null) : videos),
    [videos, noChannel],
  );

  const { summary, intentions, products, sentiment, loading, error, refetch, isProcessing } =
    useAnalytics(youtubeId);

  const [reprocessing, setReprocessing] = useState(false);
  const [reprocessMsg, setReprocessMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const video = scopedVideos.find(v => v.youtube_id === youtubeId) ?? null;
  const channel = channels.find(c => c.channel_id === channelId) ?? null;
  const channelTitle = noChannel ? 'Sem canal identificado' : channel?.channel_title ?? channelId;
  const title = video?.titulo ?? youtubeId;

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    setConfirmDelete(false);
    try {
      await deleteVideo(youtubeId);
      refetchVideos();
      refetchChannels();
      // Sobe um nível: o vídeo que estava em foco deixou de existir.
      navigate(channelPath(channelId), { replace: true });
    } catch (e) {
      setReprocessMsg({ type: 'err', text: (e as Error).message });
      setDeleting(false);
    }
  }

  async function handleReprocess() {
    setReprocessing(true);
    setReprocessMsg(null);
    try {
      const result = await reprocessAI(youtubeId);
      const n = (result as { enqueued?: number }).enqueued ?? 0;
      setReprocessMsg({ type: 'ok', text: `${n} comentário(s) enviados para reprocessamento.` });
    } catch (e) {
      setReprocessMsg({ type: 'err', text: (e as Error).message });
    } finally {
      setReprocessing(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="min-w-0">
          <Breadcrumbs
            items={[
              { label: 'Início', to: HOME_PATH },
              { label: 'Canais', to: CHANNELS_PATH },
              { label: channelTitle, to: channelPath(channelId) },
              { label: title },
            ]}
          />
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface flex items-start gap-3 flex-wrap">
            <span className="line-clamp-2">{title}</span>
            {isProcessing && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-tertiary px-2 py-0.5 rounded bg-tertiary/10 tracking-wider mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" />
                AO VIVO
              </span>
            )}
          </h2>
          <p className="text-xs text-on-surface-variant mt-1 flex flex-wrap items-center gap-x-1.5">
            <span className="font-mono text-primary/60">{youtubeId}</span>
            <span className="text-outline">•</span>
            <button
              type="button"
              onClick={() => navigate(channelPath(channelId))}
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <Tv size={11} />
              <span className="truncate max-w-[16rem]">{channelTitle}</span>
            </button>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate(channelPath(channelId))}
            title="Voltar ao canal"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors border border-outline-variant/10"
          >
            <ArrowLeft size={16} />
            Canal
          </button>

          <button
            onClick={handleReprocess}
            disabled={reprocessing}
            title="Reprocessar comentários com Erro_IA"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-xs font-semibold hover:bg-surface-container-highest transition-colors border border-outline-variant/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Cpu size={16} className={reprocessing ? 'animate-pulse text-primary' : ''} />
            {reprocessing ? 'A reprocessar...' : 'Reprocessar IA'}
          </button>

          {/* Apagar vídeo — dois cliques para confirmar */}
          <button
            onClick={handleDelete}
            onBlur={() => setConfirmDelete(false)}
            disabled={deleting}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              confirmDelete
                ? 'bg-error/20 border-error/40 text-error animate-pulse'
                : 'bg-surface-container-high border-outline-variant/10 text-on-surface-variant hover:border-error/30 hover:text-error'
            }`}
          >
            <Trash2 size={16} />
            {deleting ? 'A apagar...' : confirmDelete ? 'Confirmar?' : 'Apagar'}
          </button>

          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-tr from-primary to-primary-container text-on-primary-container text-xs font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Trocar de vídeo dentro do mesmo canal, sem subir um nível */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">
          Outro vídeo deste canal
        </span>
        <VideoSelector
          videos={scopedVideos}
          selectedId={youtubeId}
          onChange={id => navigate(videoPath(channelId, id))}
          loading={videosLoading}
        />
      </div>

      {(error || videosError) && (
        <div className="glass-card rounded-xl p-4 border border-error/20 text-error text-sm">
          {error ?? videosError}
        </div>
      )}

      {reprocessMsg && (
        <div
          className={`glass-card rounded-xl p-4 border text-sm flex items-center justify-between gap-4 ${
            reprocessMsg.type === 'ok' ? 'border-green-400/20 text-green-400' : 'border-error/20 text-error'
          }`}
        >
          <span>{reprocessMsg.text}</span>
          <button
            onClick={() => setReprocessMsg(null)}
            aria-label="Fechar"
            className="text-xs opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Pergunte à IA: a interacção principal do produto vem primeiro */}
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-surface-container p-6 md:p-8">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative space-y-5">
          <div>
            <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <MessageSquareText size={20} className="text-primary" />
              Pergunte à IA sobre este vídeo
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">
              Respostas fundamentadas nos comentários, com as fontes citadas e clicáveis
            </p>
          </div>
          <AskInsight youtubeId={youtubeId} />
        </div>
      </section>

      {/* Resumo */}
      <SummaryCards data={summary} loading={loading} />

      {/* Gráficos: tudo à vista, sem abas a esconder metade */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-2">
          <BarChart3 size={13} className="text-primary" />
          Análise
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-4">
            <IntentionsDonut data={intentions} loading={loading} />
          </div>
          {/* Célula relativa: estica para igualar a altura do Donut via items-stretch */}
          <div className="lg:col-span-5 relative min-h-[300px]">
            <div className="absolute inset-0">
              <ProductsTable data={products} loading={loading} />
            </div>
          </div>
          <div className="lg:col-span-3">
            <SentimentBars data={sentiment} loading={loading} />
          </div>
        </div>
      </section>

      {/* Insights */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-2">
          <Sparkles size={13} className="text-primary" />
          Insights
        </h3>
        <InsightCards youtubeId={youtubeId} />
      </section>
    </div>
  );
}
