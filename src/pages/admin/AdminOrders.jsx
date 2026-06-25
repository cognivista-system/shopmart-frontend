import { useState } from 'react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminRecentOrders } from '../../services/adminMock';
import { mockOrders, orderTotal } from '../../services/mockAccount';
import { ORDER_STATUS, ORDER_STATUS_META } from '../../utils/constants';
import { formatPrice, formatDate } from '../../utils/format';
import { AdminPageHeader, AdminTable, StatusBadge } from '../../components/admin/AdminUI';

// Combine the richer mock orders with the lightweight recent list for a fuller table.
const seed = [
  ...mockOrders.map((o) => ({ id: o.id, customer: o.address?.name || 'Customer', date: o.createdAt, total: orderTotal(o), status: o.status })),
  ...adminRecentOrders,
].filter((o, i, arr) => arr.findIndex((x) => x.id === o.id) === i);

export default function AdminOrders() {
  const [orders, setOrders] = useState(seed);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('ALL');

  const setStatus = (id, status) => {
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
    toast.success(`Order ${id} → ${ORDER_STATUS_META[status]?.label || status}`);
  };

  const filtered = orders
    .filter((o) => (filter === 'ALL' ? true : o.status === filter))
    .filter((o) => o.id.toLowerCase().includes(q.toLowerCase()) || o.customer.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <AdminPageHeader title="Orders" subtitle="Review and update order statuses." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="field pl-10" placeholder="Search by order or customer…" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="field w-auto">
          <option value="ALL">All statuses</option>
          {Object.keys(ORDER_STATUS).map((s) => <option key={s} value={s}>{ORDER_STATUS_META[s].label}</option>)}
        </select>
      </div>

      <AdminTable columns={['Order', 'Customer', 'Date', 'Total', 'Status', 'Update']}>
        {filtered.map((o) => (
          <tr key={o.id} className="hover:bg-slate-50/60">
            <td className="px-4 py-3 font-medium text-ink">{o.id}</td>
            <td className="px-4 py-3 text-ink-soft">{o.customer}</td>
            <td className="px-4 py-3 text-ink-muted">{formatDate(o.date)}</td>
            <td className="px-4 py-3 font-medium text-ink">{formatPrice(o.total)}</td>
            <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
            <td className="px-4 py-3">
              <select
                value={o.status}
                onChange={(e) => setStatus(o.id, e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs focus:border-brand-500 focus:outline-none"
              >
                {Object.keys(ORDER_STATUS).map((s) => <option key={s} value={s}>{ORDER_STATUS_META[s].label}</option>)}
              </select>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
