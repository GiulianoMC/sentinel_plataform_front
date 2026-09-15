import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clapperboard, Layers, PlusSquare, RefreshCw } from 'lucide-react';
import type { AskRequest, AskScope } from '../api/types';
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
  const [askScope, setAskScope] = useState<AskScope | null>(null);
  const [pendingAsk, setPendingAsk] = useState<AskRequest | null>(null);
  // Escolha deliberada (fita ou histórico) não é substituída pelo automático.
  const chosen = useRef(false);

  // Por defeito pergunta-se sobre o canal com mais comentários analisados: é o
  // que tem contexto suficiente para a resposta não sair vazia. Sem canais
  // identificados o /ask por canal não existe, e o âmbito volta a ser um vídeo.
  useEffect(() => {
    const listed = (scope: AskScope) =>
      scope.kind === 'channel'
        ? channels.some(c => c.channel_id === scope.id)
        : videos.some(v => v.youtube_id === scope.id);

    if (chosen.current) {
      if (askScope != null && listed(askScope)) return;
      chosen.current = false;   // o âmbito escolhido deixou de existir
    }

    const best: AskScope | null = channels.length > 0
      ? {
          kind: 'channel',
          id: [...channels].sort((a, b) => b.analyzed_comments - a.analyzed_comments)[0].channel_id,
        }
      : videos.length > 0
        ? {
            kind: 'video',
            id: [...videos].sort((a, b) => b.analyzed_comments - a.analyzed_comments)[0].youtube_id,
          }
        : null;

    if (!best) return;
    if (askScope?.kind === best.kind && askScope.id === best.id) return;
    setAskScope(best);
  }, [channels, videos, askScope]);

  const selectScope = (scope: AskScope) => {
    chosen.current = true;
    setAskScope(scope);
  };

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

  // Repetir uma pergunta do histórico mantém-se na Home, seja ela de canal ou
  // de vídeo: o âmbito passa a ser o dela e a caixa reenvia-a.
  function repeatQuestion(scope: AskScope, request: AskRequest) {
    selectScope(scope);
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
            showSentiment={false}
          />

          {/* RAG à frente, com o histórico e o processamento em coluna ao lado */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            {/* min-w-0: sem isto a coluna estica-se até caber a fita inteira e
                ela deixa de rolar na horizontal em ecrãs estreitos. */}
            <div className="min-w-0 xl:col-span-2">
              <HomeAsk
                videos={videos}
                loading={loading}
                scope={askScope}
                onSelect={scope => { selectScope(scope); setPendingAsk(null); }}
                pendingRequest={pendingAsk}
              />
            </div>
            <div className="min-w-0 space-y-6">
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
