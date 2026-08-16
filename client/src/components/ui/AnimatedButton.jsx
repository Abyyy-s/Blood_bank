import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const AnimatedButton = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className,
  ...rest
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#dc2626] disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  const variants = {
    primary: 'bg-gradient-to-r from-[#dc2626] to-[#991b1b] text-white hover:from-[#b91c1c] hover:to-[#7f1d1d] shadow-md',
    secondary: 'bg-[var(--color-glass-bg,rgba(15,23,42,0.65))] border border-[var(--color-glass-border,rgba(255,255,255,0.08))] text-slate-100 hover:bg-slate-800/50',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md',
    ghost: 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50',
  };

  return (
    <motion.button
      className={clsx(
        baseStyles,
        sizes[size],
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
