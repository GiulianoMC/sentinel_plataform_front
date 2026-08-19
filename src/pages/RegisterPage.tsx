import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, Lock, Mail, UserPlus } from 'lucide-react';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Senhas não coincidem');
      return;
    }
    if (password.length < 8) {
      setError('Senha deve ter pelo menos 8 caracteres');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2 text-on-surface">
          <UserPlus size={24} />
          Criar Conta
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-on-surface-variant">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/20 focus:ring-1 focus:ring-primary text-on-surface"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-on-surface-variant">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
              className="w-full px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/20 focus:ring-1 focus:ring-primary text-on-surface"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-on-surface-variant">Confirmar Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/20 focus:ring-1 focus:ring-primary text-on-surface"
            />
          </div>
          {error && <p className="text-error text-sm flex items-center gap-1"><AlertCircle size={14} />{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-tr from-primary to-primary-container text-on-primary-container font-bold disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Registrar'}
          </button>
        </form>
        <p className="text-center text-sm text-on-surface-variant mt-4">
          Já tem conta? <Link to="/login" className="text-primary hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}