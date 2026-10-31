import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary: 'bg-[#0D9488] text-white font-medium hover:bg-[#0F766E] active:bg-[#115E59] focus:ring-[#0D9488] shadow-sm shadow-[#0D9488]/20',
    secondary: 'bg-[#0F172A] text-white font-medium hover:bg-[#1E293B] active:bg-black focus:ring-[#0F172A]',
    teal: 'bg-[#0D9488] text-white font-semibold hover:bg-[#0F766E] active:bg-[#115E59] focus:ring-[#0D9488] shadow-sm shadow-[#0D9488]/20',
    outline: 'border border-teal-200 bg-white text-[#0F172A] hover:bg-teal-50/60 hover:border-teal-400 focus:ring-teal-200',
    outlineOrange: 'border border-[#0D9488] text-[#0D9488] bg-white hover:bg-[#F0FDFA] focus:ring-[#0D9488]',
    outlineTeal: 'border border-[#0D9488] text-[#0D9488] bg-white hover:bg-[#F0FDFA] focus:ring-[#0D9488]',
    ghost: 'text-[#0F172A] hover:bg-teal-50 hover:text-[#0D9488] active:bg-teal-100 focus:ring-teal-200',
    white: 'bg-white text-[#0F172A] hover:bg-teal-50/60 active:bg-teal-100 shadow-sm border border-teal-100 focus:ring-white',
    outlineWhite: 'border-2 border-white text-white bg-white/10 hover:bg-white hover:text-teal-950 active:bg-white/90 backdrop-blur-sm shadow-sm focus:ring-white transition-all duration-200',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1 gap-1',
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
    md: 'text-sm px-4 py-2.5 gap-2 font-medium',
    lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
