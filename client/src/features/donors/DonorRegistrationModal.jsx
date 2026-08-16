import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, Calendar, Heart, ShieldCheck } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import FloatingInput from '../../components/ui/FloatingInput';
import BloodGroupBadge from '../../components/ui/BloodGroupBadge';
import AnimatedButton from '../../components/ui/AnimatedButton';
import { donorService } from '../../services/donor.service';
import { useToast } from '../../components/ui/Toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorRegistrationModal({ isOpen, onClose, onDonorRegistered }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    blood_group: 'O+',
    phone: '',
    email: '',
    address: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.age || !formData.blood_group || !formData.phone || !formData.city) {
      setError('Please fill in all mandatory fields (Name, Age, Blood Group, Phone, City).');
      return;
    }

    setLoading(true);
    try {
      await donorService.register({
        name: formData.name.trim(),
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        blood_group: formData.blood_group,
        phone: formData.phone.trim(),
        email: formData.email ? formData.email.trim() : null,
        address: formData.address ? formData.address.trim() : '',
        city: formData.city.trim(),
      });

      toast('🎉 Thank you! Voluntary donor registered successfully.', 'success');
      onDonorRegistered?.();
      onClose();
      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        blood_group: 'O+',
        phone: '',
        email: '',
        address: '',
        city: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register donor. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register as a Voluntary Donor"
      subtitle="Your donation details will help match urgent hospital transfusion requests."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-900/60 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Blood Group Selector */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Blood Group <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {BLOOD_GROUPS.map((bg) => (
              <BloodGroupBadge
                key={bg}
                group={bg}
                selected={formData.blood_group === bg}
                selectable={true}
                onClick={() => handleChange('blood_group', bg)}
                className="w-full py-2.5 h-auto text-sm cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingInput
            id="donorName"
            label="Full Name"
            icon={User}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FloatingInput
              id="donorAge"
              type="number"
              label="Age (18-65)"
              icon={Calendar}
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              min="18"
              max="65"
              required
            />

            <div className="relative flex flex-col justify-center bg-slate-900 rounded-lg border border-slate-800 px-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 outline-none cursor-pointer"
              >
                <option value="Male" className="bg-slate-900 text-slate-100">Male</option>
                <option value="Female" className="bg-slate-900 text-slate-100">Female</option>
                <option value="Other" className="bg-slate-900 text-slate-100">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingInput
            id="donorPhone"
            type="tel"
            label="Phone Number"
            icon={Phone}
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
          />

          <FloatingInput
            id="donorEmail"
            type="email"
            label="Email Address"
            icon={Mail}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>

        {/* Location Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingInput
            id="donorCity"
            label="City / District"
            icon={MapPin}
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            required
          />

          <FloatingInput
            id="donorAddress"
            label="Address / Area"
            icon={MapPin}
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Voluntary donor privacy protected. Your details are accessed strictly for clinical transfusion requests.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <AnimatedButton
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </AnimatedButton>
          <AnimatedButton
            type="submit"
            variant="primary"
            loading={loading}
            className="px-6"
          >
            Register Donor
          </AnimatedButton>
        </div>
      </form>
    </Modal>
  );
}
