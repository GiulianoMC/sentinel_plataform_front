/**
 * Rotas da aplicação: a Home na raiz e a hierarquia canais → canal → vídeo.
 *
 * Cada nível tem URL próprio, por isso o voltar do browser sobe um nível e
 * qualquer nível é partilhável por link.
 */

/**
 * Pseudo-canal dos vídeos com channel_id NULL (registados antes do filtro por
 * canal existir). Não é um canal do YouTube: não tem agregados no backend, por
 * isso a tela do canal trata-o como caso especial. Os ids reais do YouTube
 * começam por "UC", logo não há colisão.
 */
export const NO_CHANNEL = 'sem-canal';

export const HOME_PATH = '/';
export const CHANNELS_PATH = '/canais';
export const VIDEO_PICKER_PATH = '/video';
export const REGISTER_PATH = '/registar';

export const channelPath = (channelId: string) => `/canal/${encodeURIComponent(channelId)}`;

export const videoPath = (channelId: string, youtubeId: string) =>
  `${channelPath(channelId)}/video/${encodeURIComponent(youtubeId)}`;

/** Canal a usar no URL de um vídeo cujo canal pode não estar identificado. */
export const channelSegment = (channelId: string | null | undefined) => channelId ?? NO_CHANNEL;

export const isNoChannel = (channelId: string | null | undefined) => channelId === NO_CHANNEL;
