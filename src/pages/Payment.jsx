import { useState } from 'react';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  ShieldCheck, ShoppingCart, MapPin, Check, ChevronDown, Loader2, CheckCircle2,
  Landmark, Wallet, Banknote, CreditCard, Smartphone, ArrowRight, RotateCcw, Award, Headphones, Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../hooks/useCart';
import { accountService } from '../services/accountService';
import { apiError } from '../services/api';
import { addNotification } from '../redux/slices/notificationSlice';
import { formatPrice } from '../utils/format';
import Logo from '../components/common/Logo';

const STEPS = [
  { label: 'Cart', icon: ShoppingCart, done: true },
  { label: 'Address', icon: MapPin, done: true },
  { label: 'Payment', icon: null, active: true },
  { label: 'Confirm Order', icon: Check },
];

const BANKS = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank', 'Yes Bank'];

function Pill({ children }) {
  return <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-ink-soft">{children}</span>;
}

function Option({ id, selected, onSelect, icon: Icon, title, subtitle, right, children }) {
  const active = selected === id;
  return (
    <div className={`rounded-xl border transition ${active ? 'border-brand-600 bg-brand-50/40' : 'border-slate-200'}`}>
      <button onClick={() => onSelect(id)} className="flex w-full items-center gap-3 p-4 text-left">
        <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${active ? 'border-brand-600' : 'border-slate-300'}`}>
          {active && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
        </span>
        {Icon && <Icon className="h-5 w-5 shrink-0 text-ink-soft" />}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink">{title}</span>
          {subtitle && <span className="block text-xs text-ink-muted">{subtitle}</span>}
        </span>
        {right}
      </button>
      {active && children && <div className="border-t border-slate-100 p-4">{children}</div>}
    </div>
  );
}

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { clear } = useCart();
  const ctx = location.state;

  const [method, setMethod] = useState('RAZORPAY');
  const [bank, setBank] = useState(BANKS[0]);
  const [phase, setPhase] = useState('idle'); // idle | processing | done
  const [statusText, setStatusText] = useState('');

  if (!ctx?.total) return <Navigate to="/cart" replace />;
  const { total, items = [], subtotal = 0, shipping = 0, address, discount = 0, couponCode } = ctx;

  const finalize = async () => {
    const payload = {
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size, color: i.color })),
      shippingAddress: address, paymentMethod: method, amount: total,
    };
    let orderId;
    try {
      const order = await accountService.placeOrder(payload);
      orderId = order.id || order.orderId;
    } catch (err) {
      if (err?.response) { toast.error(apiError(err)); setPhase('idle'); return; }
      orderId = `SM-${Date.now().toString().slice(-6)}`;
    }
    clear();
    dispatch(addNotification({
      category: 'ORDER',
      icon: 'box',
      title: method === 'COD' ? 'Order placed' : 'Payment successful',
      body: `Your order ${orderId} has been confirmed. We'll notify you when it ships.`,
      link: `/dashboard/orders/${orderId}`,
    }));
    navigate(`/order-success/${orderId}`, { replace: true });
  };

  const pay = async () => {
    setPhase('processing');
    const steps = method === 'COD'
      ? ['Placing your order...']
      : ['Redirecting to secure gateway...', 'Authorizing payment...', 'Confirming your order...'];
    for (const s of steps) {
      setStatusText(s);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 850));
    }
    setPhase('done');
    setStatusText('Payment confirmed');
    await new Promise((r) => setTimeout(r, 500));
    await finalize();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Minimal secure-checkout header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <ShieldCheck className="h-4 w-4" /> 100% Secure Checkout
          </span>
        </div>
      </header>

      <div className="container-page py-8">
        {/* Stepper */}
        <div className="mx-auto mb-8 flex max-w-3xl items-center">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const reached = s.done || s.active;
            return (
              <div key={s.label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <span className={`grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-semibold ${
                    s.active ? 'border-brand-600 bg-brand-600 text-white'
                    : s.done ? 'border-brand-600 bg-white text-brand-600'
                    : 'border-slate-300 bg-white text-slate-400'}`}>
                    {s.done ? <Check className="h-4 w-4" /> : Icon ? <Icon className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className={`mt-1.5 text-xs font-medium ${reached ? 'text-brand-700' : 'text-ink-muted'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`mx-2 h-0.5 flex-1 ${s.done ? 'bg-brand-600' : 'bg-slate-200'}`} />}
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Payment options */}
          <div className="card p-6">
            {phase !== 'idle' ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                {phase === 'done'
                  ? <CheckCircle2 className="h-14 w-14 text-emerald-500 animate-pop" />
                  : <Loader2 className="h-14 w-14 animate-spin text-brand-600" />}
                <p className="text-lg font-semibold text-ink">{statusText}</p>
                <p className="text-sm text-ink-muted">Please don't close or refresh this page.</p>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-ink">Payment</h1>
                <p className="mt-1 text-sm text-ink-muted">All transactions are secure and encrypted</p>

                <p className="mt-6 text-sm font-semibold text-ink">Recommended</p>
                <div className="mt-2">
                  <Option
                    id="RAZORPAY" selected={method} onSelect={setMethod} icon={Smartphone}
                    title="Razorpay" subtitle="Pay using Cards, UPI, Netbanking, Wallets & more"
                    right={<span className="hidden items-center gap-1 sm:flex"><Pill>VISA</Pill><Pill>MC</Pill><Pill>UPI</Pill><Pill>+5</Pill></span>}
                  />
                </div>

                <p className="mt-6 text-sm font-semibold text-ink">Other Payment Options</p>
                <div className="mt-2 space-y-2.5">
                  <Option id="UPI" selected={method} onSelect={setMethod} icon={Smartphone}
                    title="UPI" subtitle="Pay using any UPI App"
                    right={<span className="hidden items-center gap-1 sm:flex"><Pill>GPay</Pill><Pill>PhonePe</Pill><Pill>Paytm</Pill></span>} />

                  <Option id="CARD" selected={method} onSelect={setMethod} icon={CreditCard}
                    title="Credit / Debit / ATM Card"
                    right={<span className="hidden items-center gap-1 sm:flex"><Pill>VISA</Pill><Pill>MC</Pill><Pill>RuPay</Pill></span>} />

                  <Option id="NETBANKING" selected={method} onSelect={setMethod} icon={Landmark}
                    title="Net Banking" subtitle="Pay using your Net Banking"
                    right={<ChevronDown className="h-4 w-4 text-slate-400" />}>
                    <label className="label">Select your bank</label>
                    <select value={bank} onChange={(e) => setBank(e.target.value)} className="field">
                      {BANKS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </Option>

                  <Option id="WALLET" selected={method} onSelect={setMethod} icon={Wallet}
                    title="Wallets" subtitle="Pay using Wallets"
                    right={<span className="hidden items-center gap-1 sm:flex"><Pill>Paytm</Pill><Pill>Mobikwik</Pill><Pill>Amazon</Pill></span>} />

                  <Option id="COD" selected={method} onSelect={setMethod} icon={Banknote}
                    title="Cash on Delivery (COD)" subtitle="Pay when you receive the order"
                    right={<span className="badge bg-emerald-100 text-emerald-700">Available</span>} />
                </div>

                <p className="mt-5 flex items-center gap-1.5 text-xs text-ink-muted">
                  <Lock className="h-3.5 w-3.5" /> Your payment information is secure and encrypted
                </p>

                <button onClick={pay} className="btn-primary mt-5 h-12 w-full text-base">
                  {method === 'COD' ? 'Place Order' : 'Pay Now'} {formatPrice(total)} <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-2 text-center text-xs text-ink-muted">You will be redirected to secure payment page</p>
              </>
            )}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="card p-5">
              <h2 className="font-semibold text-ink">Order Summary</h2>
              <ul className="mt-4 space-y-3">
                {items.map((i, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <img src={i.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{i.name}</p>
                      <p className="text-xs text-ink-muted">Qty: {i.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-ink">{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-ink-muted">Subtotal ({items.length} items)</dt><dd className="font-medium">{formatPrice(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-muted">Shipping</dt><dd className="font-semibold text-emerald-600">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-muted">Discount{couponCode ? ` (${couponCode})` : ''}</dt><dd className="font-medium">- {formatPrice(discount)}</dd></div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-ink"><dt>Total Amount</dt><dd>{formatPrice(total)}</dd></div>
              </dl>
              <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700">
                You will save {formatPrice(discount)} on this order
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 pt-4 text-center">
                {[
                  { icon: ShieldCheck, label: 'Secure Payments' },
                  { icon: RotateCcw, label: 'Easy Returns' },
                  { icon: Award, label: '100% Original' },
                  { icon: Headphones, label: '24/7 Support' },
                ].map((t) => (
                  <div key={t.label} className="flex flex-col items-center gap-1">
                    <t.icon className="h-5 w-5 text-brand-600" />
                    <span className="text-[10px] leading-tight text-ink-muted">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-xl bg-brand-50 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-ink">Safe &amp; Secure Payments</p>
                <p className="text-xs text-ink-muted">Your payment details are protected with 256-bit SSL encryption.</p>
              </div>
            </div>

            <Link to="/checkout" className="mt-4 block text-center text-sm text-ink-muted hover:text-brand-700">← Back to checkout</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
