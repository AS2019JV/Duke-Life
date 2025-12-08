import { UserCircle, Award, CreditCard, Settings, LogOut, Crown, Star, Calendar, TrendingUp, ChevronRight, Loader2, User, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import SettingsModal from '../components/SettingsModal';
import BenefitsModal from '../components/BenefitsModal';
import MembershipDetailsModal from '../components/MembershipDetailsModal';

export default function PerfilPage() {
  const { user, signOut, refreshProfile } = useAuth();
  const [reservationCount, setReservationCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  const [showMembership, setShowMembership] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      gradient: 'from-neutral-900 via-[#0a0a0a] to-black',
      text: 'text-white',
      border: 'border-amber-500/20',
      glow: 'shadow-[0_0_60px_-15px_rgba(251,191,36,0.15)] ring-1 ring-white/5',
      icon: 'text-amber-200'
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;

    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
         alert('Solo se permiten imágenes.');
         return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB.');
        return;
      }

      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update User Profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      await refreshProfile();
      // alert('Avatar actualizado correctamente!');

    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error al actualizar el avatar.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const colors = getMembershipColor();

  return (
    <div className="flex-1 overflow-y-auto pb-24">
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
            {/* Avatar */}
            <div className="relative group cursor-pointer">
              {/* Animated Gradient Border */}
              <div className={`absolute -inset-0.5 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt ${colors.gradient}`}></div>
              
              {/* Avatar Container */}
              <div 
                className={`relative w-32 h-32 rounded-full p-1 bg-neutral-900 border ${colors.border} shadow-2xl flex items-center justify-center overflow-hidden`}
                onClick={handleAvatarClick}
              >
                {/* Image or Default Icon */}
                <div className="w-full h-full rounded-full overflow-hidden bg-neutral-800 relative z-10">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${colors.gradient}`}>
                        <User className="w-16 h-16 text-white/80" fill="currentColor" strokeWidth={1} />
                    </div>
                  )}

                  {/* Edit Overlay (Visible on Hover) */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                    <Camera className="w-8 h-8 text-white drop-shadow-md" />
                    <span className="text-[10px] font-medium text-white tracking-widest uppercase">Editar</span>
                  </div>

                  {/* Loading Overlay */}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            {/* Name & Email */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-semibold text-white tracking-wide">
                {user?.full_name || 'Socio Duke'}
              </h1>
              <p className="text-sm text-white/50 font-medium tracking-wide">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Membership Card */}
          <div className={`relative aspect-[1.586/1] w-full max-w-sm mx-auto bg-gradient-to-br ${colors.gradient} rounded-3xl p-6 border ${colors.border} shadow-2xl ${colors.glow} overflow-hidden flex flex-col justify-between group transition-all duration-500 hover:scale-[1.02]`}>
            {/* Luxury Texture & shine */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
            <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-gradient-to-br from-transparent via-white/5 to-transparent rotate-12 group-hover:translate-x-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out" />
            
            {/* Header */}
            <div className="relative flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className={`w-4 h-4 ${colors.icon}`} fill="currentColor" />
                  <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${colors.text} opacity-80`}>
                    Membresía
                  </span>
                </div>
                {/* Premium Gold Text Effect for Black Elite */}
                {user?.membership_type === 'black_elite' ? (
                  <h2 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-sm font-display">
                    BLACK ELITE
                  </h2>
                ) : (
                  <h2 className={`text-2xl font-bold tracking-wider ${colors.text}`}>
                    {getMembershipDisplay()}
                  </h2>
                )}
              </div>
              <Crown className={`w-8 h-8 ${colors.icon} opacity-80 drop-shadow-lg`} />
            </div>

            {/* Chip & Contactless (Decorative) */}
            <div className="relative flex items-center gap-4 opacity-80">
               <div className="w-10 h-8 rounded bg-gradient-to-br from-yellow-200/20 to-yellow-600/20 border border-yellow-400/30 flex items-center justify-center overflow-hidden">
                  <div className="w-[120%] h-[1px] bg-yellow-400/30 rotate-45" />
                  <div className="absolute w-[120%] h-[1px] bg-yellow-400/30 -rotate-45" />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-400/10 to-transparent" />
               </div>
               <div className={`w-6 h-6 rounded-full border border-white/10 flex items-center justify-center`}>
                  <div className="w-4 h-4 rounded-full border border-white/20" />
               </div>
            </div>

            {/* Footer */}
            <div className="relative">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                   <p className={`text-[10px] font-medium tracking-widest ${colors.text} opacity-60 uppercase`}>
                    Miembro desde
                  </p>
                  <p className={`text-sm font-semibold tracking-wide ${colors.text}`}>
                    {new Date(user?.created_at || '').getFullYear()}
                  </p>
                </div>
                 <div className="text-right space-y-1">
                   <p className={`text-[10px] font-medium tracking-widest ${colors.text} opacity-60 uppercase`}>
                    ID Exclusivo
                  </p>
                  <p className={`text-sm font-mono tracking-widest ${colors.text}`}>
                    {(user?.id || '').slice(0, 4).toUpperCase()} {(user?.id || '').slice(4, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center space-y-2">
              <Calendar className="w-5 h-5 text-gold-400 mx-auto" />
              <p className="text-2xl font-light text-white">{reservationCount}</p>
              <p className="text-[10px] text-white/50 font-medium tracking-wider uppercase">
                Reservas
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center space-y-2">
              <TrendingUp className="w-5 h-5 text-gold-400 mx-auto" />
              <p className="text-2xl font-light text-white">{upcomingCount}</p>
              <p className="text-[10px] text-white/50 font-medium tracking-wider uppercase">
                Próximas
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center space-y-2">
              <Star className="w-5 h-5 text-gold-400 mx-auto" />
              <p className="text-2xl font-light text-white">VIP</p>
              <p className="text-[10px] text-white/50 font-medium tracking-wider uppercase">
                Estatus
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <main className="p-6 space-y-3">
        <h3 className="text-xs font-semibold text-gold-400/70 tracking-widest uppercase mb-4 px-2">
          Configuración
        </h3>

        {/* Menu Items */}
        <button
          onClick={() => setShowBenefits(true)}
          className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-white text-left p-5 rounded-2xl flex justify-between items-center hover:bg-white/10 hover:border-gold-400/30 transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center group-hover:bg-gold-400/20 transition-colors">
              <Award className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <span className="font-semibold tracking-wide text-white">Mis Beneficios</span>
              <p className="text-xs text-white/40 font-medium mt-0.5">
                Explora tus ventajas exclusivas
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-gold-400 transition-colors" />
        </button>

        <button
          onClick={() => setShowMembership(true)}
          className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-white text-left p-5 rounded-2xl flex justify-between items-center hover:bg-white/10 hover:border-gold-400/30 transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center group-hover:bg-gold-400/20 transition-colors">
              <CreditCard className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <span className="font-semibold tracking-wide text-white">Detalles de Membresía</span>
              <p className="text-xs text-white/40 font-medium mt-0.5">
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
              <span className="font-semibold tracking-wide text-white">Configuración</span>
              <p className="text-xs text-white/40 font-medium mt-0.5">
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
              <span className="font-semibold tracking-wide">Cerrar Sesión</span>
              <p className="text-xs text-red-400/60 font-bold mt-0.5">
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
      {showBenefits && (
        <BenefitsModal onClose={() => setShowBenefits(false)} />
      )}
      {showMembership && (
        <MembershipDetailsModal onClose={() => setShowMembership(false)} />
      )}
    </div>
  );
}
