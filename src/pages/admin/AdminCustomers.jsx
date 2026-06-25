import { useState } from 'react';
import { Search } from 'lucide-react';
import { adminCustomers } from '../../services/adminMock';
import { formatPrice, formatDate, initials } from '../../utils/format';
import { AdminPageHeader, AdminTable } from '../../components/admin/AdminUI';

export default function AdminCustomers() {
  const [q, setQ] = useState('');
  const filtered = adminCustomers.filter(
    (c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <AdminPageHeader title="Customers" subtitle="View and search your customer base." />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} className="field pl-10" placeholder="Search customers…" />
      </div>

      <AdminTable columns={['Customer', 'Orders', 'Total spent', 'Joined', 'Status']}>
        {filtered.map((c) => (
          <tr key={c.id} className="hover:bg-slate-50/60">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {initials(c.name)}
                </span>
                <div>
                  <p className="font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink-muted">{c.email}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-ink-soft">{c.orders}</td>
            <td className="px-4 py-3 font-medium text-ink">{formatPrice(c.spent)}</td>
            <td className="px-4 py-3 text-ink-muted">{formatDate(c.joined)}</td>
            <td className="px-4 py-3">
              <span className={`badge ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {c.status}
              </span>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
