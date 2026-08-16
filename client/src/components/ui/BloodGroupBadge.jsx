import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const colors = {
  'A+': { bg: 'bg-rose-500/20', border: 'border-rose-500/30', text: 'text-rose-500', fill: 'bg-rose-500', shadow: 'shadow-rose-500/30' },
  'A-': { bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-500', fill: 'bg-pink-500', shadow: 'shadow-pink-500/30' },
  'B+': { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-500', fill: 'bg-orange-500', shadow: 'shadow-orange-500/30' },
  'B-': { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-500', fill: 'bg-amber-500', shadow: 'shadow-amber-500/30' },
  'AB+': { bg: 'bg-violet-500/20', border: 'border-violet-500/30', text: 'text-violet-500', fill: 'bg-violet-500', shadow: 'shadow-violet-500/30' },
  'AB-': { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-500', fill: 'bg-purple-500', shadow: 'shadow-purple-500/30' },
  'O+': { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-500', fill: 'bg-emerald-500', shadow: 'shadow-emerald-500/30' },
  'O-': { bg: 'bg-teal-500/20', border: 'border-teal-500/30', text: 'text-teal-500', fill: 'bg-teal-500', shadow: 'shadow-teal-500/30' },
};

const BloodGroupBadge = ({
  group,
  selected = false,
  selectable = false,
  onClick,
  size = 'md',
  className
}) => {
  const Component = selectable ? motion.button : motion.span;
  const color = colors[group] || colors['O+'];

  const sizes = {
    sm: 'w-8 h-8 text-xs font-bold',
    md: 'w-10 h-10 text-sm font-bold',
    lg: 'w-12 h-12 text-base font-extrabold',
  };

  const interactiveProps = selectable ? {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    onClick: onClick
  } : {};

  return (
    <Component
      layout
      className={clsx(
        'inline-flex items-center justify-center rounded-full border transition-colors',
        sizes[size],
        selected 
          ? `${color.fill} text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] ${color.shadow}` 
          : `bg-[#0f172a] ${color.border} ${color.text}`,
        selectable && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500 focus-visible:ring-offset-[#020617]',
        className
      )}
      animate={selected ? { scale: 1.05 } : { scale: 1 }}
      {...interactiveProps}
    >
      {group}
    </Component>
  );
};

export default BloodGroupBadge;
