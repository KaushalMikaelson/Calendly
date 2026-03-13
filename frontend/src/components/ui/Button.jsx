import React from 'react';

const base =
  'inline-flex items-center justify-center font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform active:scale-95';

const variants = {
  primary: 'bg-blue-primary hover:bg-blue-600 text-white shadow-button hover:shadow-button-hover hover:-translate-y-[1.5px] border border-blue-500/20 hover:border-blue-400/30 ring-1 ring-white/10 ring-inset',
  secondary:
    'bg-white/80 backdrop-blur-sm text-text-primary border border-border hover:bg-white hover:border-blue-200 hover:text-blue-600 hover:shadow-md shadow-sm hover:-translate-y-[1.5px]',
  danger: 'bg-danger/90 hover:bg-danger text-white shadow-sm hover:shadow-md border border-red-500/20 ring-1 ring-white/10 ring-inset hover:-translate-y-[1.5px]',
  ghost:
    'bg-transparent text-text-secondary border border-transparent hover:bg-gray-100/80 hover:text-text-primary hover:shadow-sm hover:-translate-y-0.5',
};

const sizes = {
  sm: 'h-8 px-4 text-[13px] rounded-[10px]',
  md: 'h-11 px-6 text-[15px] rounded-[14px]',
  lg: 'h-12 px-8 text-base rounded-[16px]',
};

function Spinner() {
  return (
    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
  );
}

const Button = React.forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, children, className = '', ...props },
  ref
) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  return (
    <button ref={ref} type="button" className={cls} disabled={loading || props.disabled} {...props}>
      {loading && <Spinner />}
      {children}
    </button>
  );
});

export default Button;


