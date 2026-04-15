/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LayoutDashboard,
  LineChart,
  Link as LinkIcon,
  Brain,
  FileText,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Download,
  RefreshCw,
  MessageSquare,
  Activity,
  Smile,
  MoreVertical,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-[#131b2e] flex-col py-8 px-4 gap-y-4 z-50 hidden md:flex">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-black text-[#bdc2ff]">Sentinela</h1>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#dae2fd]/50">Intelligence Terminal</p>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#bdc2ff]/10 to-transparent text-[#bdc2ff] border-r-2 border-[#bdc2ff] transition-all duration-200 ease-in-out" href="#">
            <LayoutDashboard size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#dae2fd]/50 hover:text-[#dae2fd] hover:bg-[#222a3d] transition-all duration-200 ease-in-out" href="#">
            <LineChart size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Channel Analysis</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#dae2fd]/50 hover:text-[#dae2fd] hover:bg-[#222a3d] transition-all duration-200 ease-in-out" href="#">
            <LinkIcon size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Affiliate Links</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#dae2fd]/50 hover:text-[#dae2fd] hover:bg-[#222a3d] transition-all duration-200 ease-in-out" href="#">
            <Brain size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Sentiment</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#dae2fd]/50 hover:text-[#dae2fd] hover:bg-[#222a3d] transition-all duration-200 ease-in-out" href="#">
            <FileText size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Reports</span>
          </a>
        </nav>
        <div className="mt-auto pt-4 border-t border-outline-variant/10 space-y-1">
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#dae2fd]/50 hover:text-[#dae2fd] hover:bg-[#222a3d] transition-all duration-200 ease-in-out" href="#">
            <HelpCircle size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Support</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#dae2fd]/50 hover:text-[#dae2fd] hover:bg-[#222a3d] transition-all duration-200 ease-in-out" href="#">
            <LogOut size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-64 min-h-screen">
        {/* TopNavBar */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-[#0b1326]/60 backdrop-blur-xl flex justify-between items-center px-6 h-16">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Menu className="text-primary" size={24} />
            </div>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60" size={16} />
              <input 
                className="bg-[#222a3d] border-none rounded-full py-1.5 pl-10 pr-4 text-xs text-[#dae2fd] focus:ring-1 focus:ring-primary w-64 transition-all outline-none" 
                placeholder="Search insights..." 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-[#222a3d] transition-colors relative">
                <Bell className="text-primary" size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface"></span>
              </button>
              <button className="p-2 rounded-full hover:bg-[#222a3d] transition-colors">
                <Settings className="text-primary" size={20} />
              </button>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/20">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#dae2fd]">Analista Senior</p>
                <p className="text-[10px] text-primary/60">ID: #88291</p>
              </div>
              <img 
                alt="User profile" 
                className="w-9 h-9 rounded-full object-cover border border-primary/20" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO2qmo912bQf5kN48otGX0S1bluLL44jJhENdKYnJ2hWEj1vm-4UzxR1DvK-1eLPGG6kUoOcgESGVgwIypPkcTN0KtihjdnA8mq-KfVOboeCJfbCKIp2TsF4lQ45WBTqg4swnvMmxVe4lUAvXVAhVMQhP6UtAPibFI1C29GMs25suLtd5h-R9g_8su8N1rX5qdzNlJN28-tPec-Yd9wgeP28XRdixIIpHRzysDEJGlw2DNgMIiaSbs3xvGk3jrbKmSwXi0GbiJ-wE"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="pt-24 pb-12 px-6 lg:px-10 max-w-7xl mx-auto space-y-8">
          
          {/* Page Title Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-[10px] text-primary/50 uppercase tracking-widest mb-1">
                <span>Terminal</span>
                <ChevronRight size={12} />
                <span>Video Analysis</span>
              </nav>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#dae2fd]">
                Análise do Vídeo: <span className="text-primary font-mono">dQw4w9WgXcQ</span>
              </h2>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-xs font-semibold hover:bg-surface-container-highest transition-colors border border-outline-variant/10">
                <Download size={16} />
                Exportar Relatório
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-tr from-primary to-primary-container text-on-primary-container text-xs font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all">
                <RefreshCw size={16} />
                Recalcular BI
              </button>
            </div>
          </div>

          {/* Top Row: Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="text-primary" size={20} />
                </div>
                <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 tracking-wider">LIVE</span>
              </div>
              <p className="text-sm font-medium text-on-surface-variant mb-1">Total Comments</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-on-surface">159</span>
                <span className="text-xs text-primary/60 font-medium">+12% vs avg</span>
              </div>
              <div className="mt-4 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3"></div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full blur-3xl group-hover:bg-tertiary/10 transition-colors"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-tertiary/10">
                  <Activity className="text-tertiary" size={20} />
                </div>
                <span className="text-[10px] font-bold text-tertiary px-2 py-0.5 rounded bg-tertiary/10 tracking-wider">SYNCED</span>
              </div>
              <p className="text-sm font-medium text-on-surface-variant mb-1">Analyzed</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-on-surface">159</span>
                <span className="text-xs text-tertiary/60 font-medium">100% Coverage</span>
              </div>
              <div className="mt-4 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden shimmer opacity-20"></div>
            </div>

            {/* Card 3 */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-colors"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Smile className="text-green-400" size={20} />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-green-400 tracking-wider uppercase">Positive</span>
                </div>
              </div>
              <p className="text-sm font-medium text-on-surface-variant mb-1">Average Sentiment</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-green-400">4.2</span>
                <span className="text-xs text-green-400/60 font-medium">Excellent</span>
              </div>
              <div className="mt-4 flex gap-1">
                <div className="h-1 flex-1 bg-green-400 rounded-full"></div>
                <div className="h-1 flex-1 bg-green-400 rounded-full"></div>
                <div className="h-1 flex-1 bg-green-400 rounded-full"></div>
                <div className="h-1 flex-1 bg-green-400 rounded-full"></div>
                <div className="h-1 flex-1 bg-green-400/20 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Middle Row: Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Donut Chart Column */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Distribuição de Intenções</h3>
                  <p className="text-xs text-on-surface-variant">Intenção de Compra vs Dúvida</p>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-surface-container-highest text-primary/60 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
              
              <div className="relative flex-1 flex items-center justify-center py-4">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle cx="96" cy="96" fill="transparent" r="80" stroke="#2d3449" strokeWidth="20"></circle>
                  <circle cx="96" cy="96" fill="transparent" r="80" stroke="#bdc2ff" strokeDasharray="502" strokeDashoffset="150" strokeLinecap="round" strokeWidth="20"></circle>
                  <circle cx="96" cy="96" fill="transparent" r="80" stroke="#89ceff" strokeDasharray="502" strokeDashoffset="400" strokeLinecap="round" strokeWidth="20"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-on-surface">74%</span>
                  <span className="text-[10px] text-primary/60 font-bold uppercase tracking-tighter">Engagement</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-xs font-medium text-on-surface-variant">Intenção de Compra</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface">68%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                    <span className="text-xs font-medium text-on-surface-variant">Dúvida Técnica</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface">32%</span>
                </div>
              </div>
            </div>

            {/* Table Column */}
            <div className="lg:col-span-3 glass-card rounded-2xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                <h3 className="font-bold text-lg text-on-surface">Top Products Mentioned</h3>
                <div className="flex gap-2">
                  <div className="h-8 w-24 bg-surface-container-highest shimmer opacity-30 rounded-lg"></div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-highest/50">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-primary/60">Product Name</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-primary/60">Mentions</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-primary/60">Sentiment</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    <tr className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center">
                            <ShoppingBag className="text-primary" size={16} />
                          </div>
                          <span className="text-sm font-semibold text-[#dae2fd]">MacBook Pro M3</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-on-surface-variant">42</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                            <div className="h-full bg-green-400 w-[90%]"></div>
                          </div>
                          <span className="text-xs font-bold text-green-400">4.8</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:text-primary-container transition-colors">
                          <ArrowRight size={20} />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center">
                            <ShoppingBag className="text-primary" size={16} />
                          </div>
                          <span className="text-sm font-semibold text-[#dae2fd]">Dell XPS 15</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-on-surface-variant">28</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[75%]"></div>
                          </div>
                          <span className="text-xs font-bold text-primary">3.9</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:text-primary-container transition-colors">
                          <ArrowRight size={20} />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center">
                            <ShoppingBag className="text-primary" size={16} />
                          </div>
                          <span className="text-sm font-semibold text-[#dae2fd]">Asus ROG Zephyrus</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-on-surface-variant">15</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                            <div className="h-full bg-error w-[40%]"></div>
                          </div>
                          <span className="text-xs font-bold text-error">2.1</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:text-primary-container transition-colors">
                          <ArrowRight size={20} />
                        </button>
                      </td>
                    </tr>
                    {/* Skeleton Loading Row */}
                    <tr className="opacity-40 shimmer">
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-surface-container-highest rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-8 bg-surface-container-highest rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-1.5 w-32 bg-surface-container-highest rounded-full"></div></td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bottom Content (Engagement Timeline) */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-on-surface">Engagement Timeline</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(189,194,255,0.5)]"></span>
                  <span className="text-[10px] font-bold text-primary uppercase">Peak Intent</span>
                </div>
              </div>
            </div>
            <div className="h-32 flex items-end gap-1 px-2">
              {/* Dynamic bar mockup */}
              <div className="flex-1 bg-surface-container-highest rounded-t hover:bg-primary transition-all cursor-pointer h-[40%]"></div>
              <div className="flex-1 bg-surface-container-highest rounded-t hover:bg-primary transition-all cursor-pointer h-[55%]"></div>
              <div className="flex-1 bg-surface-container-highest rounded-t hover:bg-primary transition-all cursor-pointer h-[35%]"></div>
              <div className="flex-1 bg-surface-container-highest rounded-t hover:bg-primary transition-all cursor-pointer h-[70%]"></div>
              <div className="flex-1 bg-primary rounded-t shadow-[0_0_20px_rgba(189,194,255,0.2)] h-[95%]"></div>
              <div className="flex-1 bg-surface-container-highest rounded-t hover:bg-primary transition-all cursor-pointer h-[60%]"></div>
              <div className="flex-1 bg-surface-container-highest rounded-t hover:bg-primary transition-all cursor-pointer h-[45%]"></div>
              <div className="flex-1 bg-surface-container-highest rounded-t hover:bg-primary transition-all cursor-pointer h-[30%]"></div>
              <div className="flex-1 bg-surface-container-highest rounded-t hover:bg-primary transition-all cursor-pointer h-[80%]"></div>
              <div className="flex-1 bg-surface-container-highest rounded-t hover:bg-primary transition-all cursor-pointer h-[50%]"></div>
              <div className="flex-1 bg-surface-container-highest rounded-t hover:bg-primary transition-all cursor-pointer h-[40%]"></div>
              <div className="flex-1 bg-surface-container-highest rounded-t hover:bg-primary transition-all cursor-pointer h-[65%]"></div>
              <div className="flex-1 bg-primary rounded-t shadow-[0_0_20px_rgba(189,194,255,0.2)] h-[85%]"></div>
              <div className="flex-1 bg-surface-container-highest rounded-t hover:bg-primary transition-all cursor-pointer h-[40%]"></div>
            </div>
            <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
              <span>0:00</span>
              <span>10:00</span>
              <span>20:00</span>
              <span>30:00</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
