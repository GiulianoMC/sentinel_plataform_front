import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, ArrowRight, Check, Loader2, Mail, UserPlus } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { TextField } from '../components/auth/TextField';
import { PasswordField } from '../components/auth/PasswordField';

const MIN_PASSWORD = 8;

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState(0);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordOk = password.length >= MIN_PASSWORD;
  const confirmOk = confirmPassword.length > 0 && confirmPassword === password;
  const confirmMismatch = confirmPassword.length > 0 && confirmPassword !== password;
  const canSubmit = email.trim().length > 0 && passwordOk && confirmOk && !loading;

  function fail(message: string) {
    setError(message);
    setErrorKey(k => k + 1);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) return fail('As senhas não coincidem');
    if (!passwordOk) return fail(`A senha deve ter pelo menos ${MIN_PASSWORD} caracteres`);

    setLoading(true);
    setError(null);
    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      fail((err as Error).message || 'Não foi possível criar a conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="relative animate-rise [animation-delay:80ms]">
        <div aria-hidden className="absolute -inset-px rounded-[1.6rem] bg-gradient-to-br from-primary/40 via-transparent to-tertiary/30 opacity-70" />

        <div className="relative rounded-3xl border border-white/5 bg-surface-container/80 p-7 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-9">
          <div className="mb-8">
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <UserPlus size={22} />
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">Criar conta</h2>
            <p className="mt-1 text-sm text-on-surface-variant/80">Leva menos de um minuto.</p>
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
            />

            <PasswordField
              name="password"
              autoComplete="new-password"
              placeholder="Mínimo de 8 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={MIN_PASSWORD}
              disabled={loading}
              hint={
                password.length > 0 && (
                  <span className={`flex items-center gap-1 animate-fade-in ${passwordOk ? 'text-green-400' : 'text-on-surface-variant/70'}`}>
                    {passwordOk ? <Check size={12} /> : null}
                    {passwordOk ? 'Senha com tamanho adequado' : `${password.length}/${MIN_PASSWORD} caracteres`}
                  </span>
                )
              }
            />

            <PasswordField
              label="Confirmar senha"
              name="confirm-password"
              autoComplete="new-password"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              error={confirmMismatch}
              hint={
                confirmMismatch ? (
                  <span className="flex items-center gap-1 text-error animate-fade-in"><AlertCircle size={12} /> As senhas não coincidem</span>
                ) : confirmOk ? (
                  <span className="flex items-center gap-1 text-green-400 animate-fade-in"><Check size={12} /> As senhas coincidem</span>
                ) : null
              }
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
              disabled={!canSubmit}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-tr from-primary to-primary-container py-3 text-sm font-bold text-on-primary-container shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/25 opacity-0 transition-all duration-500 group-hover:left-full group-hover:opacity-100"
              />
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Criando conta…
                </>
              ) : (
                <>
                  Registrar
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
            Já tem conta?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary-fixed hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
