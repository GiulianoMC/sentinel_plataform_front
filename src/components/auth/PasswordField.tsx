import { useState, type InputHTMLAttributes, type KeyboardEvent } from 'react';
import { Eye, EyeOff, Lock, TriangleAlert } from 'lucide-react';
import { TextField } from './TextField';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: boolean;
  hint?: React.ReactNode;
}

/**
 * Campo de senha com botão de mostrar/ocultar e aviso de Caps Lock.
 * O botão fica fora da ordem de tabulação (tabIndex -1) para não atrapalhar
 * quem navega pelo teclado: Tab vai direto do campo para o próximo controle.
 */
export function PasswordField({ label = 'Senha', error, hint, onKeyDown, onKeyUp, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  function trackCaps(e: KeyboardEvent<HTMLInputElement>) {
    if (typeof e.getModifierState === 'function') {
      setCapsLock(e.getModifierState('CapsLock'));
    }
  }

  const capsHint = capsLock ? (
    <span className="flex items-center gap-1 text-tertiary animate-fade-in">
      <TriangleAlert size={12} /> Caps Lock está ativado
    </span>
  ) : null;

  return (
    <TextField
      {...props}
      label={label}
      type={visible ? 'text' : 'password'}
      icon={<Lock size={18} />}
      error={error}
      hint={hint ?? capsHint}
      onKeyDown={e => { trackCaps(e); onKeyDown?.(e); }}
      onKeyUp={e => { trackCaps(e); onKeyUp?.(e); }}
      onBlur={e => { setCapsLock(false); props.onBlur?.(e); }}
      trailing={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible(v => !v)}
          disabled={props.disabled}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          title={visible ? 'Ocultar senha' : 'Mostrar senha'}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant/60 transition-all duration-200 hover:bg-primary/10 hover:text-primary active:scale-90 disabled:opacity-40"
        >
          <span key={visible ? 'off' : 'on'} className="animate-pop-in flex">
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </button>
      }
    />
  );
}
