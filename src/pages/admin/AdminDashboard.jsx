import { Link } from 'react-router-dom';
import { IndianRupee, ShoppingBag, Users, Package, ArrowRight, Clock } from 'lucide-react';
import { adminStats, adminRecentOrders } from '../../services/adminMock';
import { salesSeries, topProductsData, ordersByStatusData, buildAttendance } from '../../services/superAdminMock';
import { formatPrice, formatDate } from '../../utils/format';
import { AdminPageHeader, StatCard, StatusBadge, AdminTable } from '../../components/admin/AdminUI';
import { ChartCard, SalesChart, OrdersChart, RevenueChart, TopProductsChart, StatusPie } from '../../components/admin/Charts';

export default function AdminDashboard() {
  const monthlyHours = Math.round(buildAttendance().reduce((s, r) => s + (r.hours || 0), 0) * 10) / 10;

  return (
    <div>
      <AdminPageHeader title="Dashboard" subtitle="An overview of your store’s performance." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={Package} label="Products" value={adminStats.products} tone="amber" />
        <StatCard icon={ShoppingBag} label="Orders" value={adminStats.orders.toLocaleString('en-IN')} delta="+5.1%" tone="brand" />
        <StatCard icon={Users} label="Customers" value={adminStats.customers.toLocaleString('en-IN')} delta="+8.7%" tone="purple" />
        <StatCard icon={Clock} label="Working Hours" value={`${monthlyHours}h`} tone="brand" />
        <StatCard icon={IndianRupee} label="Revenue" value={formatPrice(adminStats.revenue)} delta="+12.4%" tone="emerald" />
      </div>

      {/* Analytics */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Sales" subtitle="Monthly sales (₹ thousands)"><SalesChart data={salesSeries} /></ChartCard>
        <ChartCard title="Revenue" subtitle="Monthly revenue (₹ thousands)"><RevenueChart data={salesSeries} /></ChartCard>
        <ChartCard title="Orders" subtitle="Orders per month"><OrdersChart data={salesSeries} /></ChartCard>
        <ChartCard title="Orders by status"><StatusPie data={ordersByStatusData} /></ChartCard>
      </div>

      <div className="mt-6">
        <ChartCard title="Top products" subtitle="Best sellers by units" height={300}><TopProductsChart data={topProductsData} /></ChartCard>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-ink">Recent orders</h2>
          <Link to="/admin/orders" className="link inline-flex items-center gap-1 text-sm">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <AdminTable columns={['Order', 'Customer', 'Date', 'Total', 'Status']}>
          {adminRecentOrders.map((o) => (
            <tr key={o.id} className="hover:bg-slate-50/60">
              <td className="px-4 py-3 font-medium text-ink">{o.id}</td>
              <td className="px-4 py-3 text-ink-soft">{o.customer}</td>
              <td className="px-4 py-3 text-ink-muted">{formatDate(o.date)}</td>
              <td className="px-4 py-3 font-medium text-ink">{formatPrice(o.total)}</td>
              <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </div>
  );
}
