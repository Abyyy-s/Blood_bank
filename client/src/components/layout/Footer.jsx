import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, PhoneCall, ShieldAlert, Activity, Droplet, Clock, CheckCircle2, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl text-slate-400 overflow-hidden">
      {/* Subtle Glow Backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-red-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Emergency Hotline Banner */}
      <div className="border-b border-slate-800/60 bg-red-950/20 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-red-300 font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-bold uppercase tracking-wider text-red-400">24/7 Emergency Dispatch</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-300">Direct hospital and patient life-critical coordination hotline</span>
          </div>
          <a
            href="tel:18005433546"
            className="flex items-center gap-1.5 font-mono font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>1-800-LIFELINK (543-3546)</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-red-600/30">
                <Heart className="w-4 h-4 fill-white/20" />
              </div>
              <span className="font-heading font-extrabold text-lg text-white tracking-tight">
                Life Link
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              A high-precision real-time operational platform connecting voluntary donors, clinical screenings, blood banks, and critical hospital triage.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Network Operations Live (99.99%)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-slate-200">
              Operations & Triage
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/donors" className="hover:text-red-400 transition-colors flex items-center gap-1.5">
                  <span>Donor Directory</span>
                </Link>
              </li>
              <li>
                <Link to="/requests" className="hover:text-red-400 transition-colors flex items-center gap-1.5">
                  <span>Blood Request Queue</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-red-400 transition-colors flex items-center gap-1.5">
                  <span>Live Blood Stock</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-red-400 transition-colors flex items-center gap-1.5">
                  <span>Staff & Hospital Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Compatibility Quick Reference */}
          <div className="space-y-3">
            <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-slate-200">
              Universal Donors
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-bold text-red-400 flex items-center justify-between">
                  <span>O- (Universal Red Cells)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">All groups</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Can give red blood cells to any patient. Critical in emergency triage.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-bold text-violet-400 flex items-center justify-between">
                  <span>AB+ (Universal Recipient)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">All groups</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Can receive red blood cells from all 8 blood groups safely.
                </p>
              </div>
            </div>
          </div>

          {/* Standards & Compliance */}
          <div className="space-y-3">
            <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-slate-200">
              Clinical Integrity
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Strict cold chain temperature telemetry monitoring</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Pre-donation health screening & hemoglobin compliance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Component separation tracking (RBC, Platelets, Plasma)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Life Link Blood Bank Operations Network. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400">Clinical Safety Guidelines</span>
            <span>•</span>
            <span className="hover:text-slate-400">Donor Privacy Protocol</span>
            <span>•</span>
            <span className="hover:text-slate-400">Hospital SLA Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
