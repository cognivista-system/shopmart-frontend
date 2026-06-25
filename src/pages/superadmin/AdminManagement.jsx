import { useState } from 'react';
import { Plus, Pencil, Trash2, ShieldCheck, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageHeader, AdminTable } from '../../components/admin/AdminUI';
import Modal from '../../components/common/Modal';
import { seedAdmins } from '../../services/superAdminMock';
import { isEmail, required } from '../../utils/validators';
import { formatDate, initials, timeAgo } from '../../utils/format';

const EMPTY = { name: '', email: '', role: 'ADMIN', status: 'Active' };

export default function AdminManagement() {
  const [admins, setAdmins] = useState(seedAdmins);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [toDelete, setToDelete] = useState(null);

  const startAdd = () => { setEditing(null); setForm(EMPTY); setErrors({}); setOpen(true); };
  const startEdit = (a) => { setEditing(a); setForm(a); setErrors({}); setOpen(true); };
  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = () => {
    const next = {};
    if (!required(form.name)) next.name = 'Name is required';
    if (!isEmail(form.email)) next.email = 'Enter a valid email';
    setErrors(next);
    if (Object.keys(next).length) return;

    if (editing) {
      setAdmins((list) => list.map((a) => (a.id === editing.id ? { ...a, ...form } : a)));
      toast.success('Admin updated');
    } else {
      setAdmins((list) => [
        { ...form, id: Date.now(), createdAt: new Date().toISOString(), lastLogin: null },
        ...list,
      ]);
      toast.success('Admin created');
    }
    setOpen(false);
  };

  const toggleStatus = (a) => {
    setAdmins((list) => list.map((x) => (x.id === a.id ? { ...x, status: x.status === 'Active' ? 'Inactive' : 'Active' } : x)));
    toast.success(`${a.name} ${a.status === 'Active' ? 'deactivated' : 'activated'}`);
  };

  const remove = () => {
    setAdmins((list) => list.filter((x) => x.id !== toDelete.id));
    toast.success('Admin removed');
    setToDelete(null);
  };

  return (
    <div>
      <AdminPageHeader
        title="Admin Management"
        subtitle="Create and manage admin accounts."
        action={<button onClick={startAdd} className="btn-primary"><Plus className="h-4 w-4" /> Add Admin</button>}
      />

      <AdminTable columns={['Admin', 'Role', 'Status', 'Last login', 'Created', '']}>
        {admins.map((a) => (
          <tr key={a.id} className="hover:bg-slate-50/60">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{initials(a.name)}</span>
                <div><p className="font-medium text-ink">{a.name}</p><p className="text-xs text-ink-muted">{a.email}</p></div>
              </div>
            </td>
            <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-sm text-ink-soft"><ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> {a.role}</span></td>
            <td className="px-4 py-3"><span className={`badge ${a.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{a.status}</span></td>
            <td className="px-4 py-3 text-ink-muted">{a.lastLogin ? timeAgo(a.lastLogin) : '—'}</td>
            <td className="px-4 py-3 text-ink-muted">{formatDate(a.createdAt)}</td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-1">
                <button onClick={() => toggleStatus(a)} className="btn-ghost h-8 w-8 p-0" title={a.status === 'Active' ? 'Deactivate' : 'Activate'} aria-label="Toggle status">
                  <Power className={`h-4 w-4 ${a.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`} />
                </button>
                <button onClick={() => startEdit(a)} className="btn-ghost h-8 w-8 p-0" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => setToDelete(a)} className="btn-ghost h-8 w-8 p-0 text-red-600 hover:bg-red-50" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* Add/Edit modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit admin' : 'Add admin'}
        footer={(
          <>
            <button onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
            <button onClick={save} className="btn-primary">{editing ? 'Save changes' : 'Create admin'}</button>
          </>
        )}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input name="name" className="field" value={form.name} onChange={update} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" className="field" value={form.email} onChange={update} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role</label>
              <select name="role" value={form.role} onChange={update} className="field">
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" value={form.status} onChange={update} className="field">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          {!editing && <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-ink-muted">A temporary password and setup link would be emailed to the new admin.</p>}
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Remove admin?"
        footer={(
          <>
            <button onClick={() => setToDelete(null)} className="btn-ghost">Cancel</button>
            <button onClick={remove} className="btn-danger">Delete</button>
          </>
        )}
      >
        <p className="text-sm text-ink-muted">Remove <span className="font-medium text-ink">{toDelete?.name}</span>’s admin access? This can’t be undone.</p>
      </Modal>
    </div>
  );
}
