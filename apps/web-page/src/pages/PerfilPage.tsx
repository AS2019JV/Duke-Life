import { UserCircle, Award, CreditCard, Settings, LogOut, Crown, Star, Calendar, TrendingUp, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import SettingsModal from '../components/SettingsModal';

export default function PerfilPage() {
  const { user, signOut } = useAuth();
  const [reservationCount, setReservationCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    const { data: reservations } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', user.id);

    if (reservations) {
      setReservationCount(reservations.length);
      const upcoming = reservations.filter(
        (r) => new Date(r.reservation_date) >= new Date()
      );
      setUpcomingCount(upcoming.length);
    }
  };

  const getMembershipDisplay = () => {
    if (user?.membership_type === 'black_elite') return 'BLACK ELITE';
    if (user?.membership_type === 'platinum') return 'PLATINUM';
    return 'GOLD';
  };

  const getMembershipColor = () => {
    if (user?.membership_type === 'black_elite') return {
      gradient: 'from-gray-900 via-gray-800 to-black',
      text: 'text-gold-400',
      border: 'border-gold-400/30',
      glow: 'shadow-gold-400/20',
      icon: 'text-gold-400'
    };
    if (user?.membership_type === 'platinum') return {
      gradient: 'from-slate-700 via-slate-600 to-slate-800',
      text: 'text-slate-200',
      border: 'border-slate-400/30',
      glow: 'shadow-slate-400/20',
      icon: 'text-slate-300'
    };
    return {
      gradient: 'from-yellow-600 via-yellow-500 to-yellow-700',
      text: 'text-yellow-100',
      border: 'border-yellow-400/30',
      glow: 'shadow-yellow-400/20',
      icon: 'text-yellow-200'
    };
  };

  const handleSignOut = async () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      await signOut();
    }
  };

  const colors = getMembershipColor();

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-black">
      {/* Hero Section with Membership Card */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gold-400/5 via-transparent to-transparent" />
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-400/5 rounded-full blur-3xl" />

        <div className="relative p-6 pt-8 space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center space-y-4">
            {/* Avatar */}
            <div className={`relative w-28 h-28 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center border-2 ${colors.border} shadow-2xl ${colors.glow} animate-in zoom-in-95 duration-500`}>
              <UserCircle className={`w-20 h-20 ${colors.icon}`} />
              {user?.membership_type === 'black_elite' && (
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                  <Crown className="w-4 h-4 text-black" />
                </div>
              )}
            </div>

            {/* Name & Email */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extralight text-white tracking-wide">
                {user?.full_name || 'Miembro Duke'}
              </h1>
              <p className="text-sm text-white/50 font-light tracking-wide">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Membership Card */}
          <div className={`relative bg-gradient-to-br ${colors.gradient} rounded-3xl p-6 border ${colors.border} shadow-2xl ${colors.glow} overflow-hidden`}>
            {/* Card Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl" />
            </div>

            <div className="relative space-y-4">
              {/* Membership Type */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-5 h-5 ${colors.icon}`} />
                  <span className={`text-xs font-light tracking-widest uppercase ${colors.text}`}>
                    Membresía
                  </span>
                </div>
                <Crown className={`w-5 h-5 ${colors.icon}`} />
              </div>

              {/* Membership Name */}
              <div>
                <h2 className={`text-2xl font-bold tracking-wider ${colors.text}`}>
                  {getMembershipDisplay()}
                </h2>
                <p className={`text-xs font-light mt-1 ${colors.text} opacity-80`}>
                  Miembro desde {new Date(user?.created_at || '').getFullYear()}
                </p>
              </div>

              {/* Member ID */}
              <div className="pt-4 border-t border-white/10">
                <p className={`text-xs font-light tracking-wider ${colors.text} opacity-60`}>
                  ID: {user?.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center space-y-2">
              <Calendar className="w-5 h-5 text-gold-400 mx-auto" />
              <p className="text-2xl font-light text-white">{reservationCount}</p>
              <p className="text-[10px] text-white/50 font-light tracking-wider uppercase">
                Reservas
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center space-y-2">
              <TrendingUp className="w-5 h-5 text-gold-400 mx-auto" />
              <p className="text-2xl font-light text-white">{upcomingCount}</p>
              <p className="text-[10px] text-white/50 font-light tracking-wider uppercase">
                Próximas
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center space-y-2">
              <Star className="w-5 h-5 text-gold-400 mx-auto" />
              <p className="text-2xl font-light text-white">VIP</p>
              <p className="text-[10px] text-white/50 font-light tracking-wider uppercase">
                Estatus
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <main className="p-6 space-y-3">
        <h3 className="text-xs font-medium text-gold-400/70 tracking-widest uppercase mb-4 px-2">
          Configuración
        </h3>

        {/* Menu Items */}
        <button
          onClick={() => alert('Detalles de beneficios próximamente')}
          className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-white text-left p-5 rounded-2xl flex justify-between items-center hover:bg-white/10 hover:border-gold-400/30 transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center group-hover:bg-gold-400/20 transition-colors">
              <Award className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <span className="font-light tracking-wide text-white">Mis Beneficios</span>
              <p className="text-xs text-white/40 font-light mt-0.5">
                Explora tus ventajas exclusivas
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-gold-400 transition-colors" />
        </button>

        <button
          onClick={() => alert('Detalles de membresía próximamente')}
          className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-white text-left p-5 rounded-2xl flex justify-between items-center hover:bg-white/10 hover:border-gold-400/30 transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center group-hover:bg-gold-400/20 transition-colors">
              <CreditCard className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <span className="font-light tracking-wide text-white">Detalles de Membresía</span>
              <p className="text-xs text-white/40 font-light mt-0.5">
                Gestiona tu suscripción
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-gold-400 transition-colors" />
        </button>

        <button
          onClick={() => setShowSettings(true)}
          className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-white text-left p-5 rounded-2xl flex justify-between items-center hover:bg-white/10 hover:border-gold-400/30 transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center group-hover:bg-gold-400/20 transition-colors">
              <Settings className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <span className="font-light tracking-wide text-white">Configuración</span>
              <p className="text-xs text-white/40 font-light mt-0.5">
                Preferencias y privacidad
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-gold-400 transition-colors" />
        </button>

        {/* Divider */}
        <div className="h-px bg-white/5 my-6" />

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full bg-red-500/5 backdrop-blur-sm border border-red-500/20 text-red-400 text-left p-5 rounded-2xl flex justify-between items-center hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <span className="font-light tracking-wide">Cerrar Sesión</span>
              <p className="text-xs text-red-400/60 font-light mt-0.5">
                Hasta pronto
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-red-400/40 group-hover:text-red-400 transition-colors" />
        </button>
      </main>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
