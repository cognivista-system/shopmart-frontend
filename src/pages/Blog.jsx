import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, User } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { formatDate } from '../utils/format';

const POSTS = [
  {
    id: 1,
    title: 'The 2026 Spring Edit: Trends Worth Your Wardrobe',
    excerpt: 'From relaxed tailoring to elevated basics, here are the pieces our stylists keep coming back to this season.',
    author: 'Aisha Verma',
    date: '2026-05-28',
    tag: 'Style',
    cover: 'https://picsum.photos/seed/blog1/800/500',
  },
  {
    id: 2,
    title: 'How to Build a Capsule Wardrobe That Actually Works',
    excerpt: 'A practical, no-nonsense guide to fewer, better pieces — and how to mix them into endless outfits.',
    author: 'Rohan Mehta',
    date: '2026-05-14',
    tag: 'Guides',
    cover: 'https://picsum.photos/seed/blog2/800/500',
  },
  {
    id: 3,
    title: 'Caring for Your Footwear: A Maintenance Checklist',
    excerpt: 'Make your favourite sneakers and boots last longer with these simple, seasonal care routines.',
    author: 'Neha Kapoor',
    date: '2026-04-30',
    tag: 'Care',
    cover: 'https://picsum.photos/seed/blog3/800/500',
  },
  {
    id: 4,
    title: 'Behind the Seams: How We Source Sustainable Fabrics',
    excerpt: 'A look at the partners and processes that go into every responsibly made product we stock.',
    author: 'Aisha Verma',
    date: '2026-04-12',
    tag: 'Sustainability',
    cover: 'https://picsum.photos/seed/blog4/800/500',
  },
  {
    id: 5,
    title: 'Gifting Guide: Thoughtful Picks for Every Budget',
    excerpt: 'Stuck on what to give? Our curated edit covers every personality and price point.',
    author: 'Rohan Mehta',
    date: '2026-03-22',
    tag: 'Guides',
    cover: 'https://picsum.photos/seed/blog5/800/500',
  },
  {
    id: 6,
    title: 'Five Ways to Style a Classic White Shirt',
    excerpt: 'The hardest-working piece in your closet, reimagined from boardroom to weekend.',
    author: 'Neha Kapoor',
    date: '2026-03-05',
    tag: 'Style',
    cover: 'https://picsum.photos/seed/blog6/800/500',
  },
];

export default function Blog() {
  const [featured, ...rest] = POSTS;

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog' }]} />

      <header className="mt-6 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">The ShopMart Journal</h1>
        <p className="mt-3 text-ink-muted">
          Style notes, buying guides, and stories from behind the brand — fresh perspectives to help you shop smarter.
        </p>
      </header>

      {/* Featured */}
      <article className="mt-8 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card lg:grid-cols-2">
        <div className="aspect-[16/10] overflow-hidden lg:aspect-auto">
          <img src={featured.cover} alt={featured.title} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center gap-4 p-8">
          <span className="chip w-fit">{featured.tag}</span>
          <h2 className="font-display text-2xl font-bold leading-tight text-ink">{featured.title}</h2>
          <p className="text-ink-muted">{featured.excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> {featured.author}</span>
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(featured.date)}</span>
          </div>
          <Link to="/blog" className="link inline-flex w-fit items-center gap-1.5">
            Read article <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>

      {/* Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <article key={post.id} className="card group overflow-hidden">
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={post.cover}
                alt={post.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="space-y-3 p-5">
              <span className="chip">{post.tag}</span>
              <h3 className="font-semibold leading-snug text-ink">{post.title}</h3>
              <p className="text-sm text-ink-muted">{post.excerpt}</p>
              <div className="flex items-center justify-between pt-1 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(post.date)}</span>
                <Link to="/blog" className="link inline-flex items-center gap-1">
                  Read <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
