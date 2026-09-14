import { useState } from 'react';
import { Tv, Wand2, X } from 'lucide-react';
import { backfillVideoChannels } from '../api/videos';
import { ApiError } from '../api/client';

interface Props {
  /** Quantos vídeos estão com channel_id NULL. */
  count: number;
  /** Chamado após um backfill com sucesso, para recarregar canais e vídeos. */
  onDone: () => void;
}

/**
 * Oferece o backfill de canais para os vídeos registados antes desta
 * funcionalidade. Sem ele, esses vídeos ficam fora de qualquer canal.
 */
export function BackfillBanner({ count, onDone }: Props) {
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  if (count <= 0 && !msg) return null;

  async function run() {
    setRunning(true);
    setMsg(null);
    try {
      const r = await backfillVideoChannels();
      setMsg({
        type: 'ok',
        text: r.not_found > 0
          ? `${r.updated} vídeo(s) identificados; ${r.not_found} não encontrados no YouTube (apagados ou privados).`
          : `${r.updated} vídeo(s) identificados.`,
      });
      onDone();
    } catch (e) {
      const err = e as ApiError;
      setMsg({
        type: 'err',
        text: err.status === 503
          ? 'A YouTube API não está configurada no servidor (YOUTUBE_API_KEY). Sem ela não é possível identificar canais.'
          : err.message,
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-3">
      {count > 0 && (
        <div className="glass-card rounded-xl p-4 border border-tertiary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-tertiary/10 shrink-0">
              <Tv size={16} className="text-tertiary" />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">
                {count} {count === 1 ? 'vídeo sem canal identificado' : 'vídeos sem canal identificado'}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Foram registados antes do filtro por canal existir. Ficam fora dos agregados de canal até serem identificados.
              </p>
            </div>
          </div>
          <button
            onClick={run}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tertiary/10 text-tertiary text-xs font-bold hover:bg-tertiary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 w-fit"
          >
            <Wand2 size={14} className={running ? 'animate-pulse' : ''} />
            {running ? 'A identificar...' : 'Identificar canais'}
          </button>
        </div>
      )}

      {msg && (
        <div
          className={`glass-card rounded-xl p-4 border text-sm flex items-center justify-between gap-4 ${
            msg.type === 'ok' ? 'border-green-400/20 text-green-400' : 'border-error/20 text-error'
          }`}
        >
          <span>{msg.text}</span>
          <button
            onClick={() => setMsg(null)}
            aria-label="Fechar"
            className="text-xs opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
