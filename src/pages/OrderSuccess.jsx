import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';

export default function OrderSuccess() {
  const { id } = useParams();
  return (
    <div className="container-page flex flex-col items-center py-16 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 animate-slide-up">
        <CheckCircle2 className="h-10 w-10" />
      </span>
      <h1 className="mt-6 text-3xl font-bold">Order confirmed!</h1>
      <p className="mt-2 max-w-md text-ink-muted">
        Thank you for your purchase. We've emailed your receipt and will notify you when your order ships.
      </p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white px-6 py-4">
        <p className="text-sm text-ink-muted">Order number</p>
        <p className="text-lg font-bold tracking-wide">#{id}</p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to={`/track?id=${id}`} className="btn-primary"><Package className="h-4 w-4" /> Track order</Link>
        <Link to="/shop" className="btn-outline">Continue shopping <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}
