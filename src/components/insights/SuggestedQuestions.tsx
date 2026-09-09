import { Sparkles, Info } from 'lucide-react';
import type { SuggestedQuestion } from '../../api/types';
import { reasonLabel } from './labels';

interface Props {
  questions: SuggestedQuestion[];
  loading: boolean;
  disabled?: boolean;
  onSelect: (question: SuggestedQuestion) => void;
}

export function SuggestedQuestions({ questions, loading, disabled, onSelect }: Props) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-7 w-44 rounded-full shimmer" />
        ))}
      </div>
    );
  }

  if (questions.length === 0) return null;

  // Quando a IA ainda não processou nada, a única sugestão vem com este slug:
  // um aviso é mais honesto do que um chip que devolveria "sem evidências".
  if (questions.length === 1 && questions[0].reason === 'sem_analise') {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-outline-variant/20 bg-surface-container p-3">
        <Info size={16} className="text-on-surface-variant flex-shrink-0 mt-0.5" />
        <p className="text-xs text-on-surface-variant">
          Os comentários deste vídeo ainda não foram analisados pela IA. As sugestões ficam disponíveis
          assim que a análise avançar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-on-surface-variant">
        <Sparkles size={12} className="text-primary" />
        Perguntas sugeridas
      </p>
      <div className="flex flex-wrap gap-2">
        {questions.map(q => (
          <button
            key={q.question}
            type="button"
            disabled={disabled}
            title={reasonLabel(q.reason)}
            onClick={() => onSelect(q)}
            className="rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium
                       hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {q.question}
          </button>
        ))}
      </div>
    </div>
  );
}
