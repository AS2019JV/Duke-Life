import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button = ({ children, variant = 'primary', className, ...props }: ButtonProps) => {
  return (
    <button 
      className={`px-4 py-2 rounded ${variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
