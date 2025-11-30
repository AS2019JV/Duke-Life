import { useEffect, useState } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  animationKey: number;
}

export default function AnimatedText({ text, className = '', animationKey }: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
  }, [animationKey, text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50); // 50ms delay between each letter

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <span className={className}>
      {displayedText.split('').map((char, index) => (
        <span
          key={`${animationKey}-${index}`}
          className="inline-block animate-in fade-in slide-in-from-bottom-1 duration-300"
          style={{
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
