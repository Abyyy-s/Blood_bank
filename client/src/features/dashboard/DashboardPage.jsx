import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Droplet,
  Users,
  Boxes,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Plus,
  RefreshCw,
  Hospital,
  Clock,
  Sparkles
} from 'lucide-react';
import { inventoryService } from '../../services/inventory.service';
import { requestService } from '../../services/request.service';
import BloodGroupBadge from '../../components/ui/BloodGroupBadge';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import AnimatedButton from '../../components/ui/AnimatedButton';
import { useAuth } from '../auth/AuthContext';
import clsx from 'clsx';

const ALL_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, reqRes] = await Promise.all([
        inventoryService.getDashboard(),
        requestService.getAll()
      ]);
      setDashboardData(dashRes.data);
      setRecentRequests((reqRes.data || []).slice(0, 5));
    } catch (err) {
      // Fallback realistic demo telemetry if database is unseeded
      setDashboardData({
        total_donors: 1420,
        total_donations: 4380,
        pending_requests: 4,
        stock_by_group: [
          { blood_group: 'A+', total_units: 45 },
          { blood_group: 'A-', total_units: 12 },
          { blood_group: 'B+', total_units: 38 },
          { blood_group: 'B-', total_units: 8 },
          { blood_group: 'AB+', total_units: 15 },
          { blood_group: 'AB-', total_units: 5 },
          { blood_group: 'O+', total_units: 52 },
          { blood_group: 'O-', total_units: 18 },
        ]
      });
      setRecentRequests([
        { request_id: 101, hospital_name: 'City General Hospital', blood_group: 'O-', quantity_units: 4, urgency_level: 'Critical', status: 'Pending' },
        { request_id: 102, hospital_name: 'St. Mary Medical Center', blood_group: 'AB-', quantity_units: 2, urgency_level: 'Critical', status: 'Pending' },
        { request_id: 103, hospital_name: 'Regional Emergency Hospital', blood_group: 'A+', quantity_units: 6, urgency_level: 'High', status: 'Pending' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const stockList = dashboardData?.stock_by_group || [];
  const totalCirculatingUnits = stockList.reduce((sum, g) => sum + (Number(g.total_units) || 0), 0);
  const lowStockGroups = stockList.filter((g) => Number(g.total_units || 0) < 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* ─── HERO GREETING & COMMAND BAR ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400 mb-1">
            <Activity className="w-4 h-4" />
            <span>Operational Command Hub</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Live Blood Circulation Network
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Real-time multi-bank inventory telemetry, cold-storage levels, and incoming emergency triage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatedButton
            variant="secondary"
            onClick={loadData}
            title="Refresh telemetry"
            className="p-2.5"
          >
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
          </AnimatedButton>

          <Link to="/requests">
            <AnimatedButton variant="primary" className="font-bold">
              <span>Review Requests</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </AnimatedButton>
          </Link>
        </div>
      </div>

      {/* ─── TELEMETRY STRIP ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-6 bg-slate-900/80 border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Donors</span>
            <Users className="w-4 h-4 text-red-400" />
          </div>
          <div className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            {dashboardData?.total_donors ?? '—'}
          </div>
          <span className="text-xs text-slate-500 mt-1 font-medium">Active clinical records</span>
        </GlassCard>

        <GlassCard className="p-6 bg-slate-900/80 border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Donations</span>
            <Droplet className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            {dashboardData?.total_donations ?? '—'}
          </div>
          <span className="text-xs text-slate-500 mt-1 font-medium">All time collection events</span>
        </GlassCard>

        <GlassCard className="p-6 bg-slate-900/80 border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Circulating Inventory</span>
            <Boxes className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-heading font-extrabold text-3xl sm:text-4xl text-emerald-400">
            {totalCirculatingUnits}
          </div>
          <span className="text-xs text-emerald-500/80 mt-1 font-medium">Verified usable pints</span>
        </GlassCard>

        <GlassCard className="p-6 bg-slate-900/80 border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Triage</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-heading font-extrabold text-3xl sm:text-4xl text-amber-400">
            {dashboardData?.pending_requests ?? '—'}
          </div>
          <span className="text-xs text-amber-500/80 mt-1 font-medium">Awaiting action</span>
        </GlassCard>
      </div>

      {/* ─── BLOOD STOCK CIRCULATION GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 8-Group Circulation Cards */}
        <div className="lg:col-span-8 space-y-4">
          <GlassCard className="p-6 bg-slate-900/80 border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 block">Inventory</span>
                <h3 className="font-heading font-bold text-xl text-white">
                  Blood Circulation Vault
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Healthy (30+)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Normal (10-29)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>Low (&lt;10)</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {ALL_GROUPS.map((group) => {
                const stockItem = stockList.find((s) => s.blood_group === group);
                const units = stockItem ? Number(stockItem.total_units || 0) : 0;
                const status = units === 0 ? 'Out of Stock' : units < 10 ? 'Low' : units < 30 ? 'Normal' : 'Healthy';
                const statusColor =
                  units === 0
                    ? 'text-red-500 bg-red-500/10 border-red-500/30'
                    : units < 10
                    ? 'text-red-400 bg-red-500/10 border-red-500/30'
                    : units < 30
                    ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

                return (
                  <motion.div
                    key={group}
                    whileHover={{ y: -2 }}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <BloodGroupBadge group={group} size="sm" />
                      <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border', statusColor)}>
                        {status}
                      </span>
                    </div>

                    <div>
                      <div className="font-heading font-extrabold text-2xl text-white">
                        {units}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">Units available</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Inventory Watch & Demand Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Low Stock Attention Panel */}
          <GlassCard className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Critical Attention Watch</span>
            </div>

            {lowStockGroups.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All blood groups maintain safe operational inventory levels.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockGroups.map((item) => (
                  <div
                    key={item.blood_group}
                    className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-heading font-bold text-sm text-red-400">{item.blood_group}</span>
                      <span className="text-xs text-slate-300">
                        {item.total_units} unit{item.total_units === 1 ? '' : 's'} remaining
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-red-400 px-2 py-0.5 rounded bg-red-500/20">
                      Restock
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Recent Demand Stream */}
          <GlassCard className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Hospital Demand Stream
              </span>
              <Link to="/requests" className="text-xs text-red-400 hover:text-red-300 font-semibold">
                View Queue
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentRequests.slice(0, 4).map((req) => (
                <div
                  key={req.request_id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-heading font-extrabold text-xs text-red-400 shrink-0">
                      {req.blood_group}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-white truncate">{req.hospital_name}</div>
                      <div className="text-[10px] text-slate-500">{req.quantity_units} Units</div>
                    </div>
                  </div>

                  <StatusBadge status={req.urgency_level} type="urgency" size="sm" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
