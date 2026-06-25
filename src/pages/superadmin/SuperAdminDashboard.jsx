import { Link } from 'react-router-dom';
import { ShieldCheck, ClipboardCheck, ShoppingBag, IndianRupee, Users, ArrowRight, ScrollText } from 'lucide-react';
import { AdminPageHeader, StatCard } from '../../components/admin/AdminUI';
import { ChartCard, SalesChart, OrdersChart, RevenueChart, TopProductsChart, StatusPie } from '../../components/admin/Charts';
import {
  superStats, salesSeries, topProductsData, ordersByStatusData, seedApprovals, seedActivityLogs,
} from '../../services/superAdminMock';
import { formatPrice } from '../../utils/format';
import { timeAgo } from '../../utils/format';

export default function SuperAdminDashboard() {
  const pending = seedApprovals.filter((a) => a.status === 'PENDING').slice(0, 4);

  return (
    <div>
      <AdminPageHeader title="Super Admin Dashboard" subtitle="Platform-wide overview and controls." />

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={ShieldCheck} label="Total Admins" value={superStats.totalAdmins} tone="brand" />
        <StatCard icon={ClipboardCheck} label="Pending Approvals" value={superStats.pendingApprovals} tone="amber" delta="action needed" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={superStats.totalOrders.toLocaleString('en-IN')} tone="purple" />
        <StatCard icon={IndianRupee} label="Revenue" value={formatPrice(superStats.revenue)} tone="emerald" />
        <StatCard icon={Users} label="Active Users" value={superStats.activeUsers} tone="brand" />
      </div>

      {/* Analytics */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Sales" subtitle="Monthly sales (₹ thousands)"><SalesChart data={salesSeries} /></ChartCard>
        <ChartCard title="Orders" subtitle="Orders per month"><OrdersChart data={salesSeries} /></ChartCard>
        <ChartCard title="Revenue" subtitle="Monthly revenue (₹ thousands)"><RevenueChart data={salesSeries} /></ChartCard>
        <ChartCard title="Orders by status" subtitle="Current distribution"><StatusPie data={ordersByStatusData} /></ChartCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ChartCard title="Top products" subtitle="Best sellers by units" height={300}><TopProductsChart data={topProductsData} /></ChartCard>

        <div className="space-y-6">
          {/* Pending approvals */}
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-ink">Pending approvals</h3>
              <Link to="/superadmin/approvals" className="link inline-flex items-center gap-1 text-sm">Review <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            {pending.length === 0 ? <p className="text-sm text-ink-muted">Nothing pending.</p> : (
              <ul className="space-y-3">
                {pending.map((a) => (
                  <li key={a.id} className="flex items-center gap-3">
                    <img src={a.product.images?.[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{a.product.name}</p>
                      <p className="text-xs text-ink-muted">by {a.submittedBy} · {timeAgo(a.submittedAt)}</p>
                    </div>
                    <span className="badge bg-amber-100 text-amber-700">Pending</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent activity */}
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="inline-flex items-center gap-2 font-semibold text-ink"><ScrollText className="h-4 w-4 text-brand-600" /> Recent activity</h3>
              <Link to="/superadmin/activity" className="link inline-flex items-center gap-1 text-sm">All <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            <ul className="space-y-2.5">
              {seedActivityLogs.slice(0, 5).map((l) => (
                <li key={l.id} className="text-sm">
                  <span className="font-medium text-ink">{l.actor}</span>{' '}
                  <span className="text-ink-muted">{l.type.replace(/_/g, ' ').toLowerCase()}</span>{' '}
                  <span className="text-ink-soft">— {l.target}</span>
                  <span className="block text-xs text-slate-400">{timeAgo(l.at)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
