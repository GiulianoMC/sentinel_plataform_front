export interface Video {
  id: number;
  youtube_id: string;
  titulo: string | null;
  /** null = registado antes do filtro por canal; corrigível via backfillVideoChannels() */
  channel_id: string | null;
  channel_title: string | null;
  published_at: string | null;
  created_at: string;
  ultimo_comentario_verificado_em: string | null;
}

/** GET /video/channels — lista leve para dropdowns. */
export interface Channel {
  channel_id: string;
  channel_title: string | null;
  video_count: number;
}

export interface VideoSummary {
  youtube_id: string;
  total_comments: number;
  analyzed_comments: number;
  average_sentiment: number | null;
}

export interface VideoOverviewItem extends VideoSummary {
  titulo: string | null;
  channel_id: string | null;
  channel_title: string | null;
  created_at: string;
}

/** GET /analytics/overview[?channel_id=] — com filtro, tudo é só daquele canal. */
export interface VideoOverview {
  channel_id: string | null;       // filtro aplicado; null = todos os vídeos
  total_videos: number;
  total_comments: number;
  analyzed_comments: number;
  average_sentiment: number | null;
  videos: VideoOverviewItem[];
}

// ---------------------------------------------------------------------------
// Analytics por canal
// ---------------------------------------------------------------------------

export interface ChannelOverviewItem {
  channel_id: string;
  channel_title: string | null;
  total_videos: number;
  total_comments: number;
  analyzed_comments: number;
  average_sentiment: number | null;
}

/** GET /analytics/channels */
export interface ChannelsOverview {
  total_channels: number;
  /** Vídeos com channel_id NULL — o front oferece o backfill quando > 0. */
  videos_without_channel: number;
  channels: ChannelOverviewItem[];
}

/** GET /analytics/channels/{id}/summary */
export interface ChannelSummary extends ChannelOverviewItem {}

/** As métricas por canal têm o mesmo corpo das por vídeo, só muda o id. */
export interface ChannelIntentionsResponse {
  channel_id: string;
  intentions: IntentItem[];
}

export interface ChannelProductsResponse {
  channel_id: string;
  products: ProductItem[];
}

export interface ChannelSentimentResponse {
  channel_id: string;
  distribution: Record<string, number>;
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

// ---------------------------------------------------------------------------
// Módulo de Insights
// ---------------------------------------------------------------------------

/**
 * Âmbito de uma pergunta à IA. O /ask e as perguntas sugeridas existem em dois
 * escopos, um vídeo ou um canal inteiro; o resto dos insights é só por vídeo.
 */
export type AskScope =
  | { kind: 'video'; id: string }
  | { kind: 'channel'; id: string };

/** Filtros estruturados, partilhados entre /search e /ask. */
export interface InsightFilters {
  sentiment_min?: number | null;   // 1..5
  sentiment_max?: number | null;   // 1..5
  intent?: string | null;          // valor exato, case-sensitive
  product?: string | null;         // o back normaliza para lowercase
}

export type InsightStrategy = 'auto' | 'semantic' | 'sample';

/** GET /insights/{id}/search — a resposta é um ARRAY puro destes, sem envelope. */
export interface HybridSearchResult {
  id: string;                      // = Comment.id do YouTube
  text: string;
  author: string;
  published_at: string;            // ISO
  sentiment: number | null;        // null = ainda não analisado pela IA
  intent: string | null;
  product_mentioned: string | null;
  distance: number;                // distância de cosseno; menor = mais relevante
}

/** GET /insights/{id}/suggested-questions */
export interface SuggestedQuestion {
  question: string;
  reason: string;                  // slug de máquina, traduzido em reasonLabel()
  strategy: InsightStrategy;       // REENVIAR ao /ask
  filters: InsightFilters | null;  // REENVIAR ao /ask
}

export interface SuggestedQuestionsResponse {
  youtube_id: string | null;       // null no escopo canal
  channel_id: string | null;       // null no escopo vídeo
  questions: SuggestedQuestion[];
}

/** POST /insights/{id}/ask */
export interface AskRequest {
  question: string;                // 3..500 caracteres
  strategy?: InsightStrategy;      // default "auto"
  filters?: InsightFilters | null;
}

export interface SourceComment {
  index: number;                   // o [i] citado na resposta
  id: string;
  author: string;
  text: string;                    // truncado em 300 chars (o que entrou no prompt)
  sentiment: number | null;
  intent: string | null;
  product_mentioned: string | null;
  distance: number | null;         // null quando strategy_used === "sample"
  /** De que vídeo veio a evidência; no escopo canal as fontes misturam vídeos. */
  youtube_id: string;
  video_title: string | null;
}

export interface AskResponse {
  answer: string;
  sources: SourceComment[];
  strategy_used: 'semantic' | 'sample';
  comments_in_context: number;
  llm_called: boolean;             // false = não havia evidência, LLM foi pulado
}

/** GET/POST /insights/{id}/cards */
export type InsightCardKind =
  | 'resumo' | 'reclamacao_principal' | 'elogio_principal' | 'duvidas';

export interface InsightCard {
  kind: InsightCardKind;
  status: 'pending' | 'ready' | 'error';
  content: string | null;
  evidence_ids: string[] | null;
  generated_at: string | null;     // ISO
}

export interface InsightCardsResponse {
  youtube_id: string;
  cards: InsightCard[];            // [] quando ainda não há nenhum
  stale: boolean;                  // do envelope, NÃO de cada card
  generating: boolean;
  analyzed_now: number;
}

/**
 * POST /insights/{id}/comments/by-ids — resolve `evidence_ids` dos cards em
 * comentários completos. A resposta é um ARRAY puro, na mesma ordem dos ids
 * pedidos; ids inexistentes ou de outro vídeo são omitidos silenciosamente,
 * por isso pode vir menor do que a lista enviada.
 */
export interface CommentDetail {
  id: string;
  text: string;                    // texto integral, não truncado
  author: string;
  published_at: string;            // ISO
  sentiment: number | null;
  intent: string | null;
  product_mentioned: string | null;
}
