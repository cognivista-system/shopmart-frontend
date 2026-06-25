import { useState } from 'react';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminBlogs } from '../../services/adminMock';
import { formatDate } from '../../utils/format';
import { AdminPageHeader, AdminTable } from '../../components/admin/AdminUI';
import Modal from '../../components/common/Modal';

const EMPTY = { title: '', author: '', status: 'Draft', excerpt: '' };

export default function AdminBlogs() {
  const [items, setItems] = useState(adminBlogs);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const startAdd = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const startEdit = (b) => { setEditing(b); setForm({ excerpt: '', ...b }); setOpen(true); };
  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (editing) {
      setItems((list) => list.map((b) => (b.id === editing.id ? { ...b, ...form } : b)));
      toast.success('Post updated');
    } else {
      setItems((list) => [...list, { ...form, id: Date.now(), date: new Date().toISOString() }]);
      toast.success('Post created');
    }
    setOpen(false);
  };

  const remove = (b) => {
    setItems((list) => list.filter((x) => x.id !== b.id));
    toast.success('Post removed');
  };

  return (
    <div>
      <AdminPageHeader
        title="Blog posts"
        subtitle="Write and manage editorial content."
        action={<button onClick={startAdd} className="btn-primary"><Plus className="h-4 w-4" /> New post</button>}
      />

      <AdminTable columns={['Title', 'Author', 'Date', 'Status', '']}>
        {items.map((b) => (
          <tr key={b.id} className="hover:bg-slate-50/60">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600"><FileText className="h-5 w-5" /></span>
                <span className="font-medium text-ink">{b.title}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-ink-soft">{b.author}</td>
            <td className="px-4 py-3 text-ink-muted">{formatDate(b.date)}</td>
            <td className="px-4 py-3">
              <span className={`badge ${b.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {b.status}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-1">
                <button onClick={() => startEdit(b)} className="btn-ghost h-8 w-8 p-0" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(b)} className="btn-ghost h-8 w-8 p-0 text-red-600 hover:bg-red-50" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit post' : 'New post'}
        size="lg"
        footer={(
          <>
            <button onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
            <button onClick={save} className="btn-primary">Save</button>
          </>
        )}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input name="title" className="field" value={form.title} onChange={update} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Author</label>
              <input name="author" className="field" value={form.author} onChange={update} />
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" value={form.status} onChange={update} className="field">
                <option>Draft</option>
                <option>Published</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Excerpt</label>
            <textarea name="excerpt" rows={4} className="field resize-none" value={form.excerpt} onChange={update} placeholder="Short summary…" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
