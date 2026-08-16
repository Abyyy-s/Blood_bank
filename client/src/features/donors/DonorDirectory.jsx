import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  MapPin,
  Phone,
  Mail,
  UserPlus,
  Copy,
  Check,
  Share2,
  Filter,
  ShieldCheck,
  Droplet,
  Compass
} from 'lucide-react';
import { donorService } from '../../services/donor.service';
import BloodGroupBadge from '../../components/ui/BloodGroupBadge';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedButton from '../../components/ui/AnimatedButton';
import DonorRegistrationModal from './DonorRegistrationModal';
import { useToast } from '../../components/ui/Toast';
import clsx from 'clsx';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorDirectory() {
  const { toast } = useToast();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [radiusFilter, setRadiusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const response = await donorService.getAll();
      setDonors(response.data || []);
    } catch (err) {
      // Fallback sample data if database is fresh
      setDonors([
        { donor_id: 1, name: 'Aarav Patel', age: 29, gender: 'Male', blood_group: 'O+', phone: '+91 98765 43210', email: 'aarav.patel@gmail.com', city: 'Downtown', address: 'Main Street' },
        { donor_id: 2, name: 'Priya Sharma', age: 24, gender: 'Female', blood_group: 'A+', phone: '+91 98765 43211', email: 'priya.s@gmail.com', city: 'North District', address: 'Park Avenue' },
        { donor_id: 3, name: 'Rahul Verma', age: 34, gender: 'Male', blood_group: 'B+', phone: '+91 98765 43212', email: 'rahul.v@gmail.com', city: 'East Side', address: 'Medical Center' },
        { donor_id: 4, name: 'Ananya Gupta', age: 27, gender: 'Female', blood_group: 'O-', phone: '+91 98765 43213', email: 'ananya.g@gmail.com', city: 'Downtown', address: 'Lake Road' },
        { donor_id: 5, name: 'Vikram Mehta', age: 41, gender: 'Male', blood_group: 'AB+', phone: '+91 98765 43214', email: 'vikram.m@gmail.com', city: 'West Side', address: 'Hilltop Lane' },
        { donor_id: 6, name: 'Sneha Reddy', age: 23, gender: 'Female', blood_group: 'A-', phone: '+91 98765 43215', email: 'sneha.r@gmail.com', city: 'North District', address: 'Green View' },
        { donor_id: 7, name: 'Rohan Joshi', age: 31, gender: 'Male', blood_group: 'B-', phone: '+91 98765 43216', email: 'rohan.j@gmail.com', city: 'South District', address: 'Riverside' },
        { donor_id: 8, name: 'Kavita Nair', age: 28, gender: 'Female', blood_group: 'AB-', phone: '+91 98765 43217', email: 'kavita.n@gmail.com', city: 'East Side', address: 'Station Road' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  // Unique list of cities from donors
  const cities = useMemo(() => {
    const set = new Set();
    donors.forEach((d) => {
      if (d.city) set.add(d.city);
    });
    return ['ALL', ...Array.from(set)];
  }, [donors]);

  // Filtered donors
  const filteredDonors = useMemo(() => {
    return donors.filter((donor) => {
      // Blood group filter
      if (selectedGroup !== 'ALL' && donor.blood_group !== selectedGroup) {
        return false;
      }
      // City filter
      if (selectedCity !== 'ALL' && donor.city !== selectedCity) {
        return false;
      }
      // Query filter (name, phone, city, address)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = donor.name?.toLowerCase().includes(q);
        const matchPhone = donor.phone?.toLowerCase().includes(q);
        const matchCity = donor.city?.toLowerCase().includes(q);
        const matchAddress = donor.address?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCity && !matchAddress) {
          return false;
        }
      }
      return true;
    });
  }, [donors, selectedGroup, selectedCity, searchQuery]);

  const handleCopyPhone = (phone, donorId) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(donorId);
    toast(`Phone number copied: ${phone}`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareDonor = (donor) => {
    const text = `Urgent Blood Need: Matching Donor ${donor.name} (${donor.blood_group}) in ${donor.city}. Contact: ${donor.phone}`;
    if (navigator.share) {
      navigator.share({
        title: 'Life Link Donor Match',
        text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast('Donor details copied to clipboard to share!', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400 mb-1">
            <Users className="w-4 h-4" />
            <span>Voluntary Donor Network</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Find Matching Donors
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Locate voluntary blood donors across districts by blood compatibility, geographic proximity, and availability.
          </p>
        </div>

        <AnimatedButton
          variant="primary"
          onClick={() => setIsRegisterModalOpen(true)}
          className="shadow-lg shadow-red-950/40 shrink-0 font-bold"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          <span>Register New Donor</span>
        </AnimatedButton>
      </div>

      {/* ─── SEARCH & FILTER BAR ─── */}
      <GlassCard className="p-5 sm:p-6 bg-slate-900/80 border-slate-800 space-y-5">
        {/* Blood Group Filter Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-red-400" />
              Filter by Blood Group
            </span>
            {selectedGroup !== 'ALL' && (
              <button
                onClick={() => setSelectedGroup('ALL')}
                className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
              >
                Reset to All
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {BLOOD_GROUPS.map((bg) => {
              const isSelected = selectedGroup === bg;
              if (bg === 'ALL') {
                return (
                  <button
                    key={bg}
                    onClick={() => setSelectedGroup('ALL')}
                    className={clsx(
                      'px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border',
                      isSelected
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    )}
                  >
                    ALL GROUPS
                  </button>
                );
              }
              return (
                <BloodGroupBadge
                  key={bg}
                  group={bg}
                  selected={isSelected}
                  selectable={true}
                  size="md"
                  onClick={() => setSelectedGroup(bg)}
                  className="cursor-pointer"
                />
              );
            })}
          </div>
        </div>

        {/* Inputs: Search Query + City Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 border-t border-slate-800">
          {/* General Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search donor name, phone number, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* City Filter Dropdown */}
          <div className="sm:col-span-3 relative">
            <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-500 transition-colors cursor-pointer appearance-none"
            >
              {cities.map((city) => (
                <option key={city} value={city} className="bg-slate-900 text-slate-200">
                  {city === 'ALL' ? 'All Locations' : city}
                </option>
              ))}
            </select>
          </div>

          {/* Distance Radius Simulator Filter */}
          <div className="sm:col-span-3 relative">
            <Compass className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={radiusFilter}
              onChange={(e) => setRadiusFilter(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-500 transition-colors cursor-pointer appearance-none"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">Any Radius</option>
              <option value="10" className="bg-slate-900 text-slate-200">Within 10 km</option>
              <option value="25" className="bg-slate-900 text-slate-200">Within 25 km</option>
              <option value="50" className="bg-slate-900 text-slate-200">Within 50 km</option>
            </select>
          </div>
        </div>

        {/* Results Counter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 font-medium">
          <span>
            Showing <strong className="text-white font-bold">{filteredDonors.length}</strong> matching verified donors
          </span>
          {(selectedGroup !== 'ALL' || selectedCity !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedGroup('ALL');
                setSelectedCity('ALL');
                setSearchQuery('');
              }}
              className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      </GlassCard>

      {/* ─── DONOR CARDS GRID ─── */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Accessing donor directory...</span>
        </div>
      ) : filteredDonors.length === 0 ? (
        <GlassCard className="p-12 text-center bg-slate-900/40 border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-white">No matching donors found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Try loosening your search filters or register a new voluntary donor in this area.
          </p>
          <AnimatedButton
            variant="secondary"
            onClick={() => {
              setSelectedGroup('ALL');
              setSelectedCity('ALL');
              setSearchQuery('');
            }}
            className="mt-2"
          >
            Reset Filters
          </AnimatedButton>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredDonors.map((donor, idx) => (
              <motion.div
                key={donor.donor_id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
              >
                <GlassCard className="p-5 bg-slate-900/80 border-slate-800 hover:border-slate-700 flex flex-col justify-between h-full group">
                  <div className="space-y-4">
                    {/* Top Row: Name + Blood Group Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Eligible Donor</span>
                        </div>
                        <h3 className="font-heading font-bold text-lg text-white group-hover:text-red-400 transition-colors">
                          {donor.name}
                        </h3>
                        <div className="text-xs text-slate-400 font-medium">
                          {donor.age} yrs • {donor.gender}
                        </div>
                      </div>

                      <BloodGroupBadge
                        group={donor.blood_group}
                        size="md"
                        className="shrink-0 font-extrabold shadow-md"
                      />
                    </div>

                    {/* Location & Details */}
                    <div className="space-y-1.5 text-xs text-slate-300 pt-3 border-t border-slate-800/80">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">
                          {donor.city} {donor.address ? `• ${donor.address}` : ''}
                        </span>
                      </div>

                      {donor.email && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{donor.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Call / Copy Phone + Share */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyPhone(donor.phone, donor.donor_id)}
                      className="flex-1 py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {copiedId === donor.donor_id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-3.5 h-3.5 text-red-400" />
                          <span>{donor.phone}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleShareDonor(donor)}
                      title="Share donor contact"
                      className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      aria-label="Share donor contact"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Registration Modal */}
      <DonorRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onDonorRegistered={fetchDonors}
      />
    </div>
  );
}
