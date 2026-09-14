import type { ReactNode } from 'react';
import { BarChart3, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

const highlights = [
  { icon: MessageSquareText, title: 'Comentários em escala', text: 'Milhares de opiniões lidas e classificadas automaticamente.' },
  { icon: BarChart3, title: 'Sentimento e intenção', text: 'Painéis claros sobre o que a audiência sente e quer.' },
  { icon: Sparkles, title: 'Pergunte à IA', text: 'Respostas fundamentadas, com as fontes citadas.' },
];

/**
 * Moldura das páginas de autenticação: fundo com brilhos animados,
 * painel de marca (apenas em telas grandes) e área para o cartão do formulário.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface text-on-surface">
      {/* Fundo: grade sutil + brilhos flutuantes */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 auth-grid opacity-[0.35]" />
        <div className="absolute -top-40 -left-40 h-[34rem] w-[34rem] rounded-full bg-primary/20 blur-[120px] animate-float-slow" />
        <div className="absolute top-1/3 -right-48 h-[30rem] w-[30rem] rounded-full bg-tertiary-container/20 blur-[120px] animate-float-slower" />
        <div className="absolute -bottom-48 left-1/3 h-[26rem] w-[26rem] rounded-full bg-primary-container/15 blur-[110px] animate-float-slow [animation-delay:-6s]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface/80" />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8">
        {/* Painel de marca */}
        <aside className="hidden lg:block animate-rise">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary-container shadow-lg shadow-primary/20">
              <ShieldCheck size={22} className="text-on-primary-container" />
            </span>
            <div>
              <p className="text-xl font-black tracking-tight text-primary">Sentinela</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-on-surface/50">Terminal de Inteligência</p>
            </div>
          </div>

          <h1 className="mt-10 text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
            Entenda o que a sua{' '}
            <span className="bg-gradient-to-r from-primary via-primary-fixed to-tertiary bg-clip-text text-transparent">
              audiência
            </span>{' '}
            realmente pensa.
          </h1>
          <p className="mt-4 max-w-md text-base text-on-surface-variant/80">
            Análise de comentários do YouTube com IA: sentimento, intenções, produtos citados e respostas com fontes.
          </p>

          <ul className="mt-10 space-y-4">
            {highlights.map(({ icon: Icon, title, text }, i) => (
              <li
                key={title}
                className="flex items-start gap-4 animate-rise"
                style={{ animationDelay: `${150 + i * 90}ms` }}
              >
                <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{title}</p>
                  <p className="text-sm text-on-surface-variant/70">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Formulário */}
        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary-container shadow-lg shadow-primary/20">
              <ShieldCheck size={20} className="text-on-primary-container" />
            </span>
            <div>
              <p className="text-lg font-black tracking-tight text-primary">Sentinela</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-on-surface/50">Terminal de Inteligência</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
