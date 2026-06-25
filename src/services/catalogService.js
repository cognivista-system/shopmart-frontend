import api from './api';
import {
  mockProducts, mockCategories, mockBrands, mockReviews, mockBanners,
} from './mockData';

// Catalog reads gracefully fall back to demo data on network error,
// so the storefront is browsable before the backend is connected.
const useMock = (err) => {
  // Only fall back for connection-level failures, not for real 4xx/5xx from the API.
  if (err?.response) throw err;
  return true;
};

// Tolerate different backend response shapes: a raw array, a PageResponse
// ({ content: [...] }), or an already-unwrapped object.
const asArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  return [];
};

const asPage = (payload, fallbackItems = []) => {
  if (Array.isArray(payload)) {
    return { content: payload, totalElements: payload.length, totalPages: 1, number: 0 };
  }
  if (Array.isArray(payload?.content)) return payload;
  if (Array.isArray(payload?.data?.content)) return payload.data;
  if (Array.isArray(payload?.data)) {
    return { content: payload.data, totalElements: payload.data.length, totalPages: 1, number: 0 };
  }
  return { content: fallbackItems, totalElements: fallbackItems.length, totalPages: 1, number: 0 };
};

const paginate = (items, page = 0, size = 12) => ({
  content: items.slice(page * size, page * size + size),
  totalElements: items.length,
  totalPages: Math.max(1, Math.ceil(items.length / size)),
  number: page,
  size,
});

const applyFilters = (items, params = {}) => {
  let list = [...items];
  const { q, category, brand, minPrice, maxPrice, rating, sort } = params;
  if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  if (category) list = list.filter((p) => String(p.categoryId) === String(category) || p.categoryName?.toLowerCase().replace(/\s+/g, '-') === category);
  if (brand) list = list.filter((p) => String(p.brandId) === String(brand) || p.brandName?.toLowerCase() === String(brand).toLowerCase());
  if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
  if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));
  if (rating) list = list.filter((p) => Number(p.rating) >= Number(rating));
  switch (sort) {
    case 'price_asc': list.sort((a, b) => a.price - b.price); break;
    case 'price_desc': list.sort((a, b) => b.price - a.price); break;
    case 'rating': list.sort((a, b) => b.rating - a.rating); break;
    case 'popular': list.sort((a, b) => b.reviewCount - a.reviewCount); break;
    default: break;
  }
  return list;
};

export const catalogService = {
  async getProducts(params = {}) {
    try {
      const { data } = await api.get('/products', { params });
      return asPage(data);
    } catch (err) {
      if (useMock(err)) {
        const filtered = applyFilters(mockProducts, params);
        return paginate(filtered, params.page || 0, params.size || 12);
      }
    }
    return paginate(applyFilters(mockProducts, params), params.page || 0, params.size || 12);
  },

  async getProductBySlug(slug) {
    try {
      const { data } = await api.get(`/products/slug/${slug}`);
      return data?.data ?? data;
    } catch (err) {
      if (useMock(err)) {
        return mockProducts.find((p) => p.slug === slug) || mockProducts[0];
      }
    }
    return mockProducts.find((p) => p.slug === slug) || mockProducts[0];
  },

  async getRelated(product) {
    try {
      const { data } = await api.get(`/products/${product.id}/related`);
      return asArray(data);
    } catch (err) {
      if (useMock(err)) {
        return mockProducts.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);
      }
    }
    return [];
  },

  async getReviews(productId) {
    try {
      const { data } = await api.get(`/products/${productId}/reviews`);
      return asArray(data);
    } catch (err) {
      if (useMock(err)) return mockReviews(productId);
    }
    return mockReviews(productId);
  },

  async getCategories() {
    try {
      const { data } = await api.get('/categories');
      return asArray(data);
    } catch (err) {
      if (useMock(err)) return mockCategories;
    }
    return mockCategories;
  },

  async getBrands() {
    try {
      const { data } = await api.get('/brands');
      return asArray(data);
    } catch (err) {
      if (useMock(err)) return mockBrands;
    }
    return mockBrands;
  },

  async getBanners() {
    try {
      const { data } = await api.get('/banners');
      return asArray(data);
    } catch (err) {
      if (useMock(err)) return mockBanners;
    }
    return mockBanners;
  },

  async suggest(term) {
    const q = (term || '').trim();
    if (!q) return { products: [], categories: [] };
    try {
      const { data } = await api.get('/products', { params: { q, size: 6 } });
      return { products: asArray(data).slice(0, 6), categories: [] };
    } catch (err) {
      if (useMock(err)) {
        const lc = q.toLowerCase();
        const products = mockProducts
          .filter((p) => p.name.toLowerCase().includes(lc) || p.brandName?.toLowerCase().includes(lc) || p.categoryName?.toLowerCase().includes(lc))
          .slice(0, 6);
        const categories = mockCategories.filter((c) => c.name.toLowerCase().includes(lc)).slice(0, 4);
        return { products, categories };
      }
      return { products: [], categories: [] };
    }
  },

  async getHomeFeeds() {
    try {
      const [featured, best, fresh] = await Promise.all([
        api.get('/products', { params: { featured: true, size: 8 } }),
        api.get('/products', { params: { bestSeller: true, size: 8 } }),
        api.get('/products', { params: { newArrival: true, size: 8 } }),
      ]);
      return {
        featured: asArray(featured.data),
        bestSellers: asArray(best.data),
        newArrivals: asArray(fresh.data),
      };
    } catch (err) {
      if (useMock(err)) {
        return {
          featured: mockProducts.filter((p) => p.featured).slice(0, 8),
          bestSellers: mockProducts.filter((p) => p.bestSeller).slice(0, 8),
          newArrivals: mockProducts.filter((p) => p.newArrival).slice(0, 8),
        };
      }
    }
    return {
      featured: mockProducts.filter((p) => p.featured).slice(0, 8),
      bestSellers: mockProducts.filter((p) => p.bestSeller).slice(0, 8),
      newArrivals: mockProducts.filter((p) => p.newArrival).slice(0, 8),
    };
  },
};
