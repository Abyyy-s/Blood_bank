import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hospital,
  Droplet,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Boxes,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import BloodGroupBadge from '../../components/ui/BloodGroupBadge';
import AnimatedButton from '../../components/ui/AnimatedButton';
import { hospitalService } from '../../services/hospital.service';
import { requestService } from '../../services/request.service';
import { inventoryService } from '../../services/inventory.service';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/Toast';
import clsx from 'clsx';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = ['Whole Blood', 'RBC', 'Platelets', 'Plasma'];
const URGENCIES = [
  { level: 'Critical', desc: 'Immediate trauma / life threat (Emergency dispatch within 15 mins)', color: 'border-red-500 bg-red-950/40 text-red-300' },
  { level: 'High', desc: 'Scheduled urgent surgery or critical ICU support within 2-4 hours', color: 'border-amber-500 bg-amber-950/40 text-amber-300' },
  { level: 'Medium', desc: 'Elective medical transfusion or ward preparation within 24 hours', color: 'border-blue-500 bg-blue-950/40 text-blue-300' },
  { level: 'Low', desc: 'Standard reserve replenishment or scheduled non-critical patient care', color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300' },
];

export default function MultiStepRequestModal({ isOpen, onClose, onRequestCreated }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stockInfo, setStockInfo] = useState(null);

  const [formData, setFormData] = useState({
    hospital_id: '',
    blood_group: 'O+',
    component_type: 'Whole Blood',
    quantity_units: 2,
    urgency_level: 'Critical',
  });

  // Fetch hospitals on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError('');
      hospitalService
        .getAll()
        .then((res) => {
          const list = res.data || [];
          setHospitals(list);
          if (user?.role === 'Hospital' && user?.hospital_id) {
            setFormData((prev) => ({ ...prev, hospital_id: user.hospital_id }));
          } else if (list.length > 0) {
            setFormData((prev) => ({ ...prev, hospital_id: list[0].hospital_id }));
          }
        })
        .catch(() => {
          setHospitals([
            { hospital_id: 1, hospital_name: 'City General Hospital', location: 'Central District' },
            { hospital_id: 2, hospital_name: 'St. Mary Medical Center', location: 'West Side' },
            { hospital_id: 3, hospital_name: 'Regional Emergency Hospital', location: 'South District' },
          ]);
        });
    }
  }, [isOpen, user]);

  // Check live stock when moving to review step
  useEffect(() => {
    if (step === 4) {
      inventoryService
        .getStock({ blood_group: formData.blood_group, component_type: formData.component_type })
        .then((res) => {
          const items = res.data || [];
          const totalAvailable = items.reduce((sum, item) => sum + (Number(item.quantity_units) || 0), 0);
          setStockInfo(totalAvailable);
        })
        .catch(() => setStockInfo(null));
    }
  }, [step, formData.blood_group, formData.component_type]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.hospital_id) {
      setError('Please select the receiving hospital.');
      return;
    }
    if (step === 2 && (!formData.blood_group || formData.quantity_units < 1)) {
      setError('Please specify valid blood group and units.');
      return;
    }
    setError('');
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        hospital_id: parseInt(formData.hospital_id, 10),
        blood_group: formData.blood_group,
        component_type: formData.component_type,
        quantity_units: parseInt(formData.quantity_units, 10),
        urgency_level: formData.urgency_level,
      };

      const res = await requestService.create(payload);
      const data = res.data;

      if (data?.warning) {
        toast(`⚠ Request Submitted with Note: ${data.warning}`, 'warning');
      } else {
        toast('🩸 Blood request submitted successfully to clinical dispatch!', 'success');
      }

      onRequestCreated?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit blood request. Please verify inputs.');
    } finally {
      setLoading(false);
    }
  };

  const selectedHospital = hospitals.find((h) => String(h.hospital_id) === String(formData.hospital_id));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Emergency Blood Request"
      subtitle={`Step ${step} of 4 — ${
        step === 1
          ? 'Hospital Destination'
          : step === 2
          ? 'Blood Group & Units'
          : step === 3
          ? 'Triage Urgency Level'
          : 'Review & Live Stock Verification'
      }`}
      size="lg"
    >
      {/* Progress Stepper Pills */}
      <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={clsx(
              'flex-1 h-1.5 rounded-full transition-all',
              s <= step ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-slate-800'
            )}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-900/60 text-red-400 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── STEP 1: HOSPITAL ─── */}
      {step === 1 && (
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Select Destination Hospital <span className="text-red-500">*</span>
          </label>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {hospitals.map((hosp) => {
              const isSelected = String(formData.hospital_id) === String(hosp.hospital_id);
              return (
                <div
                  key={hosp.hospital_id}
                  onClick={() => handleChange('hospital_id', hosp.hospital_id)}
                  className={clsx(
                    'p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all',
                    isSelected
                      ? 'bg-red-950/30 border-red-500/50 shadow-md shadow-red-950'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400">
                      <Hospital className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-sm text-white">{hosp.hospital_name}</div>
                      <div className="text-xs text-slate-400">{hosp.location || 'Central Location'}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── STEP 2: BLOOD GROUP & COMPONENT & UNITS ─── */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Blood Group Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Required Blood Group <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {BLOOD_GROUPS.map((bg) => (
                <BloodGroupBadge
                  key={bg}
                  group={bg}
                  selected={formData.blood_group === bg}
                  selectable={true}
                  size="md"
                  onClick={() => handleChange('blood_group', bg)}
                  className="w-full py-2.5 h-auto cursor-pointer"
                />
              ))}
            </div>
          </div>

          {/* Component Type & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Component Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COMPONENTS.map((comp) => (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => handleChange('component_type', comp)}
                    className={clsx(
                      'py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                      formData.component_type === comp
                        ? 'bg-red-600/20 border-red-500 text-red-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    )}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Quantity in Units (Pints) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.quantity_units}
                  onChange={(e) => handleChange('quantity_units', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-red-500"
                />
                <span className="text-xs font-semibold text-slate-400 shrink-0">Units (350ml ea.)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 3: URGENCY LEVEL ─── */}
      {step === 3 && (
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Clinical Urgency Triage <span className="text-red-500">*</span>
          </label>

          <div className="space-y-2.5">
            {URGENCIES.map((urg) => {
              const isSelected = formData.urgency_level === urg.level;
              return (
                <div
                  key={urg.level}
                  onClick={() => handleChange('urgency_level', urg.level)}
                  className={clsx(
                    'p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all',
                    isSelected
                      ? `${urg.color} shadow-lg`
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  )}
                >
                  <div className="mt-0.5">
                    {urg.level === 'Critical' ? (
                      <Zap className="w-5 h-5 text-red-400 animate-bounce" />
                    ) : urg.level === 'High' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-white flex items-center gap-2">
                      <span>{urg.level} Priority</span>
                      {isSelected && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/10">Selected</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{urg.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── STEP 4: REVIEW & CONFIRMATION ─── */}
      {step === 4 && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-400">Destination</span>
              <span className="font-heading font-bold text-sm text-white">
                {selectedHospital?.hospital_name || 'Hospital Selected'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Group</span>
                <span className="font-heading font-extrabold text-base text-red-400">
                  {formData.blood_group}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Component</span>
                <span className="font-heading font-bold text-xs text-white">
                  {formData.component_type}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Units Needed</span>
                <span className="font-heading font-extrabold text-base text-white">
                  {formData.quantity_units}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold uppercase text-slate-400">Urgency Protocol</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                {formData.urgency_level}
              </span>
            </div>
          </div>

          {/* Live Stock Assessment Preview */}
          {stockInfo !== null && (
            <div
              className={clsx(
                'p-4 rounded-xl border text-xs flex items-center justify-between',
                stockInfo >= formData.quantity_units
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
              )}
            >
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 shrink-0" />
                <span>
                  {stockInfo >= formData.quantity_units
                    ? `Inventory OK: ${stockInfo} units of ${formData.blood_group} in cold storage.`
                    : `Low Inventory Alert: Only ${stockInfo} unit(s) in stock. Request will trigger emergency triage.`}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
        {step > 1 ? (
          <AnimatedButton type="button" variant="secondary" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back</span>
          </AnimatedButton>
        ) : (
          <AnimatedButton type="button" variant="ghost" onClick={onClose}>
            <span>Cancel</span>
          </AnimatedButton>
        )}

        {step < 4 ? (
          <AnimatedButton type="button" variant="primary" onClick={handleNext}>
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </AnimatedButton>
        ) : (
          <AnimatedButton type="button" variant="primary" loading={loading} onClick={handleSubmit}>
            <span>Submit Blood Request</span>
          </AnimatedButton>
        )}
      </div>
    </Modal>
  );
}
