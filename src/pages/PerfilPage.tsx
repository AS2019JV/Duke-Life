import { UserCircle, Award, CreditCard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PerfilPage() {
  const { user, signOut } = useAuth();

  const getMembershipDisplay = () => {
    if (user?.membership_type === 'black_elite') return 'BLACK ELITE';
    if (user?.membership_type === 'platinum') return 'PLATINUM';
    return 'GOLD';
  };

  const handleSignOut = async () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      await signOut();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/10 p-4">
        <h1 className="text-2xl font-bold text-white text-center tracking-tight">Mi Perfil</h1>
      </header>

      <main className="p-4 space-y-6">
        <div className="flex flex-col items-center space-y-3 py-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center border-2 border-yellow-400">
            <UserCircle className="w-16 h-16 text-black" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{user?.full_name || 'Miembro Duke'}</h2>
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600 text-sm tracking-widest">
            ✦ {getMembershipDisplay()} ✦
          </span>
          <p className="text-sm text-gray-400 font-light">{user?.email}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => alert('Detalles de beneficios próximamente')}
            className="w-full bg-[#1a1a1a] border border-white/10 text-white text-left p-4 rounded-xl flex justify-between items-center hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-yellow-600" />
              <span className="font-medium tracking-wide">Mis Beneficios</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          <button
            onClick={() => alert('Detalles de membresía próximamente')}
            className="w-full bg-[#1a1a1a] border border-white/10 text-white text-left p-4 rounded-xl flex justify-between items-center hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-yellow-600" />
              <span className="font-medium tracking-wide">Detalles de Membresía</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          <button
            onClick={() => alert('Configuración próximamente')}
            className="w-full bg-[#1a1a1a] border border-white/10 text-white text-left p-4 rounded-xl flex justify-between items-center hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-yellow-600" />
              <span className="font-medium tracking-wide">Configuración</span>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full bg-[#1a1a1a] border border-red-500/50 text-red-500 text-left p-4 rounded-xl flex justify-between items-center hover:bg-red-900/20 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="w-5 h-5" />
              <span className="font-medium tracking-wide">Cerrar Sesión</span>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
