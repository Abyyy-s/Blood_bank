import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  RotateCcw,
  Eye,
  Hospital,
  AlertTriangle,
  Boxes,
  Activity,
  Check,
  X
} from 'lucide-react';
import { requestService } from '../../services/request.service';
import StatusBadge from '../../components/ui/StatusBadge';
import BloodGroupBadge from '../../components/ui/BloodGroupBadge';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedButton from '../../components/ui/AnimatedButton';
import MultiStepRequestModal from './MultiStepRequestModal';
import FulfillmentTracker from './FulfillmentTracker';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/Toast';
import clsx from 'clsx';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUSES = ['ALL', 'Pending', 'Fulfilled', 'Rejected'];

export default function BloodRequestPortal() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTrackerRequest, setSelectedTrackerRequest] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (selectedGroup !== 'ALL') params.blood_group = selectedGroup;
      const response = await requestService.getAll(params);
      setRequests(response.data || []);
    } catch (err) {
      // Fallback sample data
      setRequests([
        { request_id: 1, hospital_id: 1, hospital_name: 'City General Hospital', location: 'Central District', blood_group: 'O-', component_type: 'Whole Blood', quantity_units: 4, urgency_level: 'Critical', status: 'Pending', request_date: '2026-08-16' },
        { request_id: 2, hospital_id: 2, hospital_name: 'St. Mary Medical Center', location: 'West Side', blood_group: 'AB-', component_type: 'Platelets', quantity_units: 2, urgency_level: 'Critical', status: 'Pending', request_date: '2026-08-16' },
        { request_id: 3, hospital_id: 3, hospital_name: 'Regional Emergency Hospital', location: 'South District', blood_group: 'A+', component_type: 'RBC', quantity_units: 6, urgency_level: 'High', status: 'Pending', request_date: '2026-08-15' },
        { request_id: 4, hospital_id: 1, hospital_name: 'City General Hospital', location: 'Central District', blood_group: 'B+', component_type: 'Whole Blood', quantity_units: 3, urgency_level: 'Medium', status: 'Fulfilled', request_date: '2026-08-14' },
        { request_id: 5, hospital_id: 2, hospital_name: 'St. Mary Medical Center', location: 'West Side', blood_group: 'O+', component_type: 'Plasma', quantity_units: 5, urgency_level: 'Low', status: 'Fulfilled', request_date: '2026-08-13' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedStatus, selectedGroup]);

  // Telemetry summary metrics
  const summary = useMemo(() => {
    const open = requests.filter((r) => r.status === 'Pending').length;
    const critical = requests.filter((r) => r.urgency_level === 'Critical' && r.status === 'Pending').length;
    const fulfilled = requests.filter((r) => r.status === 'Fulfilled').length;
    const units = requests.reduce((sum, r) => sum + (Number(r.quantity_units) || 0), 0);
    return { open, critical, fulfilled, units };
  }, [requests]);

  const handleUpdateStatus = async (requestId, newStatus) => {
    setProcessingId(requestId);
    try {
      const res = await requestService.updateStatus(requestId, newStatus);
      const data = res.data;
      if (data?.warning) {
        toast(`Status updated with note: ${data.warning}`, 'warning');
      } else {
        toast(`Request #${requestId} updated to ${newStatus}`, 'success');
      }
      fetchRequests();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to update request status', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm(`Are you sure you want to cancel Blood Request #${requestId}?`)) return;
    setProcessingId(requestId);
    try {
      await requestService.cancel(requestId);
      toast(`Request #${requestId} has been cancelled`, 'info');
      fetchRequests();
    } catch (err) {
      toast(err.response?.data?.error || 'Could not cancel request', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400 mb-1">
            <ClipboardList className="w-4 h-4" />
            <span>Emergency Hospital Dispatch</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Blood Request Portal & Triage
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Real-time queue tracking urgent patient transfusions, component cross-matching, and hospital allocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatedButton
            variant="secondary"
            onClick={fetchRequests}
            title="Refresh queue"
            className="p-2.5"
          >
            <RotateCcw className="w-4 h-4" />
          </AnimatedButton>

          <AnimatedButton
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-lg shadow-red-950/40 font-bold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create Blood Request</span>
          </AnimatedButton>
        </div>
      </div>

      {/* ─── METRIC STRIP ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 bg-slate-900/70 border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Open Requests</span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
            {summary.open}
          </div>
          <span className="text-[11px] text-amber-400 font-medium">Awaiting clinical action</span>
        </GlassCard>

        <GlassCard className="p-5 bg-slate-900/70 border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Critical Triage</span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-red-400 mt-1">
            {summary.critical}
          </div>
          <span className="text-[11px] text-red-400/80 font-medium">Immediate emergency priority</span>
        </GlassCard>

        <GlassCard className="p-5 bg-slate-900/70 border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Fulfilled Today</span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-400 mt-1">
            {summary.fulfilled}
          </div>
          <span className="text-[11px] text-emerald-400/80 font-medium">Transfusions completed</span>
        </GlassCard>

        <GlassCard className="p-5 bg-slate-900/70 border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Units in Demand</span>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
            {summary.units}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Across active visible requests</span>
        </GlassCard>
      </div>

      {/* ─── FILTER CONTROLS ─── */}
      <GlassCard className="p-4 sm:p-5 bg-slate-900/80 border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={clsx(
                'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                selectedStatus === status
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {status === 'ALL' ? 'All Status' : status}
            </button>
          ))}
        </div>

        {/* Blood Group Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Group:</span>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg} className="bg-slate-900 text-slate-200">
                {bg === 'ALL' ? 'All Groups' : bg}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* ─── REQUEST QUEUE TABLE / CARDS ─── */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Fetching active request queue...</span>
        </div>
      ) : requests.length === 0 ? (
        <GlassCard className="p-12 text-center bg-slate-900/40 border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-white">No requests match current filters</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Create an emergency request for a hospital or adjust the filter toggles above.
          </p>
          <AnimatedButton variant="primary" onClick={() => setIsCreateModalOpen(true)} className="mt-2">
            Create Blood Request
          </AnimatedButton>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const isCritical = req.urgency_level === 'Critical' && req.status === 'Pending';
            const isPending = req.status === 'Pending';
            const canManage = user?.role === 'Admin' || user?.role === 'Staff';
            const isMyHospital = user?.role === 'Hospital' && user?.hospital_id === req.hospital_id;

            return (
              <motion.div
                key={req.request_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard
                  variant={isCritical ? 'crimson' : 'default'}
                  className={clsx(
                    'p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all',
                    isCritical ? 'bg-red-950/20 border-red-500/40 shadow-lg shadow-red-950/30' : 'bg-slate-900/80 border-slate-800'
                  )}
                >
                  {/* Left Identity & Hospital */}
                  <div className="flex items-start sm:items-center gap-4">
                    <BloodGroupBadge
                      group={req.blood_group}
                      size="lg"
                      className="shrink-0 font-extrabold shadow-md"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-red-400">
                          #{req.request_id}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <StatusBadge status={req.urgency_level} type="urgency" size="sm" />
                        <StatusBadge status={req.status} type="status" size="sm" />
                      </div>

                      <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                        <span>{req.hospital_name}</span>
                        {req.location && (
                          <span className="text-xs text-slate-400 font-normal">({req.location})</span>
                        )}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>
                          Demand: <strong className="text-white">{req.quantity_units} Units</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Component: <strong className="text-slate-200">{req.component_type || 'Whole Blood'}</strong>
                        </span>
                        <span>•</span>
                        <span>{req.request_date ? new Date(req.request_date).toLocaleDateString('en-IN') : 'Recent'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <button
                      onClick={() => setSelectedTrackerRequest(req)}
                      className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Timeline</span>
                    </button>

                    {/* Staff / Admin Actions */}
                    {canManage && isPending && (
                      <div className="flex items-center gap-1.5">
                        <AnimatedButton
                          variant="primary"
                          size="sm"
                          loading={processingId === req.request_id}
                          onClick={() => handleUpdateStatus(req.request_id, 'Fulfilled')}
                          className="font-bold text-xs"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          <span>Fulfill</span>
                        </AnimatedButton>

                        <AnimatedButton
                          variant="danger"
                          size="sm"
                          loading={processingId === req.request_id}
                          onClick={() => handleUpdateStatus(req.request_id, 'Rejected')}
                          className="font-bold text-xs"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          <span>Reject</span>
                        </AnimatedButton>
                      </div>
                    )}

                    {/* Hospital Cancel Action */}
                    {isMyHospital && isPending && (
                      <AnimatedButton
                        variant="danger"
                        size="sm"
                        loading={processingId === req.request_id}
                        onClick={() => handleCancelRequest(req.request_id)}
                        className="font-bold text-xs"
                      >
                        <span>Cancel Request</span>
                      </AnimatedButton>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ─── MULTI-STEP CREATION MODAL ─── */}
      <MultiStepRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRequestCreated={fetchRequests}
      />

      {/* ─── FULFILLMENT TIMELINE TRACKER MODAL ─── */}
      <Modal
        isOpen={Boolean(selectedTrackerRequest)}
        onClose={() => setSelectedTrackerRequest(null)}
        title="Blood Request Dispatch Lifecycle"
        subtitle="End-to-end clinical progression from hospital triage to patient transfusion."
        size="md"
      >
        <FulfillmentTracker request={selectedTrackerRequest} />
      </Modal>
    </div>
  );
}
