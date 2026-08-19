import { useCallback, useEffect, useState } from 'react';
import { get, patch } from '../api/client';
import type { AdminUsersResponse, User } from '../types/auth';
import { AlertCircle, Loader2, Shield, ShieldOff } from 'lucide-react';

export function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get<AdminUsersResponse>('/admin/users?size=100');
      setUsers(data.users);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function toggleRole(user: User) {
    setUpdating(user.id);
    setError(null);
    try {
      const updated = await patch<User>(`/admin/users/${user.id}/role`, {
        role: user.role === 'admin' ? 'user' : 'admin',
      });
      setUsers(prev => prev.map(u => (u.id === user.id ? updated : u)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdating(null);
    }
  }

  async function toggleActive(user: User) {
    setUpdating(user.id);
    setError(null);
    try {
      const updated = await patch<User>(`/admin/users/${user.id}/status`, {
        is_active: !user.is_active,
      });
      setUsers(prev => prev.map(u => (u.id === user.id ? updated : u)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 glass-card rounded-xl p-4 border border-error/20 text-error text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-high">
            <tr className="text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              <th className="p-4">ID</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Criado em</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-outline-variant/10 hover:bg-surface-container-high/50">
                <td className="p-4 font-mono text-on-surface-variant">{u.id}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">
                  <button
                    onClick={() => toggleRole(u)}
                    disabled={updating === u.id}
                    className={`px-2 py-1 rounded text-xs font-medium disabled:opacity-50 ${
                      u.role === 'admin'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {updating === u.id ? <Loader2 className="w-4 h-4 animate-spin inline" /> : u.role}
                  </button>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleActive(u)}
                    disabled={updating === u.id}
                    className={`px-2 py-1 rounded text-xs font-medium disabled:opacity-50 ${
                      u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-error/20 text-error'
                    }`}
                  >
                    {u.is_active ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="p-4 text-on-surface-variant">
                  {new Date(u.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => toggleRole(u)}
                    disabled={updating === u.id}
                    title={u.role === 'admin' ? 'Rebaixar para usuário' : 'Promover a admin'}
                    className="p-1.5 hover:bg-surface-container-high rounded transition-colors disabled:opacity-50 text-on-surface-variant hover:text-primary"
                  >
                    {u.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}