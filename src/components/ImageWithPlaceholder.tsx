import React, { useState } from 'react';

interface ImageWithPlaceholderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  blurhash?: string;
  dominantColor?: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string; // e.g. 'aspect-4/3' or 'aspect-16/9' or 'aspect-square'
  className?: string;
  imgClassName?: string;
}

export const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
  src,
  alt,
  blurhash,
  dominantColor = '#f1f5f9',
  width,
  height,
  aspectRatio = 'aspect-4/3',
  className = '',
  imgClassName = '',
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Fallback avatar / image placeholder if image fails to load
  const fallbackSrc = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

  return (
    <div 
      className={`relative overflow-hidden ${aspectRatio} ${className}`}
      style={{
        backgroundColor: dominantColor,
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
    >
      {/* Background color placeholder until loaded */}
      {!loaded && !error && (
        <div 
          className="absolute inset-0 animate-pulse bg-slate-200" 
          aria-hidden="true" 
        />
      )}

      {/* Actual Image */}
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`h-full w-full object-cover object-center transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
        {...props}
      />
    </div>
  );
};
