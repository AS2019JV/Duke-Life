import { useEffect, useState, useRef } from 'react';
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
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const experiencesRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

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
          
          
          {/* Coverflow Style Carousel */}
          <div className="relative w-full h-[400px] flex justify-center items-center overflow-hidden">
            <div 
              className="relative w-full h-full flex justify-center items-center perspective-1000"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                carouselRef.current = { startX: touch.clientX, lastX: touch.clientX } as any;
              }}
              onTouchMove={(e) => {
                if (!carouselRef.current) return;
                const touch = e.touches[0];
                const diff = touch.clientX - (carouselRef.current as any).startX;
                // Optional: Add some drag resistance or visual feedback here
              }}
              onTouchEnd={(e) => {
                if (!carouselRef.current) return;
                const touch = e.changedTouches[0];
                const diff = touch.clientX - (carouselRef.current as any).startX;
                
                if (Math.abs(diff) > 50) { // Threshold for swipe
                  if (diff > 0) {
                    // Swipe Right -> Previous
                    setActiveCategoryIndex((prev) => (prev - 1 + categories.length) % categories.length);
                  } else {
                    // Swipe Left -> Next
                    setActiveCategoryIndex((prev) => (prev + 1) % categories.length);
                  }
                  
                  // Update selected category
                  const newIndex = diff > 0 
                    ? (activeCategoryIndex - 1 + categories.length) % categories.length
                    : (activeCategoryIndex + 1) % categories.length;
                  
                  setSelectedCategory(categories[newIndex].id);
                  
                  // Smooth scroll to experiences
                  setTimeout(() => {
                    experiencesRef.current?.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    });
                  }, 300);
                }
                carouselRef.current = null;
              }}
            >
              {categories.map((category, index) => {
                const categoryImages: Record<string, string> = {
                  'Bienestar': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800',
                  'Lujo': 'https://images.unsplash.com/photo-1565623833408-d77e39b88af6?auto=format&fit=crop&q=80&w=800',
                  'Gastronomía': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800',
                  'Aventura': 'https://images.unsplash.com/photo-1533692328991-08159ff19fca?auto=format&fit=crop&q=80&w=800'
                };

                // Calculate position relative to active index
                let offset = (index - activeCategoryIndex + categories.length) % categories.length;
                // Adjust offset to be -1, 0, 1, 2 (for 4 items)
                if (offset > categories.length / 2) offset -= categories.length;

                // Determine styles based on offset
                let styles = '';
                if (offset === 0) {
                  // Center
                  styles = 'z-30 scale-100 translate-x-0 opacity-100 shadow-2xl shadow-gold-900/50';
                } else if (offset === 1 || offset === -3) {
                  // Right
                  styles = 'z-20 scale-85 translate-x-[60%] opacity-60 hover:opacity-80';
                } else if (offset === -1 || offset === 3) {
                  // Left
                  styles = 'z-20 scale-85 -translate-x-[60%] opacity-60 hover:opacity-80';
                } else {
                  // Back (Hidden/Far)
                  styles = 'z-10 scale-75 translate-x-0 opacity-0'; // Hide the back one for cleaner look with 4 items
                }

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      if (offset === 0) {
                        // If clicking active, just scroll
                        experiencesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      } else {
                        // If clicking side, make active
                        setActiveCategoryIndex(index);
                        setSelectedCategory(category.id);
                        setTimeout(() => {
                          experiencesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 300);
                      }
                    }}
                    className={`absolute transition-all duration-500 ease-out rounded-2xl overflow-hidden w-[70vw] max-w-xs h-[60vh] max-h-96 ${styles}`}
                  >
                    <img 
                      src={categoryImages[category.name] || 'https://images.unsplash.com/photo-1518182170546-0766aa6f6a56?auto=format&fit=crop&q=80&w=800'} 
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent ${offset === 0 ? 'opacity-80' : 'opacity-60'}`} />
                    
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <span className={`font-bold tracking-widest uppercase text-center transition-all duration-300 ${
                        offset === 0 ? 'text-gold-400 text-xl' : 'text-white/80 text-sm'
                      }`}>
                        {category.name}
                      </span>
                      {offset === 0 && (
                        <div className="w-1.5 h-1.5 bg-gold-400 rounded-full mx-auto mt-3 animate-pulse" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>


        {/* Experiences Section */}
        <div ref={experiencesRef} className="space-y-5 scroll-mt-6">
          {/* Section Header with Luxury Typography */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-400/30 to-gold-300/20" />
              <h2 className="text-2xl font-light text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 tracking-[0.15em] uppercase">
                Experiencias
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-gold-300/20 via-gold-400/30 to-transparent" />
            </div>
            {selectedCategory && (
              <div className="flex justify-center">
                <span className={`text-[9px] font-light tracking-widest uppercase px-3 py-1 rounded-full bg-gold-400/10 text-gold-300 border border-gold-400/20`}>
                  {categories.find(c => c.id === selectedCategory)?.name}
                </span>
              </div>
            )}
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
