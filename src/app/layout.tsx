import type { Metadata, Viewport } from 'next';
import { Press_Start_2P, Fredoka } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { Navbar } from '../components/Navbar';
import { PetCompanion } from '../components/PetCompanion';
import { ParticleTrail } from '../components/ParticleTrail';
import { PwaRegister } from '../components/PwaRegister';
import { CustomCursor } from '../components/CustomCursor';
import { AnalyticsTracker } from '../components/AnalyticsTracker';

// Fontes auto-hospedadas pelo next/font (zero requisições externas em produção).
// As variáveis CSS alimentam o design system em globals.css (@theme e .font-pixel).
const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-press-start-2p',
});

const fredoka = Fredoka({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fredoka',
});

export const metadata: Metadata = {
  title: 'Kids-Player | Reforço Escolar Gamificado para 3º e 4º ano',
  description: 'Plataforma lúdica de reforço escolar alinhada à BNCC com minijogos, PETs companheiros, ranking com coroa e Modo Foco.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.svg',
    apple: '/icon-192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Kids-Player',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${pressStart2P.variable} ${fredoka.variable} min-h-screen bg-[#141526] text-slate-100 antialiased selection:bg-pink-500 selection:text-white`}>
        <AuthProvider>
          <div className="relative flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pb-16 sm:pb-8">
              {children}
            </main>
            <PetCompanion />
            <ParticleTrail />
            <PwaRegister />
            <CustomCursor />
            <AnalyticsTracker />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
