import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Home, Layers, Tv, Video, PlusSquare, LogOut, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { AuthProvider } from './context/AuthContext';
import { ChannelsProvider, useChannelsData } from './context/ChannelsContext';
import { useAuth } from './hooks/useAuth';
import { RegisterVideoPage } from './pages/RegisterVideoPage';
import { HomePage } from './pages/HomePage';
import { ChannelsPage } from './pages/ChannelsPage';
import { ChannelPage } from './pages/ChannelPage';
import { VideoPage } from './pages/VideoPage';
import { PickerPage } from './pages/PickerPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPage } from './pages/AdminPage';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminRoute } from './components/AdminRoute';
import {
  CHANNELS_PATH,
  HOME_PATH,
  REGISTER_PATH,
  VIDEO_PICKER_PATH,
  channelPath,
  channelSegment,
  videoPath,
} from './lib/routes';

/** Extrai o canal e o vídeo do caminho, para memorizar onde o utilizador estava. */
function parseScope(pathname: string): { channelId: string | null; youtubeId: string | null } {
  const m = pathname.match(/^\/canal\/([^/]+)(?:\/video\/([^/]+))?\/?$/);
  if (!m) return { channelId: null, youtubeId: null };
  return {
    channelId: decodeURIComponent(m[1]),
    youtubeId: m[2] ? decodeURIComponent(m[2]) : null,
  };
}

interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  to: string;
  isActive: (pathname: string) => boolean;
}

/**
 * Casca da aplicação: barra lateral, barra de topo e o nível atual da
 * hierarquia canais → canal → vídeo. Cada nível é uma rota própria, por isso
 * voltar atrás no browser sobe um nível em vez de sair da aplicação.
 */
function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Último canal e vídeo visitados: sem isto, os itens Canal e Vídeo da barra
  // lateral não tinham para onde apontar depois de se navegar para longe.
  const [lastChannelId, setLastChannelId] = useState<string | null>(null);
  const [lastVideo, setLastVideo] = useState<{ channelId: string; youtubeId: string } | null>(null);

  useEffect(() => {
    const { channelId, youtubeId } = parseScope(location.pathname);
    if (!channelId) return;
    setLastChannelId(channelId);
    if (youtubeId) setLastVideo({ channelId, youtubeId });
  }, [location.pathname]);

  // Compatibilidade com os links da versão em que o canal era um filtro global.
  useEffect(() => {
    const legacy = new URLSearchParams(location.search).get('channel');
    if (legacy) navigate(channelPath(legacy), { replace: true });
  }, [location.search, navigate]);

  const isAdmin = user?.role === 'admin';

  const items: NavItem[] = [
    {
      key: 'inicio',
      label: 'Início',
      icon: Home,
      to: HOME_PATH,
      isActive: p => p === HOME_PATH,
    },
    {
      key: 'canais',
      label: 'Canais',
      icon: Layers,
      to: CHANNELS_PATH,
      isActive: p => p === CHANNELS_PATH,
    },
    {
      key: 'canal',
      label: 'Canal',
      icon: Tv,
      to: lastChannelId ? channelPath(lastChannelId) : CHANNELS_PATH,
      isActive: p => p.startsWith('/canal/') && !p.includes('/video/'),
    },
    {
      key: 'video',
      label: 'Vídeo',
      icon: Video,
      to: lastVideo ? videoPath(lastVideo.channelId, lastVideo.youtubeId) : VIDEO_PICKER_PATH,
      isActive: p => p === VIDEO_PICKER_PATH || p.includes('/video/'),
    },
    {
      key: 'registar',
      label: 'Registar Vídeo',
      icon: PlusSquare,
      to: REGISTER_PATH,
      isActive: p => p === REGISTER_PATH,
    },
  ];

  if (isAdmin) {
    items.push({
      key: 'admin',
      label: 'Administração',
      icon: Users,
      to: '/admin',
      isActive: p => p.startsWith('/admin'),
    });
  }

  const active = items.find(i => i.isActive(location.pathname)) ?? items[0];

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    // O provider de canais vive aqui, não na raiz: /analytics/channels exige
    // sessão, e a casca só é renderizada depois de PrivateRoute confirmar o
    // utilizador e o token já estar no cliente da API.
    <ChannelsProvider>
    <div className="min-h-screen bg-surface text-on-surface font-body">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-[#131b2e] flex-col py-8 px-4 gap-y-4 z-50 hidden md:flex">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-black text-[#bdc2ff]">Sentinela</h1>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#dae2fd]/50">Terminal de Inteligência</p>
        </div>
        <nav className="flex-1 space-y-1">
          {items.map(({ key, label, icon: Icon, to, isActive }) => {
            const selected = isActive(location.pathname);
            return (
              <button
                key={key}
                onClick={() => navigate(to)}
                aria-current={selected ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out ${
                  selected
                    ? 'bg-gradient-to-r from-[#bdc2ff]/10 to-transparent text-[#bdc2ff] border-r-2 border-[#bdc2ff]'
                    : 'text-[#dae2fd]/50 hover:text-[#dae2fd] hover:bg-[#222a3d]'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium uppercase tracking-wider">{label}</span>
              </button>
            );
          })}
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
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-sm font-semibold text-on-surface-variant hidden md:block">{active.label}</span>
            {/* Navegação mobile: rola na horizontal em vez de passar por baixo
                do bloco da conta, que não encolhe. */}
            <nav className="flex items-center gap-1 md:hidden min-w-0 overflow-x-auto overscroll-x-contain">
              {items.map(({ key, label, to, isActive }) => (
                <button
                  key={key}
                  onClick={() => navigate(to)}
                  className={`shrink-0 whitespace-nowrap px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    isActive(location.pathname)
                      ? 'text-primary bg-primary/10'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {label === 'Registar Vídeo' ? 'Registar' : label === 'Administração' ? 'Admin' : label}
                </button>
              ))}
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

        <div className="pt-24 pb-12 px-6 lg:px-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
    </ChannelsProvider>
  );
}

/** Depois de registar, desce para o canal do vídeo novo: é onde ele aparece. */
function RegisterRoute() {
  const navigate = useNavigate();
  const { refetchChannels } = useChannelsData();
  return (
    <RegisterVideoPage
      onRegistered={video => {
        refetchChannels();
        navigate(videoPath(channelSegment(video.channel_id), video.youtube_id));
      }}
    />
  );
}

/**
 * O router não repõe a posição da página ao mudar de rota: sem isto, abrir um
 * vídeo a partir do fundo de uma lista deixava a tela nova aberta a meio, no
 * deslocamento que a anterior tinha. Cada nível da hierarquia é uma tela nova,
 * por isso começa sempre no topo — incluindo ao voltar atrás, já que cada tela
 * recarrega os dados e a restauração nativa do browser cairia no sítio errado.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0 }); }, [pathname]);
  return null;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<PrivateRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path={CHANNELS_PATH} element={<ChannelsPage />} />
          <Route path="/canal/:channelId" element={<ChannelPage />} />
          <Route path="/canal/:channelId/video/:youtubeId" element={<VideoPage />} />
          <Route path={VIDEO_PICKER_PATH} element={<PickerPage />} />
          <Route path={REGISTER_PATH} element={<RegisterRoute />} />
          {/* Administração dentro da casca: navegar para lá não sai da aplicação */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to={HOME_PATH} replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
