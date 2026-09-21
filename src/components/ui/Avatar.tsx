'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'data-testid'?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  'data-testid': testId = 'avatar',
}) => {
  const [imageError, setImageError] = useState(false);

  let sizeClass = 'w-10 h-10 text-callout'; // md = 40px
  if (size === 'sm') sizeClass = 'w-8 h-8 text-caption';
  if (size === 'lg') sizeClass = 'w-12 h-12 text-title-3';

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      data-testid={testId}
      className={`relative rounded-full overflow-hidden bg-sb-navy-tint text-sb-navy font-semibold flex items-center justify-center flex-shrink-0 border border-sb-border shadow-e1 select-none ${sizeClass} ${className}`}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes="48px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
