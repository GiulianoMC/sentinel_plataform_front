import { get, post } from './client';
import type {
  AskRequest,
  AskResponse,
  CommentDetail,
  HybridSearchResult,
  InsightCardsResponse,
  InsightFilters,
  SuggestedQuestionsResponse,
} from './types';

/** Serializa os filtros como query params, omitindo os vazios. */
function filterParams(filters?: InsightFilters | null): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.sentiment_min != null) params.set('sentiment_min', String(filters.sentiment_min));
  if (filters.sentiment_max != null) params.set('sentiment_max', String(filters.sentiment_max));
  if (filters.intent) params.set('intent', filters.intent);
  if (filters.product) params.set('product', filters.product);
  const qs = params.toString();
  return qs ? `&${qs}` : '';
}

export interface SearchOptions {
  numResults?: number;
  threshold?: number;
  filters?: InsightFilters | null;
}

export const searchComments = (
  youtubeId: string,
  query: string,
  opts: SearchOptions = {},
  signal?: AbortSignal,
) =>
  get<HybridSearchResult[]>(
    `/insights/${youtubeId}/search?q=${encodeURIComponent(query)}` +
      `&num_results=${opts.numResults ?? 10}&threshold=${opts.threshold ?? 0.6}` +
      filterParams(opts.filters),
    { signal },
  );

export const fetchSuggestedQuestions = (youtubeId: string, signal?: AbortSignal) =>
  get<SuggestedQuestionsResponse>(`/insights/${youtubeId}/suggested-questions`, { signal });

export const askInsight = (youtubeId: string, body: AskRequest, signal?: AbortSignal) =>
  post<AskResponse>(`/insights/${youtubeId}/ask`, body, { signal });

export const fetchInsightCards = (youtubeId: string, signal?: AbortSignal) =>
  get<InsightCardsResponse>(`/insights/${youtubeId}/cards`, { signal });

export const generateInsightCards = (youtubeId: string, signal?: AbortSignal) =>
  post<InsightCardsResponse>(`/insights/${youtubeId}/cards/generate`, null, { signal });

/** 1 a 100 ids por chamada; fora desse intervalo o back devolve 422. */
export const fetchCommentsByIds = (youtubeId: string, ids: string[], signal?: AbortSignal) =>
  post<CommentDetail[]>(`/insights/${youtubeId}/comments/by-ids`, { ids }, { signal });
