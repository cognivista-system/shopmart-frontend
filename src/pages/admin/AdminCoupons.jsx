import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminCoupons } from '../../services/adminMock';
import { formatPrice, formatDate } from '../../utils/format';
import { AdminPageHeader, AdminTable } from '../../components/admin/AdminUI';
import Modal from '../../components/common/Modal';

const EMPTY = { code: '', type: 'PERCENT', value: '', minOrder: '', expiry: '', active: true };

export default function AdminCoupons() {
  const [items, setItems] = useState(adminCoupons);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const startAdd = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const startEdit = (c) => { setEditing(c); setForm(c); setOpen(true); };
  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const save = () => {
    if (!form.code.trim() || !form.value) { toast.error('Code and value are required'); return; }
    const payload = { ...form, code: form.code.toUpperCase(), value: Number(form.value), minOrder: Number(form.minOrder) || 0 };
    if (editing) {
      setItems((list) => list.map((c) => (c.id === editing.id ? { ...c, ...payload } : c)));
      toast.success('Coupon updated');
    } else {
      setItems((list) => [...list, { ...payload, id: Date.now(), used: 0 }]);
      toast.success('Coupon created');
    }
    setOpen(false);
  };

  const remove = (c) => {
    setItems((list) => list.filter((x) => x.id !== c.id));
    toast.success('Coupon removed');
  };

  const valueLabel = (c) => (c.type === 'PERCENT' ? `${c.value}% off` : `${formatPrice(c.value)} off`);

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        subtitle="Create and manage discount codes."
        action={<button onClick={startAdd} className="btn-primary"><Plus className="h-4 w-4" /> New coupon</button>}
      />

      <AdminTable columns={['Code', 'Discount', 'Min order', 'Expiry', 'Used', 'Status', '']}>
        {items.map((c) => (
          <tr key={c.id} className="hover:bg-slate-50/60">
            <td className="px-4 py-3"><span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-ink">{c.code}</span></td>
            <td className="px-4 py-3 font-medium text-ink">{valueLabel(c)}</td>
            <td className="px-4 py-3 text-ink-soft">{c.minOrder ? formatPrice(c.minOrder) : '—'}</td>
            <td className="px-4 py-3 text-ink-muted">{formatDate(c.expiry)}</td>
            <td className="px-4 py-3 text-ink-soft">{c.used}</td>
            <td className="px-4 py-3">
              <span className={`badge ${c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {c.active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-1">
                <button onClick={() => startEdit(c)} className="btn-ghost h-8 w-8 p-0" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(c)} className="btn-ghost h-8 w-8 p-0 text-red-600 hover:bg-red-50" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit coupon' : 'New coupon'}
        footer={(
          <>
            <button onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
            <button onClick={save} className="btn-primary">Save</button>
          </>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Code</label>
            <input name="code" className="field uppercase" value={form.code} onChange={update} placeholder="e.g. SAVE10" />
          </div>
          <div>
            <label className="label">Type</label>
            <select name="type" value={form.type} onChange={update} className="field">
              <option value="PERCENT">Percentage</option>
              <option value="FLAT">Flat amount</option>
            </select>
          </div>
          <div>
            <label className="label">Value</label>
            <input name="value" type="number" className="field" value={form.value} onChange={update} placeholder={form.type === 'PERCENT' ? '10' : '200'} />
          </div>
          <div>
            <label className="label">Min order (₹)</label>
            <input name="minOrder" type="number" className="field" value={form.minOrder} onChange={update} placeholder="0" />
          </div>
          <div>
            <label className="label">Expiry</label>
            <input name="expiry" type="date" className="field" value={form.expiry} onChange={update} />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-ink-soft sm:col-span-2">
            <input type="checkbox" name="active" checked={form.active} onChange={update} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            Active
          </label>
        </div>
      </Modal>
    </div>
  );
}
