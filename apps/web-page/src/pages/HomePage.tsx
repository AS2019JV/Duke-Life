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
      // Filter out Educación category
      setCategories(data.filter(cat => cat.name !== 'Educación'));
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
          {/* Section Header with Luxury Typography */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
              <h2 className="text-2xl font-light text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 tracking-[0.15em] uppercase">
                Categorías
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
            </div>
            
            {/* Integrated Destinations Filter */}
            <div className="flex justify-center gap-2 mt-6">
              {destinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => setSelectedDestination(dest.id)}
                  className={`px-4 py-1.5 rounded-full text-[9px] font-light tracking-[0.2em] uppercase transition-all duration-300 ${
                    selectedDestination === dest.id
                      ? 'bg-gradient-to-r from-gold-400/20 to-gold-500/10 text-gold-300 border border-gold-400/40 shadow-lg shadow-gold-900/20'
                      : 'text-white/40 hover:text-gold-400/70 border border-white/5 hover:border-gold-400/20'
                  }`}
                >
                  {dest.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Categories Carousel with Swipe Support */}
          <div 
            className="flex space-x-4 overflow-x-auto pb-8 -mx-6 px-6 no-scrollbar snap-x snap-mandatory scroll-smooth touch-pan-x"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {categories.map((category) => {
              const categoryImages: Record<string, string> = {
                'Bienestar': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800',
                'Lujo': 'https://images.unsplash.com/photo-1565623833408-d77e39b88af6?auto=format&fit=crop&q=80&w=800',
                'Gastronomía': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800',
                'Aventura': 'https://images.unsplash.com/photo-1533692328991-08159ff19fca?auto=format&fit=crop&q=80&w=800'
              };

              const isSelected = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(isSelected ? '' : category.id)}
                  className={`relative flex-shrink-0 w-40 h-56 rounded-xl overflow-hidden transition-all duration-500 snap-center group ${
                    isSelected 
                      ? 'ring-2 ring-gold-400 scale-105 shadow-xl shadow-gold-900/40' 
                      : 'hover:scale-105 hover:shadow-lg hover:shadow-black/50 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={categoryImages[category.name] || 'https://images.unsplash.com/photo-1518182170546-0766aa6f6a56?auto=format&fit=crop&q=80&w=800'} 
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-500 ${
                    isSelected ? 'opacity-90' : 'opacity-60 group-hover:opacity-80'
                  }`} />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <span className={`text-sm font-medium tracking-widest uppercase text-center transition-colors duration-300 ${
                      isSelected ? 'text-gold-400' : 'text-white group-hover:text-gold-200'
                    }`}>
                      {category.name}
                    </span>
                    {isSelected && (
                      <div className="w-1 h-1 bg-gold-400 rounded-full mx-auto mt-2 animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>


        {/* Experiences Section */}
        <div className="space-y-5">
          {/* Section Header with Luxury Typography */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-400/30 to-gold-300/20" />
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-light text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 tracking-[0.15em] uppercase">
                Experiencias Destacadas
              </h2>
              {selectedCategory && (
                <span className={`text-[9px] font-light tracking-widest uppercase px-3 py-1 rounded-full bg-gold-400/10 text-gold-300 border border-gold-400/20`}>
                  {categories.find(c => c.id === selectedCategory)?.name}
                </span>
              )}
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-gold-300/20 via-gold-400/30 to-transparent" />
          </div>

          {experiences.map((exp) => {

            return (
              <div
                key={exp.id}
                className="group relative h-[400px] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-gold-900/20"
              >
                {/* Background Image */}
                <img
                  src={exp.image_url}
                  alt={exp.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-start gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-gold-400 font-medium tracking-[0.2em] uppercase">
                      <span className="w-1 h-1 rounded-full bg-gold-400" />
                      {exp.destinations?.name}
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-tight max-w-[80%]">
                      {exp.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedExperience(exp);
                      setShowDetailPage(true);
                    }}
                    className="bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-black font-bold py-3 px-8 rounded-full shadow-lg shadow-gold-900/30 transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:shadow-gold-900/40 text-xs tracking-widest uppercase"
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
