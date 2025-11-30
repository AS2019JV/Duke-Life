import { useState, useEffect } from 'react';

const IMAGES = [
  'https://sfqoraqpngkrfrgzxjdo.supabase.co/storage/v1/object/public/Slides/Onboarding.webp', // Bienvenida
  'https://sfqoraqpngkrfrgzxjdo.supabase.co/storage/v1/object/public/Slides/Experiences.webp', // Experiences
  'https://sfqoraqpngkrfrgzxjdo.supabase.co/storage/v1/object/public/Slides/Education.webp', // Education
  'https://sfqoraqpngkrfrgzxjdo.supabase.co/storage/v1/object/public/Slides/Network.webp' // Network
];

interface HeroCarouselProps {
  currentIndex: number;
  welcomeMessage: string;
  messageKey: number;
}

export default function HeroCarousel({ currentIndex, welcomeMessage, messageKey }: HeroCarouselProps) {
  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '21/9' }}>
      {/* Images */}
      {IMAGES.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={img} alt={`Luxury Experience ${index + 1}`} className="w-full h-full object-cover" />
          {/* Luxury Black Gradient Fade - Bottom to Top */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
      ))}

      {/* Dynamic Welcome Message Overlay - Bottom Left */}
      <div className="absolute left-6 bottom-6 z-10 max-w-[85%] md:max-w-md">
        <span
          key={messageKey}
          className="text-xs md:text-base font-medium text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-300 to-gold-100 tracking-[0.2em] uppercase animate-in fade-in slide-in-from-bottom-2 duration-700 drop-shadow-lg leading-relaxed block"
        >
          {welcomeMessage}
        </span>
      </div>
    </div>
  );
}
