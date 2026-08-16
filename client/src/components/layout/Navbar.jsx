import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, Shield, User, LogOut, ArrowRight, Activity, Droplets, Users, ClipboardList } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../ui/Toast';
import clsx from 'clsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Heart },
    { name: 'Find Donors', path: '/donors', icon: Users },
    { name: 'Blood Requests', path: '/requests', icon: ClipboardList },
    { name: 'Operations', path: '/dashboard', icon: Activity },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast('Signed out successfully', 'info');
      navigate('/');
    } catch (e) {
      toast('Failed to sign out', 'error');
    }
  };

  return (
    <>
      <header
        className={clsx(
          'fixed top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-40 max-w-7xl mx-auto transition-all duration-300',
          scrolled ? 'shadow-2xl shadow-black/60' : 'shadow-lg shadow-black/20'
        )}
      >
        <div className="glass rounded-2xl px-4 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between border border-white/10 backdrop-blur-2xl bg-slate-950/70">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-lg text-white tracking-tight leading-none group-hover:text-red-400 transition-colors">
                Life Link
              </span>
              <span className="text-[10px] font-semibold text-red-400/90 tracking-widest uppercase mt-0.5">
                Blood Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-white/5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={clsx(
                    'relative px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-600/30 to-red-900/30 border border-red-500/40"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={clsx('w-4 h-4 relative z-10', isActive ? 'text-red-400' : 'text-slate-500')} />
                  <span className="relative z-10">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Auth / User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 px-3 py-1.5 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 text-xs font-bold">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-200 leading-tight max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-red-400">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 shadow-md shadow-red-900/30 transition-all active:scale-95 cursor-pointer"
              >
                <span>Portal Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 border border-white/10"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-3 top-20 z-30 md:hidden rounded-2xl glass bg-slate-950/95 border border-white/10 p-5 shadow-2xl backdrop-blur-2xl"
          >
            <nav className="flex flex-col gap-2 mb-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-red-600/20 text-red-300 border border-red-500/30 font-semibold'
                        : 'text-slate-300 hover:bg-slate-900/60'
                    )}
                  >
                    <Icon className={clsx('w-5 h-5', isActive ? 'text-red-400' : 'text-slate-400')} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              {user ? (
                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{user.name}</div>
                      <div className="text-xs text-red-400 font-medium">{user.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-800 shadow-lg shadow-red-900/40"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In to Workspace</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
