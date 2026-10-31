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
    primary: 'bg-[#FF7138] text-white hover:bg-[#ff824f] active:bg-[#e65c25] focus:ring-[#FF7138] shadow-sm shadow-[#FF7138]/25',
    secondary: 'bg-[#111111] text-white hover:bg-[#222222] active:bg-black focus:ring-[#111111]',
    teal: 'bg-[#20B8A5] text-white font-semibold hover:bg-[#25caa5] active:bg-[#1ca493] focus:ring-[#20B8A5] shadow-sm shadow-[#20B8A5]/25',
    outline: 'border border-gray-300 bg-white text-[#111111] hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-300',
    outlineOrange: 'border border-[#FF7138] text-[#FF7138] hover:bg-[#FF7138]/10 active:bg-[#FF7138]/20 focus:ring-[#FF7138]',
    ghost: 'text-[#111111] hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-200',
    white: 'bg-white text-[#111111] hover:bg-gray-50 active:bg-gray-100 shadow-sm border border-gray-200 focus:ring-white',
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
