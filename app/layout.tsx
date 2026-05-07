import './globals.css';

import type { Metadata } from 'next';

import { Header } from '@/components/Header';
import { PortfolioProvider } from '@/lib/portfolioContext';

export const metadata: Metadata = {
  title: "CardVault — TCG Portfolio Tracker",
  description: "Track your trading card collection and portfolio value",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PortfolioProvider>
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header />
            <main style={{
              flex: 1,
              width: "100%",
              maxWidth: 1200,
              margin: "0 auto",
              padding: "2rem 1rem",
              boxSizing: "border-box",
            }}>
              {children}
            </main>
            <footer style={{
              textAlign: "center",
              padding: "1.5rem 1rem",
              borderTop: "1px solid var(--border)",
              color: "var(--text-3)",
              fontSize: "0.72rem",
              fontFamily: "var(--font-mono)",
            }}>
            </footer>
          </div>
        </PortfolioProvider>
      </body>
    </html>
  );
}
