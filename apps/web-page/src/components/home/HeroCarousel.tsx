import { useState, useEffect } from 'react';

const IMAGES = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2000', // Luxury Hotel
  'https://images.unsplash.com/photo-1569335467454-38d912a2339e?auto=format&fit=crop&q=80&w=2000', // Fine Dining
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=2000'  // Luxury Travel
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '21/9' }}>
      {/* Images */}
      {IMAGES.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={img}
            alt={`Luxury Experience ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {/* Luxury Black Gradient Fade - Bottom to Top */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
      ))}
    </div>
  );
}
