import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Destination, Experience, Category } from '../lib/supabase';
import ExperienceDetailPage from './ExperienceDetailPage';
import HeroCarousel from '../components/home/HeroCarousel';
import { User } from 'lucide-react';

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


  const dragRef = useRef({ startX: 0, currentX: 0, isDragging: false });
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const carouselIndex = currentImageIndex % 4; // 4 images in HeroCarousel

  const handleDragStart = (clientX: number) => {
    dragRef.current = { startX: clientX, currentX: clientX, isDragging: true };
  };

  const handleDragMove = (clientX: number) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.currentX = clientX;
  };

  const handleDragEnd = () => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    
    const diff = dragRef.current.currentX - dragRef.current.startX;
    
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
    }
  };

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
      // Sort: Riviera Maya first, Miami middle, Dubai last
      const order = ['Riviera Maya', 'Miami', 'Dubai'];
      const sortedData = [...data].sort((a, b) => {
        const indexA = order.indexOf(a.name);
        const indexB = order.indexOf(b.name);
        
        // If both are in the order array, sort by their position
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        // If only a is in the order array, it comes first
        if (indexA !== -1) return -1;
        // If only b is in the order array, it comes first
        if (indexB !== -1) return 1;
        // Otherwise, sort alphabetically
        return a.name.localeCompare(b.name);
      });

      setDestinations(sortedData);
      if (sortedData.length > 0) {
        setSelectedDestination(sortedData[0].id);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Full-Width Hero Carousel Header - 21:9 Aspect Ratio */}
      <HeroCarousel currentIndex={carouselIndex} />
      
      {/* Sticky Header with User Info - Below Carousel, Above Content */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl px-6 py-4 transition-all duration-300">
        <div className="flex justify-between items-center">
          {/* Left Side: Avatar & Name (Reduced Size) */}
          <button 
            onClick={() => onPageChange('perfil')}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-10 h-10 rounded-full p-[1px] bg-gradient-to-b from-gold-400 to-gold-900 shadow-lg shadow-gold-900/20">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <User className="text-gold-400 w-5 h-5" />
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-gold-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {/* Green Online Indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse" />
            </div>
            
            <h1 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/80 tracking-wide group-hover:text-gold-200 transition-colors">
              {user?.full_name?.split(' ')[0] || 'Socio'}
            </h1>
          </button>
          
          {/* Right Side: Membership Badge with 'Socio' label */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-semibold text-gold-300/60 tracking-[0.25em] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              Socio
            </span>
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-black via-zinc-900 to-black border border-gold-400/30 shadow-[0_0_15px_rgba(250,204,21,0.1)] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-[9px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-gold-200 tracking-[0.2em] uppercase">
                {getMembershipDisplay()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-10">
        <div>
          {/* Section Header with Luxury Typography */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 tracking-[0.15em] uppercase">
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
          <div className="relative w-full flex flex-col items-center gap-8">
            <div className="relative w-full h-[400px] flex justify-center items-center overflow-hidden">
              {/* Luxury Side Fades */}
              <div className="absolute left-0 top-0 bottom-0 w-6 md:w-24 bg-gradient-to-r from-black via-black/80 to-transparent z-40 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-6 md:w-24 bg-gradient-to-l from-black via-black/80 to-transparent z-40 pointer-events-none" />
              
              <div 
                className="relative w-full h-full flex justify-center items-center perspective-1000 cursor-grab active:cursor-grabbing"
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                onTouchEnd={handleDragEnd}
                onMouseDown={(e) => handleDragStart(e.clientX)}
                onMouseMove={(e) => handleDragMove(e.clientX)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                {categories.map((category, index) => {
                  const categoryImages: Record<string, string> = {
                    'Bienestar': 'https://sfqoraqpngkrfrgzxjdo.supabase.co/storage/v1/object/public/Categories/Wellness.webp',
                    'Lujo': 'https://sfqoraqpngkrfrgzxjdo.supabase.co/storage/v1/object/public/Categories/Luxury.webp',
                    'Gastronomía': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800',
                    'Aventura': 'https://sfqoraqpngkrfrgzxjdo.supabase.co/storage/v1/object/public/Categories/Adventure.webp'
                  };

                  const categorySubtitles: Record<string, string> = {
                    'Bienestar': 'Rituales, spas y masajes exclusivos',
                    'Lujo': 'Experiencias de alta gama y confort',
                    'Gastronomía': 'Sabores únicos y cocina de autor',
                    'Aventura': 'Emociones intensas y naturaleza'
                  };

                  // Calculate position relative to active index
                  let offset = (index - activeCategoryIndex + categories.length) % categories.length;
                  // Adjust offset to be -1, 0, 1, 2 (for 4 items)
                  if (offset > categories.length / 2) offset -= categories.length;

                  // Determine styles based on offset
                  let styles = '';
                  if (offset === 0) {
                    // Center (VIP Active)
                    styles = 'z-30 scale-[1.02] translate-x-0 opacity-100 shadow-[0_18px_45px_rgba(0,0,0,0.6)] cursor-pointer ring-1 ring-white/10';
                  } else if (offset === 1 || offset === -3) {
                    // Right
                    styles = 'z-20 scale-90 translate-x-[65%] opacity-60 blur-[2px] hover:opacity-80 transition-all';
                  } else if (offset === -1 || offset === 3) {
                    // Left
                    styles = 'z-20 scale-90 -translate-x-[65%] opacity-60 blur-[2px] hover:opacity-80 transition-all';
                  } else {
                    // Back (Hidden/Far)
                    styles = 'z-10 scale-75 translate-x-0 opacity-0';
                  }

                  return (
                    <button
                      key={category.id}
                      onClick={(e) => {
                        // Prevent click if it was a drag
                        if (Math.abs(dragRef.current.currentX - dragRef.current.startX) > 10) {
                          e.preventDefault();
                          return;
                        }
                        
                        if (offset === 0) {
                          // Only scroll if clicking the active center card
                          experiencesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className={`absolute transition-all duration-500 ease-out rounded-3xl overflow-hidden w-[70vw] max-w-xs h-[60vh] max-h-96 ${styles}`}
                    >
                      <img 
                        src={categoryImages[category.name] || 'https://images.unsplash.com/photo-1518182170546-0766aa6f6a56?auto=format&fit=crop&q=80&w=800'} 
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none opacity-80" />
                      
                      {/* Glassmorphism Content Area */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                        <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 transition-all duration-500 ${offset === 0 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                          <h3 className="text-[0.9rem] font-semibold text-white tracking-[0.2em] uppercase mb-1">
                            {category.name}
                          </h3>
                          <p className="text-xs text-gray-300/70 font-light tracking-wide">
                            {categorySubtitles[category.name] || 'Experiencias exclusivas'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Indicators */}
            <div className="flex items-center gap-2">
              {categories.map((_, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 rounded-full ${
                    index === activeCategoryIndex
                      ? 'w-6 h-1 bg-white/40 backdrop-blur-sm shadow-sm'
                      : 'w-1 h-1 bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>


        {/* Experiences Section */}
        <div ref={experiencesRef} className="space-y-5 scroll-mt-6">
          {/* Section Header with Luxury Typography */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-400/30 to-gold-300/20" />
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 tracking-[0.15em] uppercase">
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

                {/* Discount Badge */}
                {(() => {
                   let membershipPrice = exp.gold_price;
                   if (user?.membership_type === 'platinum') membershipPrice = exp.platinum_price;
                   if (user?.membership_type === 'black_elite') membershipPrice = exp.black_elite_price;
                   
                   // Handle Black Elite included case
                   if (user?.membership_type === 'black_elite' && exp.black_elite_included) {
                     return (
                        <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-xl border-2 border-gold-400/60 px-5 py-2 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_24px_rgba(212,175,55,0.4)] group-hover:shadow-[0_12px_48px_rgba(0,0,0,0.8),0_0_32px_rgba(212,175,55,0.6)] group-hover:scale-105 transition-all duration-500">
                           <span className="text-[11px] font-extrabold text-gold-300 tracking-[0.2em] uppercase drop-shadow-[0_2px_8px_rgba(212,175,55,0.8)]">
                             ✦ Incluido
                           </span>
                        </div>
                     );
                   }

                   const discount = Math.round(((exp.base_price - membershipPrice) / exp.base_price) * 100);
                   
                   if (discount > 0) {
                     const isHighDiscount = discount >= 55;
                     const colorClasses = isHighDiscount
                       ? 'bg-red-950/70 border-red-500/50 text-red-100 shadow-[0_8px_16px_rgba(153,27,27,0.3)]'
                       : 'bg-yellow-950/70 border-yellow-500/50 text-yellow-100 shadow-[0_8px_16px_rgba(234,179,8,0.3)]';

                     return (
                       <div className={`absolute top-6 left-6 px-6 py-2.5 rounded-full border-2 backdrop-blur-xl flex items-center justify-center gap-2 ${colorClasses} z-10 transition-transform duration-500 hover:scale-105`}>
                         <span className="text-sm font-bold tracking-[0.2em] uppercase drop-shadow-md">
                           {discount}% OFF
                         </span>
                       </div>
                     );
                   }
                   return null;
                })()}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-start gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-400/15 to-gold-500/10 backdrop-blur-sm border border-gold-400/40 px-3 py-1 rounded-full shadow-[0_2px_12px_rgba(212,175,55,0.25)]">
                      <span className="w-1 h-1 rounded-full bg-gold-400 shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                      <span className="text-[10px] text-gold-300 font-semibold tracking-[0.2em] uppercase">{exp.destinations?.name}</span>
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
