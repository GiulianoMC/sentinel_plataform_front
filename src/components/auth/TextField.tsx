import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  /** Conteúdo à direita do input (ex.: botão de mostrar senha). */
  trailing?: ReactNode;
  /** Texto auxiliar exibido abaixo do campo. */
  hint?: ReactNode;
  error?: boolean;
}

/**
 * Campo de texto com ícone, rótulo e realce animado no foco.
 * O container inteiro reage ao foco (focus-within) para que o ícone e a borda
 * acompanhem o estado do input.
 */
export function TextField({ label, icon, trailing, hint, error, id, className = '', ...props }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="group space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/80 transition-colors group-focus-within:text-primary"
      >
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-xl border bg-surface-container-low/70 transition-all duration-200
          ${error
            ? 'border-error/50 shadow-[0_0_0_4px_rgba(255,180,171,0.10)]'
            : 'border-outline-variant/30 hover:border-outline-variant/60 focus-within:border-primary/70 focus-within:bg-surface-container-low focus-within:shadow-[0_0_0_4px_rgba(189,194,255,0.14)]'}
        `}
      >
        {icon && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-3.5 flex items-center text-on-surface-variant/50 transition-colors duration-200 group-focus-within:text-primary"
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`peer w-full bg-transparent py-3 text-sm text-on-surface placeholder:text-on-surface-variant/35 outline-none disabled:cursor-not-allowed disabled:opacity-60
            ${icon ? 'pl-11' : 'pl-4'} ${trailing ? 'pr-12' : 'pr-4'} ${className}`}
          {...props}
        />
        {trailing && <span className="absolute right-2 flex items-center">{trailing}</span>}
      </div>
      {hint && <div className="min-h-[1rem] text-xs text-on-surface-variant/70">{hint}</div>}
    </div>
  );
}
