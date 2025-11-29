import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import ReservasPage from './pages/ReservasPage';
import ConciergePage from './pages/ConciergePage';
import CursosPage from './pages/CursosPage';
import PerfilPage from './pages/PerfilPage';

function AppContent() {
  const { session, loading } = useAuth();
  const [activePage, setActivePage] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 
            className="text-5xl md:text-7xl font-extralight tracking-[0.15em] text-gold-400 mb-8"
            style={{
              textShadow: '0 0 40px rgba(251, 191, 36, 0.3)'
            }}
          >
            DUKE LIFE
          </h1>
          
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-gold-400/60 to-gold-400/40"></div>
            <p 
              className="text-gold-300 text-xs tracking-[0.5em] font-light uppercase animate-pulse"
              style={{
                textShadow: '0 0 20px rgba(251, 191, 36, 0.4)'
              }}
            >
              Cargando
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent via-gold-400/60 to-gold-400/40"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {activePage === 'home' && <HomePage onPageChange={setActivePage} />}
      {activePage === 'reservas' && <ReservasPage />}
      {activePage === 'concierge' && <ConciergePage />}
      {activePage === 'cursos' && <CursosPage />}
      {activePage === 'perfil' && <PerfilPage />}
      <Navigation activePage={activePage} onPageChange={setActivePage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
