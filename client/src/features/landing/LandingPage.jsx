import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';
import {
  Heart,
  Droplet,
  Users,
  Building2,
  ArrowRight,
  ShieldCheck,
  Activity,
  Sparkles,
  ClipboardList,
  Syringe,
  Boxes,
  Truck,
  PhoneCall,
  Clock
} from 'lucide-react';
import { inventoryService } from '../../services/inventory.service';
import CompatibilityMatrix from './CompatibilityMatrix';
import UrgentRequestsTicker from './UrgentRequestsTicker';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedButton from '../../components/ui/AnimatedButton';

function SpringCounter({ from = 0, to = 100 }) {
  const reducedMotion = useReducedMotion();
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString('en-IN'));

  useEffect(() => {
    if (reducedMotion) {
      count.set(to);
      return;
    }
    const controls = animate(count, to, {
      type: 'spring',
      stiffness: 45,
      damping: 18,
      duration: 2.2,
    });
    return controls.stop;
  }, [to, count, reducedMotion]);

  return <motion.span>{rounded}</motion.span>;
}

export default function LandingPage() {
  const [stats, setStats] = useState({
    donors: 1420,
    donations: 4380,
    units: 865,
    pending: 3,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await inventoryService.getDashboard();
        const data = response.data;
        if (data) {
          const totalUnits = (data.stock_by_group || []).reduce(
            (sum, g) => sum + (Number(g.total_units) || 0),
            0
          );
          setStats({
            donors: data.total_donors || 1420,
            donations: data.total_donations || 4380,
            units: totalUnits || 865,
            pending: data.pending_requests || 3,
          });
        }
      } catch (e) {
        // Keep fallback stats
      }
    };
    loadStats();
  }, []);

  const workflowSteps = [
    {
      step: '01',
      icon: Users,
      title: 'Donor Registration',
      description: 'Voluntary donors register securely with blood group, location, and verified contact numbers.',
    },
    {
      step: '02',
      icon: Syringe,
      title: 'Clinical Screening',
      description: 'Hemoglobin, blood pressure, and medical history validation before every donation event.',
    },
    {
      step: '03',
      icon: Boxes,
      title: 'Cold Storage Vault',
      description: 'Real-time temperature and component shelf-life telemetry (RBC, Platelets, Plasma).',
    },
    {
      step: '04',
      icon: Truck,
      title: 'Hospital Emergency Triage',
      description: 'Direct dispatch to verified hospital emergency rooms with sub-minute allocation.',
    },
  ];

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-6 sm:pt-12 overflow-hidden">
        {/* Glowing Ruby/Crimson Ambient Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[500px] bg-gradient-to-br from-red-600/20 via-red-900/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/2 right-10 w-[350px] h-[350px] bg-red-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Live Operational Status Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass bg-slate-900/80 border-red-500/30 text-xs font-semibold text-red-300 shadow-lg shadow-red-950/40"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>Next-Gen Blood Supply & Triage Network</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
            >
              Every Drop Counts.{' '}
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-rose-600 bg-clip-text text-transparent">
                Every Second Matters.
              </span>
            </motion.h1>

            {/* Subheadline Copy */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
            >
              Life Link bridges voluntary blood donors, cold-chain inventory vaults, and hospital emergency triage into a unified, high-speed clinical workspace.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 pt-2"
            >
              <Link to="/donors">
                <AnimatedButton variant="primary" size="lg" className="shadow-xl shadow-red-950/60 font-bold px-8">
                  <span>Find Available Donors</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </AnimatedButton>
              </Link>

              <Link to="/requests">
                <AnimatedButton variant="secondary" size="lg" className="font-bold px-7">
                  <ClipboardList className="w-4 h-4 mr-1.5 text-red-400" />
                  <span>Request Blood Units</span>
                </AnimatedButton>
              </Link>
            </motion.div>
          </div>

          {/* ─── LIVE IMPACT METRIC CARDS ─── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 sm:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            <GlassCard className="p-6 bg-slate-900/70 border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Registered Donors</span>
                <Users className="w-4 h-4 text-red-400" />
              </div>
              <div className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
                <SpringCounter to={stats.donors} />
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Voluntary verified donors</p>
            </GlassCard>

            <GlassCard className="p-6 bg-slate-900/70 border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Donations Recorded</span>
                <Droplet className="w-4 h-4 text-rose-400" />
              </div>
              <div className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
                <SpringCounter to={stats.donations} />
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Successful donations logged</p>
            </GlassCard>

            <GlassCard className="p-6 bg-slate-900/70 border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Units in Stock</span>
                <Boxes className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
                <SpringCounter to={stats.units} />
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Live inventory across banks</p>
            </GlassCard>

            <GlassCard className="p-6 bg-slate-900/70 border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Triage</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-heading font-extrabold text-3xl sm:text-4xl text-amber-400">
                <SpringCounter to={stats.pending} />
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Active hospital requests</p>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ─── URGENT BLOOD REQUESTS TICKER ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <UrgentRequestsTicker />
      </section>

      {/* ─── INTERACTIVE BLOOD COMPATIBILITY MATRIX ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-800/40 text-xs font-bold text-red-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Clinical Tool</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Blood Compatibility Matrix
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Antigen and antibody match dynamics decide life-saving transfusions. Click any group to dynamically simulate safe donor-to-recipient paths.
          </p>
        </div>

        <CompatibilityMatrix />
      </section>

      {/* ─── 4-STEP WORKFLOW ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The Safe Lifeline Journey
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Every blood unit passes through strict clinical checks, cold-storage integrity, and precision dispatch protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <GlassCard
                key={step.step}
                className="p-6 bg-slate-900/80 border-slate-800 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-2xl text-red-500/40">
                      {step.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Clinical Standard Verified</span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* ─── CALL TO ACTION BANNER ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-red-500/30 bg-gradient-to-br from-red-950/70 via-slate-950/90 to-slate-900/80 backdrop-blur-2xl">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-red-600/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to help save a life today?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Join thousands of voluntary donors or connect your medical institution to the Life Link real-time emergency dispatch network.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/donors">
                <AnimatedButton variant="primary" size="lg" className="font-bold px-8 shadow-xl shadow-red-950">
                  <span>Register as Voluntary Donor</span>
                </AnimatedButton>
              </Link>
              <Link to="/requests">
                <AnimatedButton variant="secondary" size="lg" className="font-bold px-6">
                  <span>Submit Hospital Request</span>
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
