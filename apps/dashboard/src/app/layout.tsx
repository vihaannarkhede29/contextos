import type { Metadata } from 'next';
import { Instrument_Serif, Inter, JetBrains_Mono, Press_Start_2P } from 'next/font/google';
import './globals.css';
import { CommandPalette } from '@/components/command-palette';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
});
const pressStart = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-retro',
});

export const metadata: Metadata = {
  title: 'ContextOS — Memory layer for AI coding agents',
  description:
    'Local-first codebase memory for Cursor, Claude Code, and AI agents. Semantic search, git decisions, architecture rules, and MCP — all on your machine.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrains.variable} ${instrumentSerif.variable} ${pressStart.variable} font-sans antialiased`}
      >
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
