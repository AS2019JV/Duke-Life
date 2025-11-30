import { useEffect, useState } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  animationKey: number;
}

export default function AnimatedText({ text, className = '', animationKey }: AnimatedTextProps) {
  return (
    <span className={className}>
      {text.split('').map((char, index) => (
        <span
          key={`${animationKey}-${index}`}
          className="inline-block"
          style={{
            opacity: 0,
            animation: 'fadeInUp 0.4s ease-out forwards',
            animationDelay: `${index * 20}ms`
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
