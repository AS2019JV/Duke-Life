import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Destination, Experience } from '../lib/supabase';
import ReservationModal from '../components/ReservationModal';

interface HomePageProps {
  onPageChange: (page: string) => void;
}

export default function HomePage({ onPageChange }: HomePageProps) {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (selectedDestination) {
      fetchExperiences();
    }
  }, [selectedDestination]);

  const fetchDestinations = async () => {
    const { data } = await supabase
      .from('destinations')
      .select('*')
      .order('name');

    if (data) {
      setDestinations(data);
      if (data.length > 0) {
        setSelectedDestination(data[0].id);
      }
    }
  };

  const fetchExperiences = async () => {
    const { data } = await supabase
      .from('experiences')
      .select('*, destinations(*), categories(*)')
      .eq('destination_id', selectedDestination)
      .eq('is_featured', true);

    if (data) {
      setExperiences(data);
    }
  };

  const getMembershipDisplay = () => {
    if (user?.membership_type === 'black_elite') return 'BLACK ELITE';
    if (user?.membership_type === 'platinum') return 'PLATINUM';
    return 'GOLD';
  };

  const getPrice = (exp: Experience) => {
    if (user?.membership_type === 'black_elite' && exp.black_elite_included) {
      return { text: 'Incluido (1/mes)', original: exp.base_price };
    }
    if (user?.membership_type === 'black_elite') {
      return { text: `$${exp.black_elite_price}`, original: exp.base_price };
    }
    if (user?.membership_type === 'platinum') {
      return { text: `$${exp.platinum_price}`, original: exp.base_price };
    }
    return { text: `$${exp.gold_price}`, original: exp.base_price };
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-light text-gray-500 tracking-wide">Bienvenido,</p>
            <h1 className="text-2xl font-bold text-white mt-1">{user?.full_name || 'Miembro Duke'}</h1>
          </div>
          <div className="text-right">
            <span className="block font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600 text-xs tracking-widest">
              ✦ {getMembershipDisplay()} ✦
            </span>
            <button
              onClick={() => onPageChange('perfil')}
              className="text-xs text-gray-500 hover:text-yellow-600 font-medium tracking-wide mt-1"
            >
              Ver Perfil
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Asistencia Inmediata</h2>
          <button
            onClick={() => onPageChange('concierge')}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold py-3 px-6 rounded-xl shadow-lg shadow-yellow-500/40 transition-all duration-300 transform hover:scale-105 text-base tracking-wide"
          >
            Contactar Concierge 24/7
          </button>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white">Destinos</h2>
          <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
            {destinations.map((dest) => (
              <button
                key={dest.id}
                onClick={() => setSelectedDestination(dest.id)}
                className={`flex-shrink-0 font-medium px-4 py-2 rounded-full text-sm transition-colors tracking-wide ${
                  selectedDestination === dest.id
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                    : 'bg-[#1a1a1a] border border-white/10 text-gray-300'
                }`}
              >
                {dest.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Experiencias Destacadas</h2>

          {experiences.map((exp) => {
            const price = getPrice(exp);
            return (
              <div
                key={exp.id}
                className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
              >
                <img
                  src={exp.image_url}
                  alt={exp.title}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white">{exp.title}</h3>
                  <p className="text-sm text-gray-400 mb-3 font-light tracking-wide">
                    {exp.categories?.name} • {exp.destinations?.name}
                  </p>

                  <div className="text-xs space-y-1 text-gray-300 mb-4 font-light">
                    <p>
                      <span className="font-semibold text-yellow-300 tracking-wide">
                        {getMembershipDisplay()}:
                      </span>{' '}
                      {price.original > 0 && (
                        <span className="line-through opacity-70">${price.original}</span>
                      )}{' '}
                      <span className="font-semibold text-yellow-300">{price.text}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedExperience(exp);
                      setShowModal(true);
                    }}
                    className="w-full bg-gray-700 text-white font-medium py-2 rounded-lg text-sm hover:bg-yellow-600 hover:text-black transition-colors tracking-wide"
                  >
                    Reservar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {showModal && selectedExperience && (
        <ReservationModal
          experience={selectedExperience}
          onClose={() => {
            setShowModal(false);
            setSelectedExperience(null);
          }}
          onReservationCreated={() => {
            onPageChange('reservas');
          }}
        />
      )}
    </div>
  );
}
