import { get, post, del } from './client';
import type { Video } from './types';

export const fetchVideos = () => get<Video[]>('/video/list');

export const registerVideo = (video_url: string, titulo?: string) =>
  post<Video>('/video/register', { video_url, titulo });

export const deleteVideo = (youtube_id: string) =>
  del<{ youtube_id: string; deleted_comments: number }>(`/video/${youtube_id}`);
