import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, Truck, Hospital, CheckCheck, XCircle, ArrowRight } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import BloodGroupBadge from '../../components/ui/BloodGroupBadge';
import clsx from 'clsx';

export default function FulfillmentTracker({ request }) {
  if (!request) return null;

  const isRejected = request.status === 'Rejected' || request.status === 'Cancelled';
  const isFulfilled = request.status === 'Fulfilled';
  const isApproved = request.status === 'Approved';
  const isPending = request.status === 'Pending';

  const steps = [
    {
      id: 'step-1',
      title: 'Emergency Request Logged',
      desc: `Submitted on ${request.request_date ? new Date(request.request_date).toLocaleDateString('en-IN') : 'Today'}`,
      icon: Clock,
      completed: true,
      active: isPending,
    },
    {
      id: 'step-2',
      title: 'Clinical Triage & Cross-match',
      desc: 'Blood bank verified compatibility & cold inventory',
      icon: CheckCircle2,
      completed: isApproved || isFulfilled,
      active: isApproved,
    },
    {
      id: 'step-3',
      title: 'Inventory Unit Allocation',
      desc: `${request.quantity_units} unit(s) of ${request.blood_group} ${request.component_type || 'Whole Blood'} deducted from bank`,
      icon: Truck,
      completed: isFulfilled,
      active: false,
    },
    {
      id: 'step-4',
      title: 'Hospital Receipt & Fulfilled',
      desc: `${request.hospital_name || 'Hospital'} patient transfusion ready`,
      icon: CheckCheck,
      completed: isFulfilled,
      active: isFulfilled,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Request Header Summary */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BloodGroupBadge group={request.blood_group} size="lg" className="shadow-lg shadow-red-950" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-red-400">Request #{request.request_id}</span>
              <StatusBadge status={request.urgency_level} type="urgency" size="sm" />
            </div>
            <h3 className="font-heading font-bold text-base text-white">
              {request.hospital_name}
            </h3>
            <p className="text-xs text-slate-400">
              {request.quantity_units} unit(s) of {request.component_type || 'Whole Blood'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Current Status</span>
          <StatusBadge status={request.status} type="status" size="md" className="mt-1" />
        </div>
      </div>

      {/* Stepper Timeline */}
      {isRejected ? (
        <div className="p-6 rounded-2xl bg-red-950/40 border border-red-900/50 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-heading font-bold text-sm text-red-300">Request Closed: {request.status}</h4>
            <p className="text-xs text-red-400/90 mt-1 leading-relaxed">
              This request was {request.status.toLowerCase()} by clinical triage staff due to stock unavailability or cancellation.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[15px] sm:before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative flex items-start gap-4">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full border flex items-center justify-center shrink-0 -ml-[23px] sm:-ml-[27px] z-10 transition-colors',
                    step.completed
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-950'
                      : step.active
                      ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-md shadow-red-950'
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className={clsx('font-heading font-bold text-sm', step.completed || step.active ? 'text-white' : 'text-slate-500')}>
                      {step.title}
                    </h5>
                    {step.active && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 uppercase">
                        Current Step
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
