import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Clock, CheckCheck, X, Check, Zap, ArrowUp, Minus, ArrowDown } from 'lucide-react';

const StatusBadge = ({
  status,
  type = 'status',
  size = 'sm',
  className
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5'
  };
  
  const iconSize = size === 'sm' ? 14 : 16;

  let config = {};

  if (type === 'status') {
    switch (status.toLowerCase()) {
      case 'pending':
        config = { bg: 'bg-amber-500/20', text: 'text-amber-500', border: 'border-amber-500/30', Icon: Clock };
        break;
      case 'fulfilled':
        config = { bg: 'bg-green-500/20', text: 'text-green-500', border: 'border-green-500/30', Icon: CheckCheck };
        break;
      case 'rejected':
        config = { bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500/30', Icon: X };
        break;
      case 'approved':
        config = { bg: 'bg-blue-500/20', text: 'text-blue-500', border: 'border-blue-500/30', Icon: Check };
        break;
      default:
        config = { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', Icon: Minus };
    }
  } else if (type === 'urgency') {
    switch (status.toLowerCase()) {
      case 'critical':
        config = { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600', Icon: Zap, pulse: true };
        break;
      case 'high':
        config = { bg: 'bg-amber-500/20', text: 'text-amber-500', border: 'border-amber-500/30', Icon: ArrowUp };
        break;
      case 'medium':
        config = { bg: 'bg-blue-500/20', text: 'text-blue-500', border: 'border-blue-500/30', Icon: Minus };
        break;
      case 'low':
        config = { bg: 'bg-green-500/20', text: 'text-green-500', border: 'border-green-500/30', Icon: ArrowDown };
        break;
      default:
        config = { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', Icon: Minus };
    }
  }

  const { bg, text, border, Icon, pulse } = config;

  return (
    <motion.span
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-full border',
        bg, text, border, sizeClasses[size], className
      )}
      animate={pulse ? { opacity: [1, 0.7, 1] } : {}}
      transition={pulse ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {Icon && <Icon size={iconSize} />}
      <span className="capitalize">{status}</span>
    </motion.span>
  );
};

export default StatusBadge;
