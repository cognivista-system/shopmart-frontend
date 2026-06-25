import { useMemo, useState } from 'react';
import { Clock, LogIn, LogOut, CalendarDays, Timer } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageHeader, StatCard, AdminTable } from '../../components/admin/AdminUI';
import { buildAttendance } from '../../services/superAdminMock';

const fmtTime = (v) => (v ? new Date(v).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—');
const fmtDay = (v) => new Date(v).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });

export default function AdminAttendance() {
  const [rows, setRows] = useState(() => buildAttendance());

  const today = rows[0];
  const monthlyHours = useMemo(
    () => Math.round(rows.reduce((s, r) => s + (r.hours || 0), 0) * 10) / 10,
    [rows],
  );
  const workedDays = rows.filter((r) => r.hours != null).length;
  const avgPerDay = workedDays ? Math.round((monthlyHours / workedDays) * 10) / 10 : 0;

  const clockOut = () => {
    const now = new Date().toISOString();
    setRows((list) => list.map((r, i) => {
      if (i !== 0) return r;
      const hours = r.login ? Math.round(((new Date(now) - new Date(r.login)) / 3.6e6) * 10) / 10 : 0;
      return { ...r, logout: now, hours };
    }));
    toast.success('Clocked out for today');
  };

  return (
    <div>
      <AdminPageHeader title="Attendance" subtitle="Your working hours and login activity." />

      {/* Today + stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={LogIn} label="Login time (today)" value={fmtTime(today?.login)} tone="brand" />
        <StatCard icon={LogOut} label="Logout time (today)" value={fmtTime(today?.logout)} tone="amber" />
        <StatCard icon={Timer} label="Total hours (today)" value={today?.hours != null ? `${today.hours}h` : (today?.login ? 'In progress' : '—')} tone="emerald" />
        <StatCard icon={CalendarDays} label="Monthly hours" value={`${monthlyHours}h`} tone="purple" />
      </div>

      {/* Today card */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><Clock className="h-6 w-6" /></span>
          <div>
            <p className="text-brand-100">Today · {today ? fmtDay(today.date) : ''}</p>
            <p className="font-display text-xl font-bold">
              {today?.logout ? `Worked ${today.hours}h` : today?.login ? `Clocked in at ${fmtTime(today.login)}` : 'Not clocked in'}
            </p>
          </div>
        </div>
        {today?.login && !today?.logout && (
          <button onClick={clockOut} className="btn-accent"><LogOut className="h-4 w-4" /> Clock out</button>
        )}
      </div>

      {/* Summary line */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="card p-4 text-center"><p className="text-2xl font-bold text-ink">{workedDays}</p><p className="text-sm text-ink-muted">Days worked</p></div>
        <div className="card p-4 text-center"><p className="text-2xl font-bold text-ink">{avgPerDay}h</p><p className="text-sm text-ink-muted">Avg / day</p></div>
        <div className="card p-4 text-center"><p className="text-2xl font-bold text-ink">{monthlyHours}h</p><p className="text-sm text-ink-muted">This period</p></div>
      </div>

      {/* History */}
      <h2 className="mb-3 mt-8 font-semibold text-ink">Recent activity</h2>
      <AdminTable columns={['Date', 'Login', 'Logout', 'Total hours']}>
        {rows.map((r) => (
          <tr key={r.date} className="hover:bg-slate-50/60">
            <td className="px-4 py-3 font-medium text-ink">{fmtDay(r.date)}</td>
            <td className="px-4 py-3 text-ink-soft">{r.weekend ? <span className="text-slate-400">Weekend</span> : fmtTime(r.login)}</td>
            <td className="px-4 py-3 text-ink-soft">{r.weekend ? '—' : fmtTime(r.logout)}</td>
            <td className="px-4 py-3">
              {r.weekend ? <span className="text-slate-400">—</span>
                : r.hours != null ? <span className="font-medium text-ink">{r.hours}h</span>
                  : <span className="badge bg-amber-100 text-amber-700">In progress</span>}
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
