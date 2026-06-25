import { IndianRupee, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { AdminPageHeader, StatCard } from '../../components/admin/AdminUI';
import { ChartCard, SalesChart, OrdersChart, RevenueChart, TopProductsChart, StatusPie } from '../../components/admin/Charts';
import { superStats, salesSeries, topProductsData, ordersByStatusData } from '../../services/superAdminMock';
import { formatPrice } from '../../utils/format';

export default function SuperAdminReports() {
  const totalRevenueK = salesSeries.reduce((s, m) => s + m.revenue, 0);
  const totalOrders = salesSeries.reduce((s, m) => s + m.orders, 0);
  const avgOrder = Math.round((totalRevenueK * 1000) / totalOrders);

  return (
    <div>
      <AdminPageHeader title="Reports & Analytics" subtitle="Platform performance across all admins." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={IndianRupee} label="Total revenue" value={formatPrice(superStats.revenue)} delta="+12.4%" tone="emerald" />
        <StatCard icon={ShoppingBag} label="Total orders" value={superStats.totalOrders.toLocaleString('en-IN')} delta="+5.1%" tone="brand" />
        <StatCard icon={TrendingUp} label="Avg. order value" value={formatPrice(avgOrder)} tone="purple" />
        <StatCard icon={Users} label="Active users" value={superStats.activeUsers} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Sales trend" subtitle="Monthly sales (₹ thousands)"><SalesChart data={salesSeries} /></ChartCard>
        <ChartCard title="Revenue" subtitle="Monthly revenue (₹ thousands)"><RevenueChart data={salesSeries} /></ChartCard>
        <ChartCard title="Orders" subtitle="Orders per month"><OrdersChart data={salesSeries} /></ChartCard>
        <ChartCard title="Orders by status"><StatusPie data={ordersByStatusData} /></ChartCard>
        <ChartCard title="Top products" subtitle="Best sellers by units" height={320}><TopProductsChart data={topProductsData} /></ChartCard>
      </div>
    </div>
  );
}
