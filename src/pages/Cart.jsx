import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Tag, Check, X, BadgePercent } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useCart } from '../hooks/useCart';
import { setCoupon as setCouponAction, clearCoupon, selectCoupon } from '../redux/slices/cartSlice';
import { evaluateCoupon, findCoupon, COUPONS } from '../utils/coupons';
import QuantityStepper from '../components/common/QuantityStepper';
import EmptyState from '../components/common/EmptyState';
import { formatPrice } from '../utils/format';

export default function Cart() {
  const { items, subtotal, setQty, remove, keyOf } = useCart();
  const dispatch = useDispatch();
  const couponCode = useSelector(selectCoupon);
  const [code, setCode] = useState('');

  const applied = couponCode ? findCoupon(couponCode) : null;
  const evalResult = applied ? evaluateCoupon(applied, subtotal) : { ok: false, discount: 0 };
  const discount = evalResult.ok ? evalResult.discount : 0;

  const baseShipping = subtotal > 999 || subtotal === 0 ? 0 : 79;
  const freeShipFromCoupon = applied?.code === 'FREESHIP' && evalResult.ok;
  const shipping = freeShipFromCoupon ? 0 : baseShipping;
  const couponDiscount = freeShipFromCoupon ? 0 : discount; // FREESHIP applies to shipping, not subtotal
  const total = Math.max(0, subtotal + shipping - couponDiscount);

  const apply = (raw) => {
    const c = (raw ?? code).trim();
    if (!c) return;
    const res = evaluateCoupon(c, subtotal);
    if (!res.ok) { toast.error(res.reason); return; }
    dispatch(setCouponAction(res.coupon.code));
    setCode('');
    toast.success(`Coupon ${res.coupon.code} applied`);
  };

  const removeCoupon = () => { dispatch(clearCoupon()); toast('Coupon removed'); };

  if (items.length === 0) {
    return (
      <div className="container-page py-12">
        <h1 className="mb-6 text-2xl font-bold">Your cart</h1>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          action={<Link to="/shop" className="btn-primary">Browse products</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold">Your cart ({items.length})</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((item) => {
            const key = keyOf(item);
            return (
              <div key={key} className="card flex gap-4 p-4">
                <Link to={`/product/${item.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/product/${item.slug}`} className="font-semibold hover:text-brand-700">{item.name}</Link>
                    <button onClick={() => remove(key)} className="text-slate-400 hover:text-red-500" aria-label="Remove">
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                  {(item.size || item.color) && (
                    <p className="text-sm text-ink-muted">{[item.size, item.color].filter(Boolean).join(' · ')}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QuantityStepper size="sm" value={item.quantity} onChange={(q) => setQty(key, q)} />
                    <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="text-lg font-semibold">Order summary</h2>

            {/* Coupon */}
            {applied && evalResult.ok ? (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <Check className="h-4 w-4" /> {applied.code} applied
                </span>
                <button onClick={removeCoupon} className="text-emerald-700 hover:text-emerald-900" aria-label="Remove coupon"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <>
                <div className="mt-4 flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apply()} placeholder="Coupon code" className="field pl-9 uppercase" />
                  </div>
                  <button onClick={() => apply()} className="btn-outline">Apply</button>
                </div>
                {applied && !evalResult.ok && <p className="mt-1.5 text-xs text-red-600">{evalResult.reason}</p>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {COUPONS.slice(0, 3).map((c) => (
                    <button key={c.code} onClick={() => apply(c.code)} className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[11px] font-medium text-ink-soft hover:border-brand-400 hover:text-brand-700">
                      <BadgePercent className="h-3 w-3" /> {c.code}
                    </button>
                  ))}
                </div>
              </>
            )}

            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-ink-muted">Subtotal</dt><dd className="font-medium">{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Shipping</dt><dd className="font-medium">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd></div>
              {couponDiscount > 0 && <div className="flex justify-between text-emerald-600"><dt>Discount ({applied.code})</dt><dd className="font-medium">−{formatPrice(couponDiscount)}</dd></div>}
              <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
            </dl>

            <Link to="/checkout" className="btn-accent mt-5 w-full">
              Proceed to checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/shop" className="btn-ghost mt-2 w-full">Continue shopping</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
