import './globals.css';

import type { Metadata } from 'next';

import { Header } from '@/components/Header';
import { AppUpdateBanner } from '@/components/ui/AppUpdateBanner';
import { getSessionUser } from '@/lib/auth';
import { AuthProvider } from '@/lib/authContext';
import { PortfolioProvider } from '@/lib/portfolioContext';

export const metadata: Metadata = {
  title: "CardVault — TCG Portfolio Tracker",
  description: "Track your trading card collection and portfolio value",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialUser = await getSessionUser();

  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="CardVault" />
      </head>
      <body>
        <AuthProvider initialUser={initialUser}>
        <PortfolioProvider>
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header />
              <main className="app-main">
              {children}
            </main>
              <AppUpdateBanner />
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
        </AuthProvider>
      </body>
    </html>
  );
}
