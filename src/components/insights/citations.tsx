import { useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

// Captura qualquer par de colchetes curto — inclusive os cheios (【6】) que o
// modelo às vezes produz. O conteúdo é validado depois: o que não for uma
// lista de números volta a ser texto simples, nunca é descartado.
const BRACKETED = /(\[[^[\]\n]{1,40}\]|【[^【】\n]{1,40}】)/g;
// Separadores vistos na prática: "[1]", "[1, 2]", "[1;2]", "[1 e 2]".
const NUMERIC_CITATION = /^[\s\d,;]*\d[\s\d,;e]*$/i;
const HIGHLIGHT_MS = 2_000;

const citationClass =
  'rounded bg-primary/15 px-1.5 py-0.5 text-[11px] font-bold text-primary ' +
  'hover:bg-primary/25 transition-colors cursor-pointer';

/**
 * Parte um texto nas citações [i] (ou [i, j]) e transforma-as em botões que
 * levam até a evidência correspondente. `maxIndex` é o tamanho da lista de
 * evidências.
 *
 * Serve tanto a resposta do /ask (índice = posição em `sources`) como o
 * conteúdo dos cards (índice = posição 1-based em `evidence_ids`).
 *
 * Princípio: nada de texto desaparece. Um marcador que não casa com o formato,
 * ou que aponta para fora do intervalo, é renderizado como texto inerte — antes
 * um número sem link do que uma frase truncada sem explicação.
 */
export function renderCitations(
  text: string,
  maxIndex: number,
  onCite: (index: number) => void,
): ReactNode[] {
  return text.split(BRACKETED).map((part, i) => {
    const inner = part.replace(/^[[【]|[\]】]$/g, '');
    if (inner === part || !NUMERIC_CITATION.test(inner)) return part;

    const numbers = inner
      .split(/[,;]|\be\b/i)
      .map(n => Number(n.trim()))
      .filter(n => Number.isInteger(n) && n >= 1);

    if (numbers.length === 0) return part;

    return (
      <span key={i} className="inline-flex gap-1 mx-0.5 align-baseline">
        {numbers.map(n =>
          n <= maxIndex ? (
            <button
              key={n}
              type="button"
              onClick={() => onCite(n)}
              aria-label={`Ver comentário ${n} que fundamenta esta afirmação`}
              className={citationClass}
            >
              {n}
            </button>
          ) : (
            // Fora do intervalo: sem evidência para abrir, mas continua visível
            <span key={n} className="text-on-surface-variant/60 text-[11px] font-bold">
              {n}
            </span>
          ),
        )}
      </span>
    );
  });
}

/**
 * Guarda os nós das evidências por índice de citação e faz o scroll com
 * destaque temporário. `focusIndex` devolve false quando ainda não há nó
 * registado para aquele índice (lista por renderizar, ou id omitido pelo back).
 */
export function useCitationRefs() {
  const refs = useRef<Record<number, HTMLDivElement | null>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => { pending.forEach(clearTimeout); };
  }, []);

  const registerRef = useCallback((index: number, el: HTMLDivElement | null) => {
    refs.current[index] = el;
  }, []);

  const resetRefs = useCallback(() => { refs.current = {}; }, []);

  const focusIndex = useCallback((index: number): boolean => {
    const el = refs.current[index];
    if (!el) return false;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('ring-2', 'ring-primary');
    timers.current.push(
      setTimeout(() => el.classList.remove('ring-2', 'ring-primary'), HIGHLIGHT_MS),
    );
    return true;
  }, []);

  return { registerRef, resetRefs, focusIndex };
}
