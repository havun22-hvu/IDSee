import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>IDSee - Privacy-bewarende verificatie van dierlijke afkomst</p>
      </footer>
    </div>
  );
}
