import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSummary, fetchIntentions, fetchProducts, fetchSentiment } from '../api/analytics';
import type { VideoSummary, IntentionsResponse, ProductsResponse, SentimentResponse } from '../api/types';

// Enquanto há comentários por analisar: polling rápido; quando estável: lento
const POLL_ACTIVE_MS  = 5_000;
const POLL_IDLE_MS    = 30_000;

interface AnalyticsState {
  summary:    VideoSummary | null;
  intentions: IntentionsResponse | null;
  products:   ProductsResponse | null;
  sentiment:  SentimentResponse | null;
  loading:    boolean;
  error:      string | null;
}

const INITIAL: AnalyticsState = {
  summary: null, intentions: null, products: null, sentiment: null,
  loading: false, error: null,
};

export function useAnalytics(youtubeId: string | null) {
  const [state, setState] = useState<AnalyticsState>(INITIAL);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback((silent = false) => {
    if (!youtubeId) return;
    setState(s => ({ ...s, loading: !silent, error: null }));
    Promise.all([
      fetchSummary(youtubeId),
      fetchIntentions(youtubeId),
      fetchProducts(youtubeId, 10),
      fetchSentiment(youtubeId),
    ])
      .then(([summary, intentions, products, sentiment]) => {
        setState({ summary, intentions, products, sentiment, loading: false, error: null });
      })
      .catch((e: Error) => {
        setState(s => ({ ...s, loading: false, error: e.message }));
      });
  }, [youtubeId]);

  // Carrega ao mudar de vídeo (com spinner)
  useEffect(() => {
    setState(INITIAL);
    load(false);
  }, [load]);

  // Polling adaptativo sem spinner — usa os dados anteriores enquanto atualiza em background
  useEffect(() => {
    if (!youtubeId) return;

    const schedule = () => {
      const isProcessing =
        state.summary != null &&
        state.summary.analyzed_comments < state.summary.total_comments;

      timerRef.current = setTimeout(() => {
        load(true); // silent: não mostra spinner, só atualiza os dados
        schedule();
      }, isProcessing ? POLL_ACTIVE_MS : POLL_IDLE_MS);
    };

    schedule();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId, state.summary?.analyzed_comments, state.summary?.total_comments]);

  const isProcessing =
    state.summary != null &&
    state.summary.analyzed_comments < state.summary.total_comments;

  return { ...state, refetch: () => load(false), isProcessing };
}
