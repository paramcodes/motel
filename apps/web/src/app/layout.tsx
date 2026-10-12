import type { Metadata } from 'next';
import * as React from 'react';
import { CategoryBar } from '../components/category-bar';
import { NavigationHeader } from '../components/header';
import { Providers } from '../components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Motel - Holiday Rentals, Cabins, Beachfront & More',
  description: 'Find the perfect place to stay at an amazing price.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <Providers>
          <React.Suspense fallback={null}>
            <NavigationHeader />
            <CategoryBar />
          </React.Suspense>
          <React.Suspense fallback={null}>{children}</React.Suspense>
        </Providers>
      </body>
    </html>
  );
}
