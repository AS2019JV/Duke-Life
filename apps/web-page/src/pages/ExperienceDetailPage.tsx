import { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Users, Star, Camera } from 'lucide-react';
import { Experience } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ReservationModal from '../components/ReservationModal';

interface ExperienceDetailPageProps {
  experience: Experience;
  onBack: () => void;
  onReservationCreated: () => void;
}

export default function ExperienceDetailPage({ 
  experience, 
  onBack,
  onReservationCreated 
}: ExperienceDetailPageProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const getMembershipDisplay = () => {
    if (user?.membership_type === 'black_elite') return 'BLACK ELITE';
    if (user?.membership_type === 'platinum') return 'PLATINUM';
    return 'GOLD';
  };

  const getPrice = () => {
    if (user?.membership_type === 'black_elite' && experience.black_elite_included) {
      return { text: 'Incluido en membresía', original: experience.base_price, isFree: true };
    }
    if (user?.membership_type === 'black_elite') {
      return { text: `$${experience.black_elite_price}`, original: experience.base_price, isFree: false };
    }
    if (user?.membership_type === 'platinum') {
      return { text: `$${experience.platinum_price}`, original: experience.base_price, isFree: false };
    }
    return { text: `$${experience.gold_price}`, original: experience.base_price, isFree: false };
  };

  const price = getPrice();

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Hero Image Gallery */}
      <div className="relative h-80 overflow-hidden group">
        <img
          src={experience.image_url}
          alt={experience.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Gallery Button */}
        <button 
          className="absolute bottom-24 right-6 bg-black/40 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-black/60 transition-all"
          onClick={() => alert('Galería completa próximamente')}
        >
          <Camera className="w-4 h-4" />
          <span className="text-xs font-medium tracking-wide">Ver Fotos</span>
        </button>
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-10 bg-black/60 backdrop-blur-xl border border-white/10 text-white rounded-full p-3 hover:bg-black/80 transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
          <div className="flex items-center gap-2 text-xs text-white/90 font-light tracking-widest uppercase">
            <MapPin className="w-3 h-3 text-gold-400" />
            <span>{experience.destinations?.name}</span>
          </div>
          <h1 className="text-3xl font-extralight text-white tracking-wide leading-tight">
            {experience.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <main className="p-6 space-y-8">
        {/* Category Badge */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-gold-400/10 border border-gold-400/20 rounded-full">
            <span className="text-xs font-light text-gold-400 tracking-widest uppercase">
              {experience.categories?.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 h-4 text-gold-400 fill-gold-400" />
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <h2 className="text-xl font-extralight text-gold-400/90 tracking-wide">
            Descripción
          </h2>
          <p className="text-white/70 font-light leading-relaxed text-sm">
            {experience.description}
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <Clock className="w-5 h-5 text-gold-400" />
            <p className="text-xs text-white/40 font-light tracking-wider uppercase">Duración</p>
            <p className="text-sm text-white font-light">Flexible</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <Users className="w-5 h-5 text-gold-400" />
            <p className="text-xs text-white/40 font-light tracking-wider uppercase">Capacidad</p>
            <p className="text-sm text-white font-light">Privado</p>
          </div>
        </div>

        {/* Membership Benefits */}
        <div className="bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-xs text-gold-400/70 font-light tracking-widest uppercase">
                Tu Membresía {getMembershipDisplay()}
              </p>
              <div className="flex items-baseline gap-4">
                {price.original > 0 && !price.isFree && (
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Precio Regular</span>
                    <span className="text-lg text-white/30 line-through font-light">
                      ${price.original}
                    </span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-[9px] text-sage-400/70 uppercase tracking-wider mb-1">Tu Precio</span>
                  <span className={`text-3xl font-bold ${price.isFree ? 'text-transparent bg-clip-text bg-gradient-to-r from-sage-300 via-sage-400 to-sage-300' : 'text-transparent bg-clip-text bg-gradient-to-r from-sage-300 via-sage-400 to-sage-300'} drop-shadow-[0_2px_12px_rgba(110,231,183,0.6)]`}>
                    {price.text}
                  </span>
                </div>
              </div>
            </div>
            {price.isFree && (
              <div className="px-4 py-2 bg-gradient-to-r from-gold-400/20 to-gold-500/10 border border-gold-400/40 rounded-full shadow-[0_4px_16px_rgba(212,175,55,0.3)]">
                <span className="text-xs text-gold-300 font-bold tracking-wider uppercase">
                  1/mes
                </span>
              </div>
            )}
          </div>
          
          {user?.membership_type === 'black_elite' && experience.black_elite_included && (
            <p className="text-xs text-white/60 font-light leading-relaxed">
              Esta experiencia está incluida en tu membresía Black Elite. Puedes disfrutarla una vez al mes sin costo adicional.
            </p>
          )}
        </div>

        {/* Reserve Button */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-black font-semibold py-5 rounded-full shadow-lg shadow-gold-900/30 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-gold-900/40 text-sm tracking-widest uppercase"
        >
          Reservar Ahora
        </button>

        {/* Additional Info */}
        <div className="pt-6 border-t border-white/5 space-y-3">
          <p className="text-xs text-white/40 font-light tracking-wider uppercase">
            Información Adicional
          </p>
          <ul className="space-y-2 text-sm text-white/60 font-light">
            <li className="flex items-start gap-2">
              <span className="text-gold-400 mt-1">•</span>
              <span>Confirmación instantánea</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-400 mt-1">•</span>
              <span>Cancelación flexible hasta 24 horas antes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-400 mt-1">•</span>
              <span>Concierge disponible 24/7 para asistencia</span>
            </li>
          </ul>
        </div>
      </main>

      {showModal && (
        <ReservationModal
          experience={experience}
          onClose={() => setShowModal(false)}
          onReservationCreated={() => {
            setShowModal(false);
            onReservationCreated();
          }}
        />
      )}
    </div>
  );
}
