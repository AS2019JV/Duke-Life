import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Reservation } from '../lib/supabase';
import ReservationDetailModal from '../components/ReservationDetailModal';
import { Calendar, MapPin, Clock, CheckCircle2, AlertCircle, XCircle, User } from 'lucide-react';

let subscriptionUnsubscribe: (() => void) | null = null;

export default function ReservasPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    if (user) {
      fetchReservations();
      setupRealtimeListener();
    }

    return () => {
      if (subscriptionUnsubscribe) {
        subscriptionUnsubscribe();
      }
    };
  }, [user]);

  const fetchReservations = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('reservations')
      .select('*, experiences(*, destinations(*), categories(*))')
      .eq('user_id', user.id)
      .order('reservation_date', { ascending: true });

    if (data) {
      setReservations(data);
    }
    setLoading(false);
  };

  const setupRealtimeListener = () => {
    if (!user) return;

    const channel = supabase
      .channel(`reservations:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchReservations();
        }
      )
      .subscribe();

    subscriptionUnsubscribe = () => {
      supabase.removeChannel(channel);
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
    const dayNum = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'short' });
    const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    // Remove dots from abbreviations if present and capitalize
    const cleanDay = capitalize(dayName.replace('.', ''));
    const cleanMonth = capitalize(month.replace('.', ''));
    
    return `${cleanDay} ${dayNum} ${cleanMonth} · ${time}`;
  };

  const getStatusInfo = (reservation: Reservation) => {
    // Mock status logic if field doesn't exist, or use reservation.status
    const status = (reservation as any).status || 'confirmed';
    
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmado', color: 'text-emerald-300', bg: 'bg-emerald-900/60', border: 'border-emerald-500/40', icon: CheckCircle2 };
      case 'pending':
        return { label: 'Pago pendiente', color: 'text-amber-300', bg: 'bg-amber-900/60', border: 'border-amber-500/40', icon: Clock };
      case 'cancelled':
        return { label: 'Cancelado', color: 'text-red-300', bg: 'bg-red-900/60', border: 'border-red-500/40', icon: XCircle };
      default:
        return { label: 'Confirmado', color: 'text-emerald-300', bg: 'bg-emerald-900/60', border: 'border-emerald-500/40', icon: CheckCircle2 };
    }
  };

  const now = new Date();
  const upcomingReservations = reservations.filter((r) => new Date(r.reservation_date) >= now);
  const pastReservations = reservations.filter((r) => new Date(r.reservation_date) < now);
  
  const displayedReservations = activeTab === 'upcoming' ? upcomingReservations : pastReservations;

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-5 transition-all duration-300">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 text-center tracking-[0.15em] uppercase">Mis Reservas</h1>
      </header>

      <main className="p-6 space-y-8">
        {/* Segmented Control Tabs */}
        <div className="flex bg-white/5 backdrop-blur-sm p-1.5 rounded-full border border-white/10 relative max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 relative z-10 ${
              activeTab === 'upcoming' ? 'text-black' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {activeTab === 'upcoming' && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#f3d27a] to-[#b98a35] rounded-full -z-10 shadow-lg shadow-gold-900/20 animate-in fade-in zoom-in-95 duration-200" />
            )}
            PRÓXIMAS · {upcomingReservations.length}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 relative z-10 ${
              activeTab === 'past' ? 'text-black' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {activeTab === 'past' && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#f3d27a] to-[#b98a35] rounded-full -z-10 shadow-lg shadow-gold-900/20 animate-in fade-in zoom-in-95 duration-200" />
            )}
            PASADAS · {pastReservations.length}
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
            <p className="text-white/40 font-light tracking-wide text-sm">Cargando reservas...</p>
          </div>
        ) : displayedReservations.length === 0 ? (
          <div className="text-center text-white/40 py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white/20" />
            </div>
            <p className="font-light tracking-wide text-lg">
              {activeTab === 'upcoming'
                ? 'No tienes reservas próximas'
                : 'No tienes reservas pasadas'}
            </p>
            <p className="text-xs tracking-widest uppercase text-white/30">Explora nuestras experiencias exclusivas</p>
          </div>
        ) : (
          <div className="space-y-8">
            {displayedReservations.map((reservation) => {
              const status = getStatusInfo(reservation);
              
              return (
                <div
                  key={reservation.id}
                  className="group relative bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden hover:border-gold-400/30 transition-all duration-500 hover:shadow-2xl hover:shadow-gold-900/10"
                >
                  {/* Image Container */}
                  <div className="relative h-[280px] w-full overflow-hidden rounded-[28px] m-1.5 mb-0">
                    <img
                      src={reservation.experiences?.image_url}
                      alt={reservation.experiences?.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />
                    
                    {/* Tag */}
                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                      <span className="text-[9px] text-white/90 font-medium tracking-widest uppercase">
                        {reservation.experiences?.categories?.name || 'EXPERIENCIA'}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full border backdrop-blur-md flex items-center gap-1.5 ${status.bg} ${status.border}`}>
                      <status.icon size={10} className={status.color} />
                      <span className={`text-[9px] font-bold tracking-wider uppercase ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 pt-4 space-y-5 relative">
                    <div className="space-y-3">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-blue-400 text-xs font-medium tracking-wider uppercase">
                        <Calendar size={14} />
                        {formatDate(reservation.reservation_date)}
                      </div>
                      
                      {/* Title & Location */}
                      <div>
                        <h3 className="text-[1.3rem] font-light text-white tracking-wide leading-snug mb-2">
                          {reservation.experiences?.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-white/40">
                          <MapPin size={14} />
                          <span className="text-xs font-light tracking-wide">
                            {reservation.experiences?.destinations?.name || 'Destino Exclusivo'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setSelectedReservation(reservation)}
                        className="flex-1 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-black font-bold py-3 rounded-full text-[10px] transition-all duration-500 tracking-widest uppercase hover:scale-105 active:scale-95 shadow-lg shadow-gold-900/20"
                      >
                        Ver Detalles
                      </button>
                      <button 
                        className="w-14 h-14 rounded-full bg-black border border-white/20 flex items-center justify-center text-white hover:text-white hover:border-white/40 transition-all duration-300 group shadow-lg shadow-white/30 hover:shadow-white/50 hover:shadow-xl"
                        onClick={() => alert('Contactando Concierge...')}
                      >
                        <User size={24} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
}
