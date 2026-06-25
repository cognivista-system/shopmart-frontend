import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { catalogService } from '../../services/catalogService';
import { formatPrice } from '../../utils/format';
import { AdminPageHeader, AdminTable } from '../../components/admin/AdminUI';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    let active = true;
    catalogService.getProducts({ size: 100 })
      .then((data) => { if (active) setProducts(data?.content || []); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const confirmDelete = () => {
    setProducts((list) => list.filter((p) => p.id !== toDelete.id));
    toast.success(`“${toDelete.name}” deleted`);
    setToDelete(null);
  };

  const stockBadge = (stock) => {
    if (stock === 0) return <span className="badge bg-red-100 text-red-700">Out of stock</span>;
    if (stock < 10) return <span className="badge bg-amber-100 text-amber-700">Low · {stock}</span>;
    return <span className="badge bg-emerald-100 text-emerald-700">{stock} in stock</span>;
  };

  return (
    <div>
      <AdminPageHeader
        title="Products"
        subtitle="Create, edit, and manage your catalog."
        action={<Link to="/admin/products/new" className="btn-primary"><Plus className="h-4 w-4" /> Add product</Link>}
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} className="field pl-10" placeholder="Search products…" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-brand-600"><Spinner className="h-8 w-8" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="Try a different search, or add a new product." />
      ) : (
        <AdminTable columns={['Product', 'Category', 'Brand', 'Price', 'Stock', '']}>
          {filtered.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50/60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src={p.images?.[0]} alt={p.name} className="h-11 w-11 rounded-lg object-cover" />
                  <span className="font-medium text-ink line-clamp-1">{p.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-ink-soft">{p.categoryName}</td>
              <td className="px-4 py-3 text-ink-soft">{p.brandName}</td>
              <td className="px-4 py-3 font-medium text-ink">{formatPrice(p.price)}</td>
              <td className="px-4 py-3">{stockBadge(p.stock)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Link to={`/admin/products/${p.id}/edit`} className="btn-ghost h-8 w-8 p-0" aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button onClick={() => setToDelete(p)} className="btn-ghost h-8 w-8 p-0 text-red-600 hover:bg-red-50" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete product?"
        footer={(
          <>
            <button onClick={() => setToDelete(null)} className="btn-ghost">Cancel</button>
            <button onClick={confirmDelete} className="btn-danger">Delete</button>
          </>
        )}
      >
        <p className="text-sm text-ink-muted">
          Are you sure you want to delete <span className="font-medium text-ink">{toDelete?.name}</span>? This can’t be undone.
        </p>
      </Modal>
    </div>
  );
}
