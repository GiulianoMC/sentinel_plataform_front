import { useCallback, useEffect, useState } from 'react';
import type { InsightFilters, InsightStrategy } from '../api/types';

const KEY = 'sentinela:perguntas-recentes';
const MAX = 8;
/** Evento próprio: o storage nativo só avisa outras abas, não esta. */
const CHANGED = 'sentinela:perguntas-recentes:alterado';

export interface AskHistoryEntry {
  question: string;
  youtubeId: string;
  videoTitle: string | null;
  strategy: InsightStrategy | 'semantic' | 'sample';
  filters: InsightFilters | null;
  /** ISO. Quando a pergunta foi feita. */
  askedAt: string;
  /** Quantos comentários entraram no contexto da resposta. */
  commentsInContext: number;
  answered: boolean;
}

function read(): AskHistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AskHistoryEntry[]) : [];
  } catch {
    // Modo privado, quota cheia ou JSON corrompido: histórico vazio serve.
    return [];
  }
}

function write(entries: AskHistoryEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    // Sem persistência o produto continua a funcionar; não vale interromper.
  }
}

/** Registo fora do React, para o AskInsight gravar sem depender de render. */
export function recordAsk(entry: AskHistoryEntry) {
  const existing = read().filter(
    e => !(e.question === entry.question && e.youtubeId === entry.youtubeId),
  );
  write([entry, ...existing]);
}

/**
 * Últimas perguntas feitas à IA, por navegador. O backend não guarda histórico,
 * por isso isto vive no localStorage: serve para retomar uma linha de
 * investigação em vez de reencontrar a Home sempre em branco.
 */
export function useAskHistory() {
  const [entries, setEntries] = useState<AskHistoryEntry[]>(() => read());

  useEffect(() => {
    const sync = () => setEntries(read());
    window.addEventListener(CHANGED, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGED, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const clear = useCallback(() => write([]), []);
  const remove = useCallback((entry: AskHistoryEntry) => {
    write(read().filter(e => !(e.question === entry.question && e.youtubeId === entry.youtubeId)));
  }, []);

  return { entries, clear, remove };
}
