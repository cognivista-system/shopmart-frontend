import { useState } from 'react';
import { PackagePlus, PackageCheck, RefreshCw, LogIn, ShoppingBag, ScrollText } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminUI';
import EmptyState from '../../components/common/EmptyState';
import { seedActivityLogs } from '../../services/superAdminMock';
import { timeAgo, formatDateTime } from '../../utils/format';

const META = {
  PRODUCT_ADDED: { icon: PackagePlus, tone: 'bg-brand-100 text-brand-600', label: 'Product Added' },
  PRODUCT_UPDATED: { icon: RefreshCw, tone: 'bg-amber-100 text-amber-600', label: 'Product Updated' },
  PRODUCT_APPROVED: { icon: PackageCheck, tone: 'bg-emerald-100 text-emerald-600', label: 'Product Approved' },
  ADMIN_LOGIN: { icon: LogIn, tone: 'bg-purple-100 text-purple-600', label: 'Admin Login' },
  ORDER_UPDATED: { icon: ShoppingBag, tone: 'bg-pink-100 text-pink-600', label: 'Order Updated' },
};

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'PRODUCT_ADDED', label: 'Product Added' },
  { key: 'PRODUCT_UPDATED', label: 'Product Updated' },
  { key: 'PRODUCT_APPROVED', label: 'Product Approved' },
  { key: 'ADMIN_LOGIN', label: 'Admin Login' },
  { key: 'ORDER_UPDATED', label: 'Order Updated' },
];

export default function ActivityLogs() {
  const [filter, setFilter] = useState('ALL');
  const logs = filter === 'ALL' ? seedActivityLogs : seedActivityLogs.filter((l) => l.type === filter);

  return (
    <div>
      <AdminPageHeader title="Activity Logs" subtitle="A timeline of actions across the platform." />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === f.key ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-soft hover:bg-slate-200'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="No activity" description="No log entries match this filter." />
      ) : (
        <div className="card p-6">
          <ol className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-slate-200">
            {logs.map((l) => {
              const m = META[l.type] || { icon: ScrollText, tone: 'bg-slate-100 text-slate-600', label: l.type };
              const Icon = m.icon;
              return (
                <li key={l.id} className="relative flex gap-4">
                  <span className={`z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full ring-4 ring-white ${m.tone}`}><Icon className="h-5 w-5" /></span>
                  <div className="pt-1">
                    <p className="text-sm text-ink">
                      <span className="font-semibold">{l.actor}</span>{' '}
                      <span className="text-ink-muted">— {m.label}</span>
                    </p>
                    <p className="text-sm text-ink-soft">{l.target}</p>
                    <p className="mt-0.5 text-xs text-slate-400" title={formatDateTime(l.at)}>{timeAgo(l.at)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
