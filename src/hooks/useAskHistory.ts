import { useCallback, useEffect, useState } from 'react';
import type { AskScope, InsightFilters, InsightStrategy } from '../api/types';

const KEY = 'sentinela:perguntas-recentes';
const MAX = 8;
/** Evento próprio: o storage nativo só avisa outras abas, não esta. */
const CHANGED = 'sentinela:perguntas-recentes:alterado';

export interface AskHistoryEntry {
  question: string;
  /** Vídeo ou canal sobre o qual a pergunta foi feita. */
  scope: AskScope;
  /** Título do âmbito; o id sozinho não diz nada a ninguém. */
  scopeTitle: string | null;
  strategy: InsightStrategy | 'semantic' | 'sample';
  filters: InsightFilters | null;
  /** ISO. Quando a pergunta foi feita. */
  askedAt: string;
  /** Quantos comentários entraram no contexto da resposta. */
  commentsInContext: number;
  answered: boolean;
}

/** Forma anterior ao âmbito por canal, ainda presente no localStorage. */
interface LegacyEntry extends Omit<AskHistoryEntry, 'scope' | 'scopeTitle'> {
  scope?: AskScope;
  scopeTitle?: string | null;
  youtubeId?: string;
  videoTitle?: string | null;
}

/** Duas entradas são a mesma se a pergunta e o âmbito coincidirem. */
const sameEntry = (a: AskHistoryEntry, b: AskHistoryEntry) =>
  a.question === b.question && a.scope.kind === b.scope.kind && a.scope.id === b.scope.id;

/** Entradas gravadas antes do âmbito por canal eram sempre sobre um vídeo. */
function migrate(entry: LegacyEntry): AskHistoryEntry | null {
  if (entry.scope) return entry as AskHistoryEntry;
  if (!entry.youtubeId) return null;
  const { youtubeId, videoTitle, ...rest } = entry;
  return { ...rest, scope: { kind: 'video', id: youtubeId }, scopeTitle: videoTitle ?? null };
}

function read(): AskHistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as LegacyEntry[])
      .map(migrate)
      .filter((e): e is AskHistoryEntry => e != null);
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
  write([entry, ...read().filter(e => !sameEntry(e, entry))]);
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
    write(read().filter(e => !sameEntry(e, entry)));
  }, []);

  return { entries, clear, remove };
}
