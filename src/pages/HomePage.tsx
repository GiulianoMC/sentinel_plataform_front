import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clapperboard, Layers, PlusSquare, RefreshCw } from 'lucide-react';
import type { AskRequest } from '../api/types';
import { useOverview } from '../hooks/useOverview';
import { useChannelsData } from '../context/ChannelsContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ScopeStats } from '../components/ScopeStats';
import { HomeAsk } from '../components/home/HomeAsk';
import { RecentQuestions } from '../components/home/RecentQuestions';
import { InsightsFeed } from '../components/home/InsightsFeed';
import { ProcessingList } from '../components/home/ProcessingList';
import { SentimentRanking } from '../components/home/SentimentRanking';
import { CHANNELS_PATH, REGISTER_PATH, channelSegment, videoPath } from '../lib/routes';

/** Quantos vídeos entram no feed de sínteses; cada um é uma chamada. */
const FEED_SIZE = 3;

const today = () =>
  new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });

/**
 * Início: o estado do produto num ecrã. O RAG à frente, porque é a interacção
 * principal, e a seguir o que a IA já sintetizou, o que está a processar e onde
 * o sentimento está pior. A comparação entre canais vive na tela de Canais.
 */
export function HomePage() {
  const navigate = useNavigate();
  const { overview, loading, error, refetch } = useOverview(null);
  const { channels, loading: channelsLoading } = useChannelsData();

  const videos = overview?.videos ?? [];

  // Âmbito da pergunta e pergunta pendente vinda do histórico.
  const [askVideoId, setAskVideoId] = useState<string | null>(null);
  const [pendingAsk, setPendingAsk] = useState<AskRequest | null>(null);

  // Por defeito pergunta-se sobre o vídeo com mais comentários analisados: é o
  // que tem contexto suficiente para a resposta não sair vazia.
  useEffect(() => {
    if (videos.length === 0) return;
    const stillListed = askVideoId != null && videos.some(v => v.youtube_id === askVideoId);
    if (stillListed) return;
    const best = [...videos].sort((a, b) => b.analyzed_comments - a.analyzed_comments)[0];
    setAskVideoId(best.youtube_id);
  }, [videos, askVideoId]);

  // Vídeos mais recentes primeiro: é o que interessa num feed.
  const recent = useMemo(
    () => [...videos]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, FEED_SIZE),
    [videos],
  );

  const openVideo = (youtubeId: string) => {
    const v = videos.find(x => x.youtube_id === youtubeId);
    navigate(videoPath(channelSegment(v?.channel_id), youtubeId));
  };

  function repeatQuestion(youtubeId: string, request: AskRequest) {
    setAskVideoId(youtubeId);
    setPendingAsk(request);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const nothingRegistered = !loading && !error && videos.length === 0;

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="min-w-0">
          <Breadcrumbs items={[{ label: 'Início' }]} />
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Visão Geral</h2>
          <p className="text-xs text-on-surface-variant mt-1 first-letter:uppercase">
            {today()}
            {!channelsLoading && channels.length > 0 && (
              <>
                {' · '}
                {channels.length} {channels.length === 1 ? 'canal' : 'canais'}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate(CHANNELS_PATH)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors border border-outline-variant/10"
          >
            <Layers size={16} />
            Ver canais
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

      {error && (
        <div className="glass-card rounded-xl p-4 border border-error/20 text-error text-sm">{error}</div>
      )}

      {nothingRegistered ? (
        <div className="glass-card rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Clapperboard size={28} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Nenhum vídeo registado ainda</p>
            <p className="text-xs text-on-surface-variant mt-1">
              Registe um vídeo do YouTube para a Sentinela começar a ler os comentários.
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
      ) : (
        <>
          {/* Dados gerais: aqui somar tudo faz sentido, é o estado do produto */}
          <ScopeStats
            data={overview}
            loading={loading}
            videosLabel="Vídeos registados"
            sentimentLabel="Sentimento médio geral"
          />

          {/* RAG à frente, com o histórico e o processamento em coluna ao lado */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2">
              <HomeAsk
                videos={videos}
                loading={loading}
                selectedId={askVideoId}
                onSelect={id => { setAskVideoId(id); setPendingAsk(null); }}
                pendingRequest={pendingAsk}
              />
            </div>
            <div className="space-y-6">
              <RecentQuestions onRepeat={repeatQuestion} />
              <ProcessingList videos={videos} loading={loading} onOpenVideo={openVideo} />
            </div>
          </div>

          <InsightsFeed videos={recent} onOpenVideo={openVideo} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SentimentRanking videos={videos} loading={loading} mode="atencao" onOpenVideo={openVideo} />
            <SentimentRanking videos={videos} loading={loading} mode="melhores" onOpenVideo={openVideo} />
          </div>
        </>
      )}
    </div>
  );
}
