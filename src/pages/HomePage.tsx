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
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5 p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-light text-white/40 tracking-[0.3em] uppercase mb-2">Bienvenido,</p>
            <h1 className="text-2xl font-extralight text-gold-400/90 tracking-wide">{user?.full_name || 'Miembro Duke'}</h1>
          </div>
          <div className="text-right">
            <span className="block font-light text-gold-400 text-[10px] tracking-[0.3em] uppercase mb-2">
              {getMembershipDisplay()}
            </span>
            <button
              onClick={() => onPageChange('perfil')}
              className="text-[10px] text-white/40 hover:text-gold-400 font-light tracking-wider uppercase transition-colors border-b border-transparent hover:border-gold-400"
            >
              Ver Perfil
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-10">
        <div>
          <h2 className="text-xl font-extralight text-gold-400/90 mb-4 tracking-wide">Asistencia Inmediata</h2>
          <button
            onClick={() => onPageChange('concierge')}
            className="w-full bg-gold-400 hover:bg-gold-300 text-black font-medium py-4 rounded-full shadow-lg shadow-gold-900/20 transition-all duration-500 transform hover:scale-[1.02] text-xs tracking-widest uppercase"
          >
            Contactar Concierge 24/7
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-extralight text-gold-400/90 tracking-wide">Destinos</h2>
          <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
            {destinations.map((dest) => (
              <button
                key={dest.id}
                onClick={() => setSelectedDestination(dest.id)}
                className={`flex-shrink-0 font-light px-5 py-2 rounded-full text-[10px] transition-all duration-300 tracking-widest uppercase ${
                  selectedDestination === dest.id
                    ? 'bg-gold-400 text-black'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:border-gold-400/40'
                }`}
              >
                {dest.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <h2 className="text-xl font-extralight text-gold-400/90 tracking-wide">Experiencias Destacadas</h2>

          {experiences.map((exp) => {
            const price = getPrice(exp);
            return (
              <div
                key={exp.id}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-gold-400/30 transition-all duration-500"
              >
                <img
                  src={exp.image_url}
                  alt={exp.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-light text-white tracking-wide">{exp.title}</h3>
                  <p className="text-[10px] text-white/40 font-light tracking-widest uppercase">
                    {exp.categories?.name} • {exp.destinations?.name}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-white/60 font-light">
                    <span className="text-gold-400 tracking-wider uppercase text-[10px]">
                      {getMembershipDisplay()}:
                    </span>
                    {price.original > 0 && (
                      <span className="line-through opacity-50">${price.original}</span>
                    )}
                    <span className="font-medium text-gold-400">{price.text}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedExperience(exp);
                      setShowModal(true);
                    }}
                    className="w-full bg-transparent border border-gold-400/40 text-gold-400 hover:bg-gold-400 hover:text-black font-light py-3 rounded-full text-[10px] transition-all duration-500 tracking-widest uppercase"
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
