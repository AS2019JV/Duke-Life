import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Reservation } from '../lib/supabase';
import ReservationDetailModal from '../components/ReservationDetailModal';

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
      .select('*, experiences(*, destinations(*))')
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
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const filterReservations = (reservations: Reservation[]) => {
    const now = new Date();
    if (activeTab === 'upcoming') {
      return reservations.filter((r) => new Date(r.reservation_date) >= now);
    }
    return reservations.filter((r) => new Date(r.reservation_date) < now);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/5 px-6 py-5 transition-all duration-300">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 text-center tracking-[0.15em] uppercase">Mis Reservas</h1>
      </header>

      <main className="p-6 space-y-6">
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 font-light py-3 border-b-2 transition-all duration-300 tracking-widest uppercase text-[10px] ${
              activeTab === 'upcoming'
                ? 'text-gold-400 border-b-gold-400'
                : 'text-white/40 border-b-transparent hover:text-gold-400/60'
            }`}
          >
            Próximas
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 font-light py-3 border-b-2 transition-all duration-300 tracking-widest uppercase text-[10px] ${
              activeTab === 'past'
                ? 'text-gold-400 border-b-gold-400'
                : 'text-white/40 border-b-transparent hover:text-gold-400/60'
            }`}
          >
            Pasadas
          </button>
        </div>

        {loading ? (
          <div className="text-center text-white/40 py-12 font-light tracking-wide">Cargando reservas...</div>
        ) : filterReservations(reservations).length === 0 ? (
          <div className="text-center text-white/40 py-12 space-y-2">
            <p className="font-light tracking-wide">
              {activeTab === 'upcoming'
                ? 'No tienes reservas próximas'
                : 'No tienes reservas pasadas'}
            </p>
            <p className="text-[10px] tracking-widest uppercase text-white/30">Explora nuestras experiencias exclusivas</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filterReservations(reservations).map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-gold-400/30 transition-all duration-500"
              >
                <img
                  src={reservation.experiences?.image_url}
                  alt={reservation.experiences?.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-6 space-y-4">
                  <span className="text-[10px] font-medium text-gold-400 uppercase tracking-widest">
                    {formatDate(reservation.reservation_date)}
                  </span>
                  <h3 className="text-lg font-light text-white tracking-wide">
                    {reservation.experiences?.title}
                  </h3>
                  <p className="text-[10px] text-white/40 font-light tracking-widest uppercase">
                    {reservation.experiences?.destinations?.name}
                  </p>
                  <button
                    onClick={() => setSelectedReservation(reservation)}
                    className="w-full bg-transparent border border-gold-400/40 text-gold-400 hover:bg-gold-400 hover:text-black font-light py-3 rounded-full text-[10px] transition-all duration-500 tracking-widest uppercase hover:scale-105 active:scale-95"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
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
