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
    default: 'bg-gray-100 text-[#111111] border-gray-200',
    dark: 'bg-[#111111] text-white border-transparent',
    charcoal: 'bg-[#1B1B1B] text-white border-white/10',
    orange: 'bg-[#FF7138]/10 text-[#FF7138] border-[#FF7138]/25',
    teal: 'bg-[#20B8A5]/10 text-[#20B8A5] border-[#20B8A5]/25',
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
    default: 'bg-gray-400',
    dark: 'bg-white',
    charcoal: 'bg-white',
    orange: 'bg-[#FF7138]',
    teal: 'bg-[#20B8A5]',
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
