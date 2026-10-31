import React from 'react';

export const Card = ({ children, className = '', hover = false, dark = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl transition-all duration-200 ${
        dark
          ? 'bg-[#1B1B1B] text-white border border-white/10 shadow-lg'
          : 'bg-white text-[#111111] border border-gray-200/80 shadow-sm'
      } ${
        hover
          ? dark
            ? 'hover:border-[#FF7138]/50 hover:shadow-xl hover:shadow-[#FF7138]/5 cursor-pointer'
            : 'hover:border-[#FF7138]/40 hover:shadow-md cursor-pointer'
          : ''
      } p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 flex flex-col space-y-1.5 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-base sm:text-lg font-bold font-heading tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-xs sm:text-sm text-[#858585] font-body ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-5 pt-4 border-t border-gray-100 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export default Card;
