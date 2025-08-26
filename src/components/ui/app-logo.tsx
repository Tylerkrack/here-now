import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AppLogo = ({ size = 'md', className = '' }: AppLogoProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Location pin shape */}
        <path
          d="M50 10 C35 10 22 23 22 38 C22 45 24 51 28 56 L50 85 L72 56 C76 51 78 45 78 38 C78 23 65 10 50 10 Z"
          fill="hsl(var(--primary))"
          className="drop-shadow-sm"
        />
        {/* Heart shape inside */}
        <path
          d="M50 55 C47 52 35 42 35 35 C35 30 39 26 44 26 C47 26 49 28 50 30 C51 28 53 26 56 26 C61 26 65 30 65 35 C65 42 53 52 50 55 Z"
          fill="white"
        />
      </svg>
    </div>
  );
};

export default AppLogo;