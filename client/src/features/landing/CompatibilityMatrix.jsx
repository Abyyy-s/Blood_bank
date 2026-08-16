import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, ArrowRight, ShieldCheck, Sparkles, HelpCircle, HeartHandshake, CheckCircle2, XCircle } from 'lucide-react';
import BloodGroupBadge from '../../components/ui/BloodGroupBadge';
import GlassCard from '../../components/ui/GlassCard';
import clsx from 'clsx';

// Standard RBC compatibility data
const COMPATIBILITY_RULES = {
  'O-': {
    canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-'],
    title: 'Universal Red Cell Donor',
    description: 'Contains no A, B, or Rh antigens. Can be safely transfused into any patient in emergency trauma situations.',
    rarity: '7% of population',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  },
  'O+': {
    canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O+', 'O-'],
    title: 'High-Demand Positive Donor',
    description: 'Most common blood group. Vital for routine surgeries, trauma care, and emergency inventory reserves.',
    rarity: '37% of population',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  },
  'A-': {
    canDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['A-', 'O-'],
    title: 'Targeted Negative Donor',
    description: 'Crucial for A- and AB- patients, and safe for positive counterparts.',
    rarity: '6% of population',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
  },
  'A+': {
    canDonateTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    title: 'Common Platelet & Red Cell Type',
    description: 'Second most common group. High demand for both red blood cells and therapeutic platelets.',
    rarity: '34% of population',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
  },
  'B-': {
    canDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['B-', 'O-'],
    title: 'Rare Negative Group',
    description: 'Hard to maintain in hospital stocks. Regular voluntary donations are essential.',
    rarity: '2% of population',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  },
  'B+': {
    canDonateTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    title: 'Key Positive Group',
    description: 'Frequently needed in clinical interventions, thalassemia support, and oncology care.',
    rarity: '9% of population',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  },
  'AB-': {
    canDonateTo: ['AB-', 'AB+'],
    canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    title: 'Universal Plasma Donor & Rare Red Cells',
    description: 'The rarest blood group. AB plasma contains no antibodies and is universally safe.',
    rarity: '1% of population',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
  },
  'AB+': {
    canDonateTo: ['AB+'],
    canReceiveFrom: ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
    title: 'Universal Red Cell Recipient',
    description: 'Can receive red blood cells from every single blood type without antigen rejection.',
    rarity: '4% of population',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
  },
};

const ALL_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export default function CompatibilityMatrix() {
  const [selectedGroup, setSelectedGroup] = useState('O-');
  const [mode, setMode] = useState('canDonateTo'); // 'canDonateTo' | 'canReceiveFrom'

  const currentRule = COMPATIBILITY_RULES[selectedGroup];
  const compatibleList = currentRule[mode];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Interactive Selection Panel */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="p-6 sm:p-8 bg-slate-900/80 border-slate-800">
            <div className="flex items-center justify-between gap-4 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 fill-red-500" />
                Select Blood Group
              </span>
              <span className="text-xs text-slate-500">Click to inspect</span>
            </div>

            {/* 8 Blood Group Selector Pills */}
            <div className="grid grid-cols-4 gap-3 mb-8">
              {ALL_GROUPS.map((group) => (
                <BloodGroupBadge
                  key={group}
                  group={group}
                  selected={selectedGroup === group}
                  selectable={true}
                  size="lg"
                  onClick={() => setSelectedGroup(group)}
                  className="w-full py-3 h-auto text-base rounded-2xl cursor-pointer"
                />
              ))}
            </div>

            {/* Mode Switcher: Can Give To vs Can Receive From */}
            <div className="space-y-3 pt-6 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Triage Perspective
              </label>
              <div className="grid grid-cols-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setMode('canDonateTo')}
                  className={clsx(
                    'py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                    mode === 'canDonateTo'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Can Give To</span>
                </button>
                <button
                  onClick={() => setMode('canReceiveFrom')}
                  className={clsx(
                    'py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                    mode === 'canReceiveFrom'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  <Droplet className="w-3.5 h-3.5" />
                  <span>Can Receive From</span>
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Dynamic Compatibility Result Display */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedGroup}-${mode}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Dynamic Overview Card */}
              <GlassCard className="p-6 sm:p-8 bg-slate-900/90 border-slate-800 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-extrabold text-2xl font-heading shadow-lg shadow-red-600/20">
                      {selectedGroup}
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-white">
                        {currentRule.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full border', currentRule.badgeColor)}>
                          {currentRule.rarity}
                        </span>
                        <span className="text-xs text-slate-400">
                          {mode === 'canDonateTo' ? 'Donor Capability' : 'Recipient Safety'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compatibility Grid */}
                <div className="py-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-300">
                      {mode === 'canDonateTo'
                        ? `Patients with these groups can receive ${selectedGroup}:`
                        : `Patients with ${selectedGroup} can receive blood from:`}
                    </span>
                    <span className="text-xs font-bold text-red-400">
                      {compatibleList.length} of 8 Compatible
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                    {ALL_GROUPS.map((group) => {
                      const isCompatible = compatibleList.includes(group);
                      return (
                        <motion.div
                          key={group}
                          layout
                          className={clsx(
                            'p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center',
                            isCompatible
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-950/50'
                              : 'bg-slate-950/60 border-slate-800/80 text-slate-600 opacity-40'
                          )}
                        >
                          <span className="font-heading font-extrabold text-sm">
                            {group}
                          </span>
                          {isCompatible ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-slate-700" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Biological & Clinical Detail */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Clinical Note:</strong>
                    {currentRule.description}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
