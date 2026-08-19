import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  PlusSquare,
  ChevronRight,
  RefreshCw,
  Cpu,
  Trash2,
  LogOut,
  Users,
} from 'lucide-react';

import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useVideos } from './hooks/useVideos';
import { useAnalytics } from './hooks/useAnalytics';
import { reprocessAI } from './api/analytics';
import { deleteVideo } from './api/videos';
import { VideoSelector } from './components/VideoSelector';
import { SummaryCards } from './components/SummaryCards';
import { IntentionsDonut } from './components/IntentionsDonut';
import { ProductsTable } from './components/ProductsTable';
import { SentimentBars } from './components/SentimentBars';
import { RegisterVideoPage } from './pages/RegisterVideoPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPage } from './pages/AdminPage';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminRoute } from './components/AdminRoute';
import type { Video } from './api/types';

type Page = 'home' | 'dashboard' | 'register';

function AppLayout() {
  const [page, setPage] = useState<Page>('home');
  const { videos, loading: videosLoading, error: videosError, refetchVideos } = useVideos();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!selectedId && videos.length > 0) {
      setSelectedId(videos[0].youtube_id);
    }
  }, [videos, selectedId]);

  const { summary, intentions, products, sentiment, loading, error, refetch, isProcessing } = useAnalytics(selectedId);

  const [reprocessing, setReprocessing] = useState(false);
  const [reprocessMsg, setReprocessMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    setConfirmDelete(false);
    try {
      await deleteVideo(selectedId);
      const remaining = videos.filter(v => v.youtube_id !== selectedId);
      setSelectedId(remaining.length > 0 ? remaining[0].youtube_id : null);
      refetchVideos();
    } catch (e) {
      setReprocessMsg({ type: 'err', text: (e as Error).message });
    } finally {
      setDeleting(false);
    }
  }

  async function handleReprocess() {
    if (!selectedId) return;
    setReprocessing(true);
    setReprocessMsg(null);
    try {
      const result = await reprocessAI(selectedId);
      const n = (result as { enqueued?: number }).enqueued ?? 0;
      setReprocessMsg({ type: 'ok', text: `${n} comentário(s) enviados para reprocessamento.` });
    } catch (e) {
      setReprocessMsg({ type: 'err', text: (e as Error).message });
    } finally {
      setReprocessing(false);
    }
  }

  function handleVideoRegistered(video: Video) {
    refetchVideos();
    setSelectedId(video.youtube_id);
    setPage('home');
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-[#131b2e] flex-col py-8 px-4 gap-y-4 z-50 hidden md:flex">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-black text-[#bdc2ff]">Sentinela</h1>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#dae2fd]/50">Terminal de Inteligência</p>
        </div>
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => { setPage('home'); navigate('/'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out ${
              page === 'home' && location.pathname === '/'
                ? 'bg-gradient-to-r from-[#bdc2ff]/10 to-transparent text-[#bdc2ff] border-r-2 border-[#bdc2ff]'
                : 'text-[#dae2fd]/50 hover:text-[#dae2fd] hover:bg-[#222a3d]'
            }`}
          >
            <Home size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Início</span>
          </button>
          <button
            onClick={() => { setPage('dashboard'); navigate('/'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out ${
              page === 'dashboard' && location.pathname === '/'
                ? 'bg-gradient-to-r from-[#bdc2ff]/10 to-transparent text-[#bdc2ff] border-r-2 border-[#bdc2ff]'
                : 'text-[#dae2fd]/50 hover:text-[#dae2fd] hover:bg-[#222a3d]'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Painel</span>
          </button>
          <button
            onClick={() => { setPage('register'); navigate('/'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out ${
              page === 'register' && location.pathname === '/'
                ? 'bg-gradient-to-r from-[#bdc2ff]/10 to-transparent text-[#bdc2ff] border-r-2 border-[#bdc2ff]'
                : 'text-[#dae2fd]/50 hover:text-[#dae2fd] hover:bg-[#222a3d]'
            }`}
          >
            <PlusSquare size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Registar Vídeo</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out ${
                location.pathname === '/admin'
                  ? 'bg-gradient-to-r from-[#bdc2ff]/10 to-transparent text-[#bdc2ff] border-r-2 border-[#bdc2ff]'
                  : 'text-[#dae2fd]/50 hover:text-[#dae2fd] hover:bg-[#222a3d]'
              }`}
            >
              <Users size={20} />
              <span className="text-sm font-medium uppercase tracking-wider">Administração</span>
            </button>
          )}
          
        </nav>
        <div className="pt-4 border-t border-outline-variant/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#dae2fd]/50 hover:text-error hover:bg-[#222a3d] transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-64 min-h-screen">
        {/* TopNavBar */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-[#0b1326]/60 backdrop-blur-xl flex justify-between items-center px-6 h-16 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {page === 'dashboard' ? (
              <VideoSelector
                videos={videos}
                selectedId={selectedId}
                onChange={setSelectedId}
                loading={videosLoading}
              />
            ) : page === 'home' ? (
              <span className="text-sm font-semibold text-on-surface-variant">Visão Geral</span>
            ) : (
              <span className="text-sm font-semibold text-on-surface-variant">Registar Vídeo</span>
            )}
            {/* Navegação mobile */}
            <nav className="flex items-center gap-1 md:hidden ml-2">
              <button
                onClick={() => { setPage('home'); navigate('/'); }}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  page === 'home' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Início
              </button>
              <button
                onClick={() => { setPage('dashboard'); navigate('/'); }}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  page === 'dashboard' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Painel
              </button>
              <button
                onClick={() => { setPage('register'); navigate('/'); }}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  page === 'register' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Registar
              </button>
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    location.pathname === '/admin' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Admin
                </button>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/20 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#dae2fd]">{user?.email ?? 'Sentinela'}</p>
              <p className="text-[10px] text-primary/60">{user?.role === 'admin' ? 'admin' : 'v1.0'}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary/30 transition-colors"
            >
              <LogOut size={14} className="text-primary" />
            </button>
          </div>
        </header>

        {page === 'register' ? (
          <RegisterVideoPage onRegistered={handleVideoRegistered} />
        ) : page === 'dashboard' ? (
          <div className="pt-24 pb-12 px-6 lg:px-10 max-w-7xl mx-auto space-y-8">

            {/* Page Title */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <nav className="flex items-center gap-2 text-[10px] text-primary/50 uppercase tracking-widest mb-1">
                  <span>Painel</span>
                  <ChevronRight size={12} />
                  <span>Análise de Vídeo</span>
                </nav>
                <h2 className="text-3xl font-extrabold tracking-tight text-[#dae2fd] flex items-center gap-3 flex-wrap">
                  Análise:{' '}
                  <span className="text-primary font-mono">
                    {selectedId ?? '—'}
                  </span>
                  {isProcessing && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-tertiary px-2 py-0.5 rounded bg-tertiary/10 tracking-wider self-end mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" />
                      AO VIVO
                    </span>
                  )}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Reprocessar IA */}
                <button
                  onClick={handleReprocess}
                  disabled={reprocessing || !selectedId}
                  title="Reprocessar comentários com Erro_IA"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-xs font-semibold hover:bg-surface-container-highest transition-colors border border-outline-variant/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Cpu size={16} className={reprocessing ? 'animate-pulse text-primary' : ''} />
                  {reprocessing ? 'A reprocessar...' : 'Reprocessar IA'}
                </button>

                {/* Apagar vídeo — dois cliques para confirmar */}
                <button
                  onClick={handleDelete}
                  onBlur={() => setConfirmDelete(false)}
                  disabled={deleting || !selectedId}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    confirmDelete
                      ? 'bg-error/20 border-error/40 text-error animate-pulse'
                      : 'bg-surface-container-high border-outline-variant/10 text-on-surface-variant hover:border-error/30 hover:text-error'
                  }`}
                >
                  <Trash2 size={16} />
                  {deleting ? 'A apagar...' : confirmDelete ? 'Confirmar?' : 'Apagar'}
                </button>

                {/* Atualizar dados */}
                <button
                  onClick={refetch}
                  disabled={loading || !selectedId}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-tr from-primary to-primary-container text-on-primary-container text-xs font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  Atualizar
                </button>
              </div>
            </div>

            {/* Erros de carregamento */}
            {(error || videosError) && (
              <div className="glass-card rounded-xl p-4 border border-error/20 text-error text-sm">
                {error ?? videosError}
              </div>
            )}

            {/* Feedback do reprocessamento */}
            {reprocessMsg && (
              <div
                className={`glass-card rounded-xl p-4 border text-sm flex items-center justify-between gap-4 ${
                  reprocessMsg.type === 'ok'
                    ? 'border-green-400/20 text-green-400'
                    : 'border-error/20 text-error'
                }`}
              >
                <span>{reprocessMsg.text}</span>
                <button
                  onClick={() => setReprocessMsg(null)}
                  className="text-xs opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Sem vídeos */}
            {!videosLoading && videos.length === 0 && !videosError && (
              <div className="glass-card rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
                <p className="text-on-surface-variant text-sm">Nenhum vídeo registado ainda.</p>
                <button
                  onClick={() => setPage('register')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                >
                  <PlusSquare size={16} />
                  Registar primeiro vídeo
                </button>
              </div>
            )}

            {/* Conteúdo quando há vídeo selecionado */}
            {selectedId && (
              <>
                <SummaryCards data={summary} loading={loading} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-4">
                    <IntentionsDonut data={intentions} loading={loading} />
                  </div>
                  {/* Célula relativa: estica para igualar a altura do Donut via items-stretch */}
                  <div className="lg:col-span-5 relative min-h-[300px]">
                    <div className="absolute inset-0">
                      <ProductsTable data={products} loading={loading} />
                    </div>
                  </div>
                  <div className="lg:col-span-3">
                    <SentimentBars data={sentiment} loading={loading} />
                  </div>
                </div>
              </>
            )}

          </div>
        ) : (
          <div className="pt-24 pb-12 px-6 lg:px-10 max-w-7xl mx-auto">
            <HomePage
              videos={videos}
              onSelectVideo={id => {
                setSelectedId(id);
                setPage('dashboard');
              }}
              onRegister={() => setPage('register')}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<PrivateRoute />}>
        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<AdminPage />} />
        </Route>
        <Route path="/*" element={<AppLayout />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}