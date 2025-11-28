import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Destination, Experience, Category } from '../lib/supabase';
import ExperienceDetailPage from './ExperienceDetailPage';

interface HomePageProps {
  onPageChange: (page: string) => void;
}

export default function HomePage({ onPageChange }: HomePageProps) {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [showDetailPage, setShowDetailPage] = useState(false);

  useEffect(() => {
    fetchDestinations();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedDestination) {
      fetchExperiences();
    }
  }, [selectedDestination, selectedCategory]);

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

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (data) {
      setCategories(data);
    }
  };

  const fetchExperiences = async () => {
    let query = supabase
      .from('experiences')
      .select('*, destinations(*), categories(*)')
      .eq('destination_id', selectedDestination)
      .eq('is_featured', true);

    // Apply category filter if a category is selected
    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    const { data } = await query;

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

  if (showDetailPage && selectedExperience) {
    return (
      <ExperienceDetailPage
        experience={selectedExperience}
        onBack={() => {
          setShowDetailPage(false);
          setSelectedExperience(null);
        }}
        onReservationCreated={() => {
          onPageChange('reservas');
        }}
      />
    );
  }

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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extralight text-gold-400/90 tracking-wide">Categorías</h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="text-[9px] text-white/40 hover:text-gold-400 font-light tracking-widest uppercase transition-colors"
              >
                Ver Todas
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Bienestar */}
            <button
              onClick={() => setSelectedCategory(selectedCategory === categories.find(c => c.name === 'Bienestar')?.id ? '' : categories.find(c => c.name === 'Bienestar')?.id || '')}
              className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 ${
                selectedCategory === categories.find(c => c.name === 'Bienestar')?.id
                  ? 'bg-gradient-to-br from-rose-500/20 to-pink-500/10 border-2 border-rose-400/50 shadow-lg shadow-rose-400/20 scale-[1.02]'
                  : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-rose-400/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-rose-400/10'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-400/0 to-pink-400/0 group-hover:from-rose-400/5 group-hover:to-pink-400/5 transition-all duration-500" />
              <div className="relative flex flex-col items-center gap-3 text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  selectedCategory === categories.find(c => c.name === 'Bienestar')?.id
                    ? 'bg-rose-400/30 shadow-lg shadow-rose-400/30'
                    : 'bg-rose-400/10 group-hover:bg-rose-400/20'
                }`}>
                  <svg className="w-7 h-7 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className={`text-xs font-light tracking-wider uppercase transition-colors ${
                  selectedCategory === categories.find(c => c.name === 'Bienestar')?.id
                    ? 'text-rose-300'
                    : 'text-white/90'
                }`}>Bienestar</span>
              </div>
            </button>

            {/* Lujo */}
            <button
              onClick={() => setSelectedCategory(selectedCategory === categories.find(c => c.name === 'Lujo')?.id ? '' : categories.find(c => c.name === 'Lujo')?.id || '')}
              className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 ${
                selectedCategory === categories.find(c => c.name === 'Lujo')?.id
                  ? 'bg-gradient-to-br from-gold-500/20 to-amber-500/10 border-2 border-gold-400/50 shadow-lg shadow-gold-400/20 scale-[1.02]'
                  : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-gold-400/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-gold-400/10'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold-400/0 to-amber-400/0 group-hover:from-gold-400/5 group-hover:to-amber-400/5 transition-all duration-500" />
              <div className="relative flex flex-col items-center gap-3 text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  selectedCategory === categories.find(c => c.name === 'Lujo')?.id
                    ? 'bg-gold-400/30 shadow-lg shadow-gold-400/30'
                    : 'bg-gold-400/10 group-hover:bg-gold-400/20'
                }`}>
                  <svg className="w-7 h-7 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <span className={`text-xs font-light tracking-wider uppercase transition-colors ${
                  selectedCategory === categories.find(c => c.name === 'Lujo')?.id
                    ? 'text-gold-300'
                    : 'text-white/90'
                }`}>Lujo</span>
              </div>
            </button>

            {/* Gastronomía */}
            <button
              onClick={() => setSelectedCategory(selectedCategory === categories.find(c => c.name === 'Gastronomía')?.id ? '' : categories.find(c => c.name === 'Gastronomía')?.id || '')}
              className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 ${
                selectedCategory === categories.find(c => c.name === 'Gastronomía')?.id
                  ? 'bg-gradient-to-br from-orange-500/20 to-red-500/10 border-2 border-orange-400/50 shadow-lg shadow-orange-400/20 scale-[1.02]'
                  : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-orange-400/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-400/10'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 to-red-400/0 group-hover:from-orange-400/5 group-hover:to-red-400/5 transition-all duration-500" />
              <div className="relative flex flex-col items-center gap-3 text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  selectedCategory === categories.find(c => c.name === 'Gastronomía')?.id
                    ? 'bg-orange-400/30 shadow-lg shadow-orange-400/30'
                    : 'bg-orange-400/10 group-hover:bg-orange-400/20'
                }`}>
                  <svg className="w-7 h-7 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <span className={`text-xs font-light tracking-wider uppercase transition-colors ${
                  selectedCategory === categories.find(c => c.name === 'Gastronomía')?.id
                    ? 'text-orange-300'
                    : 'text-white/90'
                }`}>Gastronomía</span>
              </div>
            </button>

            {/* Aventura */}
            <button
              onClick={() => setSelectedCategory(selectedCategory === categories.find(c => c.name === 'Aventura')?.id ? '' : categories.find(c => c.name === 'Aventura')?.id || '')}
              className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 ${
                selectedCategory === categories.find(c => c.name === 'Aventura')?.id
                  ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-2 border-emerald-400/50 shadow-lg shadow-emerald-400/20 scale-[1.02]'
                  : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-emerald-400/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-400/10'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-teal-400/0 group-hover:from-emerald-400/5 group-hover:to-teal-400/5 transition-all duration-500" />
              <div className="relative flex flex-col items-center gap-3 text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  selectedCategory === categories.find(c => c.name === 'Aventura')?.id
                    ? 'bg-emerald-400/30 shadow-lg shadow-emerald-400/30'
                    : 'bg-emerald-400/10 group-hover:bg-emerald-400/20'
                }`}>
                  <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8c0-2.874-.673-5.59-1.87-8M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15m1-7h-.08a2 2 0 00-1.519.698L9.6 15.302A2 2 0 018.08 16H8" />
                  </svg>
                </div>
                <span className={`text-xs font-light tracking-wider uppercase transition-colors ${
                  selectedCategory === categories.find(c => c.name === 'Aventura')?.id
                    ? 'text-emerald-300'
                    : 'text-white/90'
                }`}>Aventura</span>
              </div>
            </button>
          </div>
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
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extralight text-gold-400/90 tracking-wide">Experiencias Destacadas</h2>
            {selectedCategory && (
              <span className={`text-[9px] font-light tracking-widest uppercase px-3 py-1 rounded-full ${
                selectedCategory === categories.find(c => c.name === 'Bienestar')?.id
                  ? 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
                  : selectedCategory === categories.find(c => c.name === 'Lujo')?.id
                  ? 'bg-gold-400/20 text-gold-300 border border-gold-400/30'
                  : selectedCategory === categories.find(c => c.name === 'Gastronomía')?.id
                  ? 'bg-orange-400/20 text-orange-300 border border-orange-400/30'
                  : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
              }`}>
                {categories.find(c => c.id === selectedCategory)?.name}
              </span>
            )}
          </div>

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
                      setShowDetailPage(true);
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
    </div>
  );
}
