import { createContext, useContext, type ReactNode } from 'react';
import { useChannels } from '../hooks/useChannels';
import type { ChannelOverviewItem, ChannelsOverview } from '../api/types';

interface ChannelsState {
  channels: ChannelOverviewItem[];
  overview: ChannelsOverview | null;
  loading: boolean;
  error: string | null;
  refetchChannels: () => void;
}

const ChannelsCtx = createContext<ChannelsState | null>(null);

/**
 * Canais e agregados carregados uma vez para toda a aplicação. Sem isto, cada
 * nível da navegação (canais, canal, vídeo) repetia o mesmo /analytics/channels
 * a cada passo, e um registo ou apagar não conseguia invalidar o que os outros
 * níveis já tinham em mão.
 */
export function ChannelsProvider({ children }: { children: ReactNode }) {
  const value = useChannels();
  return <ChannelsCtx.Provider value={value}>{children}</ChannelsCtx.Provider>;
}

export function useChannelsData(): ChannelsState {
  const ctx = useContext(ChannelsCtx);
  if (!ctx) throw new Error('useChannelsData deve ser usado dentro de ChannelsProvider');
  return ctx;
}
