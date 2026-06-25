import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X, ImagePlus, Info, Tags, Award, Layers, Boxes } from 'lucide-react';
import toast from 'react-hot-toast';
import { catalogService } from '../../services/catalogService';
import { required } from '../../utils/validators';
import Spinner from '../../components/common/Spinner';

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="card p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h2 className="font-semibold text-ink">{title}</h2>
          {description && <p className="text-sm text-ink-muted">{description}</p>}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '', slug: '', description: '',
    price: '', mrp: '',
    categoryId: '', brandId: '',
    images: [''],
    sizes: [], colors: [],
    stock: '', sku: '', featured: false,
  });

  useEffect(() => {
    Promise.all([catalogService.getCategories(), catalogService.getBrands()])
      .then(([cats, brs]) => {
        setCategories(Array.isArray(cats) ? cats : cats?.content || []);
        setBrands(Array.isArray(brs) ? brs : brs?.content || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    setLoading(true);
    catalogService.getProducts({ size: 100 })
      .then((data) => {
        const p = (data?.content || []).find((x) => String(x.id) === String(id));
        if (active && p) {
          setForm({
            name: p.name, slug: p.slug, description: p.description || '',
            price: p.price, mrp: p.mrp,
            categoryId: p.categoryId, brandId: p.brandId,
            images: p.images?.length ? p.images : [''],
            sizes: p.variants?.sizes || [], colors: p.variants?.colors || [],
            stock: p.stock, sku: p.sku || '', featured: !!p.featured,
          });
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, isEdit]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const onName = (value) => setForm((f) => ({ ...f, name: value, slug: slugify(value) }));

  // Images
  const setImage = (i, val) => setForm((f) => ({ ...f, images: f.images.map((im, idx) => (idx === i ? val : im)) }));
  const addImage = () => setForm((f) => ({ ...f, images: [...f.images, ''] }));
  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  // Variant chips
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const addChip = (key, value, clear) => {
    const v = value.trim();
    if (!v) return;
    setForm((f) => (f[key].includes(v) ? f : { ...f, [key]: [...f[key], v] }));
    clear('');
  };
  const removeChip = (key, value) => setForm((f) => ({ ...f, [key]: f[key].filter((x) => x !== value) }));

  const validate = () => {
    const next = {};
    if (!required(form.name)) next.name = 'Product name is required';
    if (!form.price || Number(form.price) <= 0) next.price = 'Enter a valid price';
    if (form.mrp && Number(form.mrp) < Number(form.price)) next.mrp = 'MRP should be ≥ price';
    if (!form.categoryId) next.categoryId = 'Select a category';
    if (!form.brandId) next.brandId = 'Select a brand';
    if (form.stock === '' || Number(form.stock) < 0) next.stock = 'Enter stock quantity';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setSaving(true);
    // No write endpoint wired in Phase 1 demo — simulate persistence.
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success(isEdit ? 'Product updated' : 'Product created');
    navigate('/admin/products');
  };

  if (loading) {
    return <div className="flex justify-center py-16 text-brand-600"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="max-w-3xl">
      <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink">
        {isEdit ? 'Edit product' : 'New product'}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">Fill in the details below, then save to publish.</p>

      <div className="mt-6 space-y-5">
        {/* Basic info */}
        <Section icon={Info} title="Basic information" description="Name, description, and pricing.">
          <div className="space-y-4">
            <div>
              <label className="label">Product name</label>
              <input className="field" value={form.name} onChange={(e) => onName(e.target.value)} placeholder="e.g. Classic Cotton Shirt" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="label">Slug</label>
              <input className="field" value={form.slug} onChange={(e) => update('slug', slugify(e.target.value))} placeholder="auto-generated" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea rows={4} className="field resize-none" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the product…" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Selling price (₹)</label>
                <input type="number" className="field" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="0" />
                {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
              </div>
              <div>
                <label className="label">MRP (₹)</label>
                <input type="number" className="field" value={form.mrp} onChange={(e) => update('mrp', e.target.value)} placeholder="0" />
                {errors.mrp && <p className="mt-1 text-xs text-red-600">{errors.mrp}</p>}
              </div>
            </div>
          </div>
        </Section>

        {/* Images */}
        <Section icon={ImagePlus} title="Images" description="Add image URLs. The first is used as the cover.">
          <div className="space-y-3">
            {form.images.map((img, i) => (
              <div key={i} className="flex items-center gap-3">
                {img ? (
                  <img src={img} alt="" className="h-12 w-12 rounded-lg object-cover" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
                ) : (
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-400"><ImagePlus className="h-5 w-5" /></span>
                )}
                <input className="field flex-1" value={img} onChange={(e) => setImage(i, e.target.value)} placeholder="https://…" />
                {form.images.length > 1 && (
                  <button onClick={() => removeImage(i)} className="btn-ghost h-9 w-9 p-0 text-red-600 hover:bg-red-50" aria-label="Remove image">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addImage} className="btn-outline h-9 text-sm"><Plus className="h-4 w-4" /> Add image</button>
          </div>
        </Section>

        {/* Category & Brand */}
        <Section icon={Tags} title="Category & brand" description="Classify the product for browsing and filters.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Category</label>
              <select className="field" value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>}
            </div>
            <div>
              <label className="label flex items-center gap-1"><Award className="h-3.5 w-3.5" /> Brand</label>
              <select className="field" value={form.brandId} onChange={(e) => update('brandId', e.target.value)}>
                <option value="">Select brand</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {errors.brandId && <p className="mt-1 text-xs text-red-600">{errors.brandId}</p>}
            </div>
          </div>
        </Section>

        {/* Variants */}
        <Section icon={Layers} title="Variants" description="Optional sizes and colors for this product.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Sizes</label>
              <div className="flex gap-2">
                <input
                  className="field" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChip('sizes', sizeInput, setSizeInput))}
                  placeholder="e.g. M then Enter"
                />
                <button onClick={() => addChip('sizes', sizeInput, setSizeInput)} className="btn-outline h-[42px] px-3"><Plus className="h-4 w-4" /></button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.sizes.map((s) => (
                  <span key={s} className="chip gap-1">{s}<button onClick={() => removeChip('sizes', s)}><X className="h-3 w-3" /></button></span>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Colors</label>
              <div className="flex gap-2">
                <input
                  className="field" value={colorInput} onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChip('colors', colorInput, setColorInput))}
                  placeholder="e.g. Navy then Enter"
                />
                <button onClick={() => addChip('colors', colorInput, setColorInput)} className="btn-outline h-[42px] px-3"><Plus className="h-4 w-4" /></button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.colors.map((c) => (
                  <span key={c} className="chip gap-1">{c}<button onClick={() => removeChip('colors', c)}><X className="h-3 w-3" /></button></span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Inventory */}
        <Section icon={Boxes} title="Inventory" description="Stock level and SKU.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Stock quantity</label>
              <input type="number" className="field" value={form.stock} onChange={(e) => update('stock', e.target.value)} placeholder="0" />
              {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
            </div>
            <div>
              <label className="label">SKU (optional)</label>
              <input className="field" value={form.sku} onChange={(e) => update('sku', e.target.value)} placeholder="e.g. SM-SHIRT-001" />
            </div>
          </div>
          <label className="mt-4 inline-flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            Mark as featured product
          </label>
        </Section>

        <div className="flex justify-end gap-2 pb-4">
          <Link to="/admin/products" className="btn-ghost">Cancel</Link>
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? <Spinner /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving…' : isEdit ? 'Update product' : 'Create product'}
          </button>
        </div>
      </div>
    </div>
  );
}
