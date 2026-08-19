import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, CheckCircle, Lock, Mail } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await login(email, password);
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
        <h2 className="text-2xl font-bold text-center mb-6 text-on-surface">Entrar</h2>
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
              disabled={loading}
              className="w-full px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/20 focus:ring-1 focus:ring-primary text-on-surface"
            />
          </div>
          {error && <p className="text-error text-sm flex items-center gap-1"><AlertCircle size={14} />{error}</p>}
          {success && <p className="text-green-400 text-sm flex items-center gap-1"><CheckCircle size={14} />{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-tr from-primary to-primary-container text-on-primary-container font-bold disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-center text-sm text-on-surface-variant mt-4">
          Não tem conta? <Link to="/register" className="text-primary hover:underline">Registrar</Link>
        </p>
      </div>
    </div>
  );
}