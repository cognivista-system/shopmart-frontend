import { useMemo } from 'react';
import { IndianRupee, ShoppingBag, TrendingUp, Percent, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminStats } from '../../services/adminMock';
import { mockProducts } from '../../services/mockData';
import { formatPrice } from '../../utils/format';
import { AdminPageHeader, StatCard, BarChart, AdminTable } from '../../components/admin/AdminUI';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminReports() {
  const totalOrders = adminStats.ordersByStatus.reduce((s, r) => s + r.count, 0);
  const delivered = adminStats.ordersByStatus.find((r) => r.status === 'DELIVERED')?.count || 0;
  const conversion = ((delivered / totalOrders) * 100).toFixed(1);
  const avgOrder = Math.round(adminStats.revenue / adminStats.orders);

  // Synthesize a "top products" view from the catalog for demonstration.
  const topProducts = useMemo(
    () =>
      mockProducts
        .map((p, i) => ({
          id: p.id,
          name: p.name,
          image: p.images[0],
          units: 320 - i * 11,
          revenue: p.price * (320 - i * 11),
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6),
    []
  );

  const exportCsv = () => {
    const rows = [['Product', 'Units sold', 'Revenue'], ...topProducts.map((p) => [p.name, p.units, p.revenue])];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopmart-top-products.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        subtitle="Sales analytics and performance insights."
        action={<button onClick={exportCsv} className="btn-outline"><Download className="h-4 w-4" /> Export CSV</button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={IndianRupee} label="Total revenue" value={formatPrice(adminStats.revenue)} delta="+12.4%" tone="emerald" />
        <StatCard icon={ShoppingBag} label="Total orders" value={adminStats.orders.toLocaleString('en-IN')} delta="+5.1%" tone="brand" />
        <StatCard icon={TrendingUp} label="Avg. order value" value={formatPrice(avgOrder)} tone="purple" />
        <StatCard icon={Percent} label="Fulfilment rate" value={`${conversion}%`} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-semibold text-ink">Monthly revenue</h2>
          <p className="text-xs text-ink-muted">Values in ₹ thousands</p>
          <div className="mt-5">
            <BarChart data={adminStats.revenueSeries} />
            <div className="mt-2 flex gap-2 text-[10px] text-ink-muted">
              {MONTHS.map((m) => <span key={m} className="flex-1 text-center">{m}</span>)}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-ink">Orders by status</h2>
          <ul className="mt-4 space-y-3">
            {adminStats.ordersByStatus.map((row) => {
              const pct = Math.round((row.count / totalOrders) * 100);
              return (
                <li key={row.status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-soft">{row.status}</span>
                    <span className="font-medium text-ink">{row.count} ({pct}%)</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-semibold text-ink">Top-selling products</h2>
        <AdminTable columns={['Product', 'Units sold', 'Revenue']}>
          {topProducts.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50/60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                  <span className="font-medium text-ink line-clamp-1">{p.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-ink-soft">{p.units}</td>
              <td className="px-4 py-3 font-medium text-ink">{formatPrice(p.revenue)}</td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </div>
  );
}
