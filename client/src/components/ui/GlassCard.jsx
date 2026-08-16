import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const GlassCard = ({
  children,
  className,
  variant = 'default',
  hover = true,
  as = 'div',
  ...rest
}) => {
  const Component = motion[as] || motion.div;

  const baseStyles = 'backdrop-blur-xl rounded-xl border transition-all duration-300';
  
  const variants = {
    default: 'bg-[var(--color-glass-bg,rgba(15,23,42,0.65))] border-[var(--color-glass-border,rgba(255,255,255,0.08))]',
    elevated: 'bg-[var(--color-elevated,rgba(30,41,59,0.8))] border-[var(--color-glass-border,rgba(255,255,255,0.08))] shadow-lg',
    crimson: 'bg-[var(--color-glass-bg,rgba(15,23,42,0.65))] border-[#dc2626] shadow-[0_0_15px_rgba(220,38,38,0.1)] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]',
  };

  const hoverProps = hover
    ? {
        whileHover: { 
          y: -2,
          transition: { duration: 0.2, ease: "easeOut" }
        }
      }
    : {};

  return (
    <Component
      className={clsx(
        baseStyles,
        variants[variant],
        hover && 'hover:border-white/20 hover:shadow-xl',
        className
      )}
      {...hoverProps}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default GlassCard;
