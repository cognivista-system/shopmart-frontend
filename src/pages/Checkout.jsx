import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapPin, CreditCard, Check } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { selectCoupon } from '../redux/slices/cartSlice';
import { evaluateCoupon, findCoupon } from '../utils/coupons';
import { formatPrice } from '../utils/format';
import { PAYMENT_METHODS } from '../utils/constants';

const STEPS = ['Address', 'Payment', 'Review'];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal } = useCart();
  const { user } = useAuth();
  const couponCode = useSelector(selectCoupon);

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({
    name: user?.name || '', phone: '', line1: '', line2: '',
    city: '', state: '', pincode: '',
  });
  const [payment, setPayment] = useState('CARD');

  const applied = couponCode ? findCoupon(couponCode) : null;
  const evalRes = applied ? evaluateCoupon(applied, subtotal) : { ok: false, discount: 0 };
  const baseShipping = subtotal > 999 || subtotal === 0 ? 0 : 79;
  const freeShip = applied?.code === 'FREESHIP' && evalRes.ok;
  const shipping = freeShip ? 0 : baseShipping;
  const discount = freeShip ? 0 : (evalRes.ok ? evalRes.discount : 0);
  const total = Math.max(0, subtotal + shipping - discount);

  if (items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-ink-muted">Add items before checking out.</p>
        <button onClick={() => navigate('/shop')} className="btn-primary mt-6">Browse products</button>
      </div>
    );
  }

  const addressValid = address.name && address.phone && address.line1 && address.city && address.state && address.pincode;

  const proceedToPayment = () => {
    navigate('/payment', {
      state: { address, paymentMethod: payment, items, subtotal, shipping, discount, couponCode: applied?.code, total },
    });
  };

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold">Checkout</h1>

      {/* Steps */}
      <div className="mt-5 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${i <= step ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-muted'}`}>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-xs">
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              {label}
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-6 ${i < step ? 'bg-brand-600' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card p-6">
          {step === 0 && (
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><MapPin className="h-5 w-5 text-brand-600" /> Shipping address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Full name</label><input className="field" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} /></div>
                <div><label className="label">Phone</label><input className="field" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} /></div>
                <div className="sm:col-span-2"><label className="label">Address line 1</label><input className="field" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} /></div>
                <div className="sm:col-span-2"><label className="label">Address line 2 (optional)</label><input className="field" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} /></div>
                <div><label className="label">City</label><input className="field" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></div>
                <div><label className="label">State</label><input className="field" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} /></div>
                <div><label className="label">Pincode</label><input className="field" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} /></div>
              </div>
              <button disabled={!addressValid} onClick={() => setStep(1)} className="btn-primary mt-6">Continue to payment</button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><CreditCard className="h-5 w-5 text-brand-600" /> Payment method</h2>
              <div className="space-y-2.5">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${payment === m.id ? 'border-brand-600 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="pay" checked={payment === m.id} onChange={() => setPayment(m.id)} className="accent-brand-600" />
                    <span className="text-sm font-medium">{m.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(0)} className="btn-outline">Back</button>
                <button onClick={() => setStep(2)} className="btn-primary">Review order</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Review &amp; place order</h2>
              <div className="rounded-xl border border-slate-200 p-4 text-sm">
                <p className="font-semibold">{address.name} · {address.phone}</p>
                <p className="text-ink-soft">{[address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean).join(', ')}</p>
                <p className="mt-2 text-ink-muted">Payment: <span className="font-medium text-ink">{PAYMENT_METHODS.find((m) => m.id === payment)?.label}</span></p>
              </div>
              <div className="mt-4 divide-y divide-slate-100">
                {items.map((i, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-3">
                    <img src={i.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{i.name}</p>
                      <p className="text-ink-muted">Qty {i.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold">{formatPrice(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline">Back</button>
                <button onClick={proceedToPayment} className="btn-accent flex-1">
                  Proceed to payment · {formatPrice(total)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="text-lg font-semibold">Summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-ink-muted">Items ({items.length})</dt><dd className="font-medium">{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Shipping</dt><dd className="font-medium">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd></div>
              {discount > 0 && <div className="flex justify-between text-emerald-600"><dt>Discount ({applied?.code})</dt><dd className="font-medium">−{formatPrice(discount)}</dd></div>}
              <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
