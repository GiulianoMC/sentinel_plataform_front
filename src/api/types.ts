export interface Video {
  id: number;
  youtube_id: string;
  titulo: string | null;
  created_at: string;
  ultimo_comentario_verificado_em: string | null;
}

export interface VideoSummary {
  youtube_id: string;
  total_comments: number;
  analyzed_comments: number;
  average_sentiment: number | null;
}

export interface VideoOverviewItem extends VideoSummary {
  titulo: string | null;
  created_at: string;
}

export interface VideoOverview {
  total_videos: number;
  total_comments: number;
  analyzed_comments: number;
  average_sentiment: number | null;
  videos: VideoOverviewItem[];
}

export interface IntentItem {
  intent: string;
  count: number;
}

export interface IntentionsResponse {
  youtube_id: string;
  intentions: IntentItem[];
}

export interface ProductItem {
  product_name: string;
  count: number;
  average_sentiment: number;
}

export interface ProductsResponse {
  youtube_id: string;
  products: ProductItem[];
}

export interface SentimentResponse {
  youtube_id: string;
  distribution: Record<string, number>;
}
