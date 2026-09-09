import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { ApiError } from '../../api/client';

interface Described {
  message: string;
  retryAfter?: number;
}

function describe(error: Error): Described {
  if (!(error instanceof ApiError)) return { message: error.message };

  switch (error.status) {
    case 429:
      return { message: 'Muitas perguntas em pouco tempo.', retryAfter: error.retryAfter ?? 60 };
    case 503:
      return error.retryAfter
        ? { message: 'Cota do serviço de IA esgotada.', retryAfter: error.retryAfter }
        : { message: 'Serviço de IA indisponível no momento.' };
    case 504:
      return { message: 'A IA demorou a responder. Tente uma pergunta mais curta.' };
    case 404:
      return { message: 'Vídeo não encontrado.' };
    default:
      return { message: error.message };
  }
}

interface CountdownProps {
  seconds: number;
  onComplete: () => void;
}

/**
 * Deriva o restante de um instante-alvo, não de decrementos acumulados: com a
 * aba em segundo plano os timers são estrangulados e um contador incremental
 * ficaria para trás.
 */
function Countdown({ seconds, onComplete }: CountdownProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const deadline = Date.now() + seconds * 1000;
    let id: ReturnType<typeof setInterval>;
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        clearInterval(id);   // senão continua a disparar onComplete a cada segundo
        onComplete();
      }
    };
    id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [seconds, onComplete]);

  return <span className="font-mono font-bold">{remaining}s</span>;
}

interface Props {
  error: Error;
  /** Memoize no pai (useCallback), senão o efeito do countdown reinicia. */
  onExpire: () => void;
  onRetry?: () => void;
}

export function InsightError({ error, onExpire, onRetry }: Props) {
  const { message, retryAfter } = describe(error);
  const handleComplete = useCallback(() => onExpire(), [onExpire]);

  return (
    <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error flex items-start gap-3">
      <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{message}</p>
        {retryAfter ? (
          <p className="text-xs mt-1 opacity-80">
            Pode tentar novamente em <Countdown seconds={retryAfter} onComplete={handleComplete} />.
          </p>
        ) : (
          onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-error/15 px-3 py-1.5 text-xs font-semibold hover:bg-error/25 transition-colors"
            >
              <RotateCw size={12} />
              Tentar novamente
            </button>
          )
        )}
      </div>
    </div>
  );
}

export function isRateLimited(error: Error | null): boolean {
  if (!error) return false;
  const { retryAfter } = describe(error);
  return retryAfter != null;
}
