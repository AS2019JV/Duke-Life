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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-yellow-600 text-xl font-bold">Cargando...</div>
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
