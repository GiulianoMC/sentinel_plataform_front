import { useState, type FormEvent } from 'react';
import { PlusCircle, Youtube, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { registerVideo } from '../api/videos';
import type { Video } from '../api/types';

interface Props {
  onRegistered?: (video: Video) => void;
}

export function RegisterVideoPage({ onRegistered }: Props) {
  const [url, setUrl] = useState('');
  const [titulo, setTitulo] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const video = await registerVideo(url.trim(), titulo.trim() || undefined);
      setSuccess(video);
      setUrl('');
      setTitulo('');
      onRegistered?.(video);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-24 pb-12 px-6 lg:px-10 max-w-2xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <nav className="flex items-center gap-2 text-[10px] text-primary/50 uppercase tracking-widest mb-1">
          <span>Painel</span>
          <ChevronRight size={12} />
          <span>Registar Vídeo</span>
        </nav>
        <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">
          Registar Vídeo
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Adiciona um vídeo do YouTube para ser monitorizado pela plataforma.
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-card rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-primary/80">
              URL do Vídeo <span className="text-error">*</span>
            </label>
            <div className="relative">
              <Youtube
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40"
              />
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                disabled={loading}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl pl-11 pr-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 transition-all"
              />
            </div>
          </div>

          {/* Título opcional */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-primary/80">
              Título <span className="text-on-surface-variant/40 normal-case font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Review Poco X8 Pro — TechBR"
              disabled={loading}
              className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-tr from-primary to-primary-container text-on-primary-container text-sm font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                A registar...
              </>
            ) : (
              <>
                <PlusCircle size={16} />
                Registar Vídeo
              </>
            )}
          </button>
        </form>
      </div>

      {/* Success */}
      {success && (
        <div className="glass-card rounded-2xl p-6 border border-green-400/20">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-400 mb-1">Vídeo registado com sucesso!</p>
              <p className="text-xs text-on-surface-variant">
                ID: <span className="font-mono text-on-surface">{success.youtube_id}</span>
              </p>
              {success.titulo && (
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Título: <span className="text-on-surface">{success.titulo}</span>
                </p>
              )}
              <p className="text-xs text-on-surface-variant/60 mt-2">
                O coletor vai começar a recolher comentários no próximo ciclo (60 s).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card rounded-2xl p-6 border border-error/20">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-error mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-error mb-1">Erro ao registar</p>
              <p className="text-xs text-on-surface-variant">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
