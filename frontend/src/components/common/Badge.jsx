import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  ...props
}) => {
  const variants = {
    default: 'bg-teal-50/80 text-teal-900 border-teal-200/80',
    dark: 'bg-[#0F172A] text-white border-transparent',
    charcoal: 'bg-[#1E293B] text-white border-white/10',
    orange: 'bg-teal-50 text-teal-700 border-teal-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 gap-1 font-mono',
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const dotColors = {
    default: 'bg-teal-600',
    dark: 'bg-white',
    charcoal: 'bg-white',
    orange: 'bg-[#0D9488]',
    teal: 'bg-[#0D9488]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors select-none ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`} />}
      {children}
    </span>
  );
};

export default Badge;
