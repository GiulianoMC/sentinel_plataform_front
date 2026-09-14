import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, LogIn, Mail } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { TextField } from '../components/auth/TextField';
import { PasswordField } from '../components/auth/PasswordField';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Incrementa a cada erro para reiniciar a animação de "tremer" mesmo
  // quando a mensagem é a mesma.
  const [errorKey, setErrorKey] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      setSuccess(true);
      // Pequena pausa para o usuário ver a confirmação antes de trocar de tela.
      setTimeout(() => navigate('/'), 450);
    } catch (err) {
      setError((err as Error).message || 'Não foi possível entrar. Tente novamente.');
      setErrorKey(k => k + 1);
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="relative animate-rise [animation-delay:80ms]">
        {/* Borda com gradiente atrás do cartão */}
        <div aria-hidden className="absolute -inset-px rounded-[1.6rem] bg-gradient-to-br from-primary/40 via-transparent to-tertiary/30 opacity-70" />

        <div className="relative rounded-3xl border border-white/5 bg-surface-container/80 p-7 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-9">
          <div className="mb-8">
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <LogIn size={22} />
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">Bem-vindo de volta</h2>
            <p className="mt-1 text-sm text-on-surface-variant/80">Entre com a sua conta para acessar o painel.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <TextField
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              autoFocus
              inputMode="email"
              placeholder="voce@empresa.com"
              icon={<Mail size={18} />}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              error={!!error}
            />

            <PasswordField
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              error={!!error}
            />

            {error && (
              <div
                key={errorKey}
                role="alert"
                className="animate-shake flex items-start gap-2.5 rounded-xl border border-error/30 bg-error/10 px-3.5 py-3 text-sm text-error"
              >
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || success}
              className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3 text-sm font-bold transition-all duration-200
                ${success
                  ? 'bg-green-400/20 text-green-300 border border-green-400/30'
                  : 'bg-gradient-to-tr from-primary to-primary-container text-on-primary-container shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0 active:scale-[0.99]'}
                disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg`}
            >
              {/* Brilho que atravessa o botão no hover */}
              {!success && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/25 opacity-0 transition-all duration-500 group-hover:left-full group-hover:opacity-100"
                />
              )}
              {success ? (
                <>
                  <CheckCircle2 size={18} className="animate-pop-in" />
                  Tudo certo! Redirecionando…
                </>
              ) : loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Entrando…
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-on-surface-variant/40">
            <span className="h-px flex-1 bg-outline-variant/30" />
            ou
            <span className="h-px flex-1 bg-outline-variant/30" />
          </div>

          <p className="text-center text-sm text-on-surface-variant">
            Ainda não tem conta?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary-fixed hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
