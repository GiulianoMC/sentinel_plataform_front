import { get, post, del } from './client';
import type { Channel, Video } from './types';

export const fetchVideos = (channelId?: string | null) =>
  get<Video[]>(channelId ? `/video/list?channel_id=${encodeURIComponent(channelId)}` : '/video/list');

export const fetchChannels = () => get<Channel[]>('/video/channels');

export const registerVideo = (video_url: string, titulo?: string) =>
  post<Video>('/video/register', { video_url, titulo });

export const deleteVideo = (youtube_id: string) =>
  del<{ youtube_id: string; deleted_comments: number }>(`/video/${youtube_id}`);

export interface BackfillChannelsResult {
  total: number;
  updated: number;
  not_found: number;
  message: string;
}

/**
 * Preenche channel_id/channel_title dos vídeos registados antes do filtro por
 * canal existir (a coluna ficava NULL). 503 se o back não tiver YOUTUBE_API_KEY.
 */
export const backfillVideoChannels = (force = false) =>
  post<BackfillChannelsResult>(`/reprocess/video-channels?force=${force}`, null);
