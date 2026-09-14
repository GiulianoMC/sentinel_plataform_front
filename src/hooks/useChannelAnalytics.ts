import { useCallback, useEffect, useState } from 'react';
import { fetchChannelIntentions, fetchChannelProducts, fetchChannelSentiment } from '../api/analytics';
import type {
  ChannelIntentionsResponse,
  ChannelProductsResponse,
  ChannelSentimentResponse,
} from '../api/types';

interface State {
  intentions: ChannelIntentionsResponse | null;
  products:   ChannelProductsResponse | null;
  sentiment:  ChannelSentimentResponse | null;
  loading:    boolean;
  error:      string | null;
}

const INITIAL: State = { intentions: null, products: null, sentiment: null, loading: false, error: null };

/**
 * Métricas agregadas de um canal (todos os vídeos do utilizador nele).
 * Com channelId null não faz nada — a Visão Geral sem filtro só mostra os KPIs.
 * O resumo (totais/sentimento médio) já vem no /analytics/overview?channel_id=,
 * por isso aqui só se pedem as três distribuições.
 */
export function useChannelAnalytics(channelId: string | null) {
  const [state, setState] = useState<State>(INITIAL);

  const load = useCallback(() => {
    if (!channelId) { setState(INITIAL); return; }
    setState(s => ({ ...s, loading: true, error: null }));
    Promise.all([
      fetchChannelIntentions(channelId),
      fetchChannelProducts(channelId, 10),
      fetchChannelSentiment(channelId),
    ])
      .then(([intentions, products, sentiment]) =>
        setState({ intentions, products, sentiment, loading: false, error: null }),
      )
      .catch((e: Error) => setState(s => ({ ...s, loading: false, error: e.message })));
  }, [channelId]);

  useEffect(() => {
    setState(INITIAL);
    load();
  }, [load]);

  return { ...state, refetch: load };
}
