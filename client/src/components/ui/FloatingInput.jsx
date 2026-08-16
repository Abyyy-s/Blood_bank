import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

const FloatingInput = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  icon: Icon,
  id,
  name,
  required,
  className,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const hasValue = value !== undefined && value !== null && value.toString().length > 0;
  const active = isFocused || hasValue;

  return (
    <div className={clsx("relative w-full", className)}>
      <div 
        className={clsx(
          "relative flex items-center bg-[var(--color-surface,#0f172a)] rounded-lg border transition-colors duration-200",
          error 
            ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
            : isFocused 
              ? "border-[#dc2626] shadow-[0_0_10px_rgba(220,38,38,0.2)]" 
              : "border-slate-800 hover:border-slate-700"
        )}
      >
        {Icon && (
          <div className="pl-3 pr-2 text-slate-500">
            <Icon size={18} />
          </div>
        )}
        
        <div className="relative flex-1 flex flex-col justify-center">
          <motion.label
            htmlFor={id}
            className={clsx(
              "absolute left-0 pointer-events-none text-slate-400 origin-left",
              !Icon && "pl-3"
            )}
            initial={false}
            animate={{
              y: active ? -16 : 0,
              scale: active ? 0.85 : 1,
              color: error ? '#ef4444' : isFocused ? '#dc2626' : '#94a3b8'
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {label} {required && <span className="text-red-500">*</span>}
          </motion.label>
          
          <input
            id={id}
            name={name}
            type={inputType}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required={required}
            className={clsx(
              "w-full bg-transparent border-none outline-none text-slate-100 pt-5 pb-2",
              !Icon && "pl-3",
              isPassword && "pr-10"
            )}
            {...rest}
          />
        </div>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-slate-500 hover:text-slate-300 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-red-500 text-xs mt-1 pl-1"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingInput;
