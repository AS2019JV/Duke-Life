import { useEffect, useState } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  animationKey: number;
}

export default function AnimatedText({ text, className = '', animationKey }: AnimatedTextProps) {
  const [displayedChars, setDisplayedChars] = useState<string[]>([]);

  useEffect(() => {
    // Reset when text changes
    setDisplayedChars([]);
    
    // Add characters one by one
    const chars = text.split('');
    chars.forEach((char, index) => {
      setTimeout(() => {
        setDisplayedChars(prev => [...prev, char]);
      }, index * 50); // 50ms delay between each letter
    });
  }, [animationKey, text]);

  return (
    <span className={className}>
      {displayedChars.map((char, index) => (
        <span
          key={`${animationKey}-${index}`}
          className="inline-block"
          style={{
            opacity: 1,
            animation: 'fadeInUp 0.3s ease-out',
            animationDelay: `${index * 30}ms`,
            animationFillMode: 'backwards'
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
