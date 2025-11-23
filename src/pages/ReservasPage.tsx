import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Reservation } from '../lib/supabase';

let subscriptionUnsubscribe: (() => void) | null = null;

export default function ReservasPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

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
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/10 p-4">
        <h1 className="text-2xl font-bold text-white text-center tracking-tight">Mis Reservas</h1>
      </header>

      <main className="p-4 space-y-6">
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 font-medium py-3 border-b-2 transition-colors tracking-wide ${
              activeTab === 'upcoming'
                ? 'text-yellow-600 border-b-yellow-600'
                : 'text-gray-400 border-b-transparent'
            }`}
          >
            Próximas
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 font-medium py-3 border-b-2 transition-colors tracking-wide ${
              activeTab === 'past'
                ? 'text-yellow-600 border-b-yellow-600'
                : 'text-gray-400 border-b-transparent'
            }`}
          >
            Pasadas
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-8">Cargando reservas...</div>
        ) : filterReservations(reservations).length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>
              {activeTab === 'upcoming'
                ? 'No tienes reservas próximas'
                : 'No tienes reservas pasadas'}
            </p>
            <p className="text-sm mt-2">Explora nuestras experiencias exclusivas</p>
          </div>
        ) : (
          filterReservations(reservations).map((reservation) => (
            <div
              key={reservation.id}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden"
            >
              <img
                src={reservation.experiences?.image_url}
                alt={reservation.experiences?.title}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <span className="text-xs font-medium text-yellow-600 uppercase tracking-widest">
                  {formatDate(reservation.reservation_date)}
                </span>
                <h3 className="text-lg font-bold text-white mt-2 tracking-tight">
                  {reservation.experiences?.title}
                </h3>
                <p className="text-sm text-gray-400 mb-3 font-light">
                  {reservation.experiences?.destinations?.name}
                </p>
                <button
                  onClick={() =>
                    alert('Ver detalles: QR, ubicación, información de contacto')
                  }
                  className="w-full bg-gray-700 text-white font-medium py-2 rounded-lg text-sm hover:bg-yellow-600 hover:text-black transition-colors tracking-wide"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
