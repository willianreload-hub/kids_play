'use client';

import React from 'react';
import { sounds } from '../lib/sound-effects';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'dark' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function PixelButton({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  onClick,
  ...props
}: PixelButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    sounds.playClick();
    if (onClick) {
      onClick(e);
    }
  };

  const variantClass = {
    primary: 'pixel-btn-primary',
    success: 'pixel-btn-success',
    warning: 'pixel-btn-warning',
    info: 'pixel-btn-info',
    dark: 'pixel-btn-dark',
    danger: 'pixel-btn-danger',
  }[variant];

  const sizeClass = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-5 py-3',
    lg: 'text-base px-7 py-4',
  }[size];

  return (
    <button
      type="button"
      className={`pixel-btn ${variantClass} ${sizeClass} gap-2 inline-flex items-center select-none ${className}`}
      onClick={handleClick}
      {...props}
    >
      {icon && <span className="text-lg leading-none">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
