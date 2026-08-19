import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { UserTable } from '../components/UserTable';

export function AdminPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface text-on-surface pt-24 pb-12 px-6 lg:px-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-[10px] text-primary/50 uppercase tracking-widest mb-1">
            <span>Painel</span>
            <span>›</span>
            <span>Administração</span>
          </nav>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
            <Users className="text-primary" size={28} />
            Gerenciar Usuários
          </h2>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-xs font-semibold hover:bg-surface-container-highest transition-colors border border-outline-variant/10"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <UserTable />
      </div>
    </div>
  );
}