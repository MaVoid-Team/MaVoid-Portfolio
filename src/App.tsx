import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { WhatsAppButton } from './components/WhatsAppButton';
import { LanguageProvider } from './i18n/context';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentPath, setCurrentPath] = useState(globalThis.location.pathname);
  const [searchParams, setSearchParams] = useState(new URLSearchParams(globalThis.location.search));

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(globalThis.location.pathname);
      setSearchParams(new URLSearchParams(globalThis.location.search));
    };

    // Listen for popstate (browser back/forward)
    globalThis.addEventListener('popstate', handleLocationChange);

    // Listen for custom navigation events
    globalThis.addEventListener('navigate', handleLocationChange);

    return () => {
      globalThis.removeEventListener('popstate', handleLocationChange);
      globalThis.removeEventListener('navigate', handleLocationChange);
    };
  }, []);

  // Simple routing logic
  const renderPage = () => {
    if (currentPath === '/admin') {
      return <Admin />;
    }
    return (
      <>
        <Home searchParams={searchParams} />
        <WhatsAppButton />
      </>
    );
  };

  return (
    <LanguageProvider>
      {renderPage()}
      <Toaster />
    </LanguageProvider>
  );
}