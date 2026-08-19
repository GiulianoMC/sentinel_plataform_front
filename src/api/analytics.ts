import { get, post } from './client';
import type { VideoOverview, VideoSummary, IntentionsResponse, ProductsResponse, SentimentResponse } from './types';

export const fetchOverview = () =>
  get<VideoOverview>('/analytics/overview');

export const fetchSummary = (id: string) =>
  get<VideoSummary>(`/analytics/${id}/summary`);

export const fetchIntentions = (id: string) =>
  get<IntentionsResponse>(`/analytics/${id}/intentions`);

export const fetchProducts = (id: string, limit = 10) =>
  get<ProductsResponse>(`/analytics/${id}/products?limit=${limit}`);

export const fetchSentiment = (id: string) =>
  get<SentimentResponse>(`/analytics/${id}/sentiment`);

export interface ReprocessResult {
  enqueued: number;
  message?: string;
}

export const reprocessAI = (youtubeId: string, onlyErrors = true) =>
  post<ReprocessResult>(
    `/reprocess/ai?youtube_id=${youtubeId}&only_errors=${onlyErrors}`,
    null,
  );
