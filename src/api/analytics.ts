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

export interface ChromaMetadataResult {
  updated?: number;
  message?: string;
}

/**
 * Backfill dos metadados no ChromaDB. Comentários indexados antes do
 * write-back só têm video_id gravado e não passam em nenhum filtro da busca
 * semântica — sem isto, a busca filtrada volta vazia.
 */
export const reprocessChromaMetadata = (youtubeId: string) =>
  post<ChromaMetadataResult>(`/reprocess/chroma-metadata?youtube_id=${youtubeId}`, null);
