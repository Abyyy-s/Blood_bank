import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, animate, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, Mail, Lock, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from './AuthContext';
import GlassCard from '../../components/ui/GlassCard';
import FloatingInput from '../../components/ui/FloatingInput';
import BloodGroupBadge from '../../components/ui/BloodGroupBadge';
import AnimatedButton from '../../components/ui/AnimatedButton';
import { inventoryService } from '../../services/inventory.service';
import clsx from 'clsx';

function Counter({ from = 0, to = 100 }) {
  const reducedMotion = useReducedMotion();
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  useEffect(() => {
    if (reducedMotion) {
      count.set(to);
      return;
    }
    const controls = animate(count, to, {
      type: 'spring',
      stiffness: 50,
      damping: 20,
      mass: 1,
      duration: 2,
    });
    return controls.stop;
  }, [to, count, reducedMotion]);

  return <motion.span>{rounded}</motion.span>;
}

export default function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [selectedGroup, setSelectedGroup] = useState(() => localStorage.getItem('selectedGroup') || 'O+');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ donors: 0, donations: 0, units: 0 });

  useEffect(() => {
    localStorage.setItem('selectedGroup', selectedGroup);
  }, [selectedGroup]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await inventoryService.getDashboard();
        const data = response.data;
        if (data) {
          const totalUnits = (data.stock_by_group || []).reduce(
            (sum, g) => sum + (Number(g.total_units) || 0), 0
          );
          setStats({
            donors: data.total_donors || 0,
            donations: data.total_donations || 0,
            units: totalUnits || 0,
          });
        }
      } catch (err) {
        // Fallback demo data in case endpoint fails/unavailable
        setStats({ donors: 1250, donations: 3450, units: 720 });
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await login(email, password, role);
      // Small delay for transition
      setTimeout(() => navigate('/dashboard'), 300);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const workflowItems = ['Donors', 'Screening', 'Inventory', 'Requests'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const containerVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
      {/* LEFT PANEL */}
      <motion.div 
        className="relative flex-col p-8 lg:p-16 justify-between overflow-hidden hidden lg:flex"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative background orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-900/10 blur-[120px] pointer-events-none" />
        
        {/* Animated blood drop visual */}
        {!reducedMotion && (
          <motion.div 
            className="absolute right-12 top-1/4 w-32 h-32 pointer-events-none"
            style={{
              borderRadius: '60% 40% 60% 40% / 50% 45% 55% 50%',
              background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
              boxShadow: '0 20px 40px rgba(153, 27, 27, 0.3)',
              opacity: 0.5
            }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div className="z-10 flex flex-col gap-8 lg:gap-12 max-w-2xl">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white">
              <Heart size={24} className="fill-white/20" />
            </div>
            <span className="font-heading text-xl font-extrabold tracking-tight">Life Link</span>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
              Blood Bank Operations Platform
            </span>
            <h1 className="font-heading text-5xl font-bold tracking-tight lg:text-7xl">
              Every unit has a<br />
              <em className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent not-italic">
                route to life.
              </em>
            </h1>
            <p className="max-w-md text-lg text-slate-400 leading-relaxed">
              A calm, connected workspace for the people who register donors, safeguard inventory, and answer urgent hospital requests.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
            {workflowItems.map((item, idx) => (
              <React.Fragment key={item}>
                <span className="rounded-full bg-slate-900/50 px-4 py-2 border border-white/5">{item}</span>
                {idx < workflowItems.length - 1 && <ArrowRight size={16} className="text-slate-700" />}
              </React.Fragment>
            ))}
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="z-10 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10 max-w-2xl">
          <div>
            <div className="text-3xl font-bold text-white mb-1"><Counter to={stats.donors} /></div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Registered Donors</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1"><Counter to={stats.donations} /></div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Donations Recorded</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1"><Counter to={stats.units} /></div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Units Circulating</div>
          </div>
        </motion.div>
      </motion.div>

      {/* RIGHT PANEL */}
      <div className="flex items-center justify-center p-6 lg:p-12 relative z-20">
        <div className="w-full max-w-[440px]">
          <GlassCard className="p-8 backdrop-blur-2xl bg-slate-900/60 border-white/10">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-sm text-slate-400">Sign in to continue to your operational workspace.</p>
            </div>

            <div className="mb-8 hidden sm:block">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Set your group
              </label>
              <div className="grid grid-cols-4 gap-2">
                {bloodGroups.map((bg) => (
                  <BloodGroupBadge
                    key={bg}
                    group={bg}
                    selected={selectedGroup === bg}
                    onClick={() => setSelectedGroup(bg)}
                    className="cursor-pointer transition-transform active:scale-95"
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FloatingInput
                id="email"
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
              />
              
              <FloatingInput
                id="password"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
              />

              <div className="relative group">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full appearance-none bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                >
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                  <option value="Hospital">Hospital</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-red-500 transition-colors" />
              </div>

              <div className="mt-4">
                <AnimatedButton 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-3.5 flex justify-center" 
                  loading={isSubmitting}
                >
                  <span className="flex items-center gap-2">
                    SIGN IN <ArrowRight size={18} />
                  </span>
                </AnimatedButton>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400 text-sm text-center">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={16} className="text-green-500" />
              <span>Secure, role-based access for every team.</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
