import api from './api';
import { mockReviews } from './mockData';

export const reviewService = {
  async list(productId) {
    try {
      const { data } = await api.get(`/products/${productId}/reviews`);
      return Array.isArray(data) ? data : data?.content || [];
    } catch (err) {
      if (!err?.response) return mockReviews(productId);
      throw err;
    }
  },
  async submit(productId, payload) {
    try {
      const { data } = await api.post(`/products/${productId}/reviews`, payload);
      return data;
    } catch (err) {
      if (!err?.response) {
        // Demo fallback: echo a constructed review.
        return {
          id: `local-${Date.now()}`,
          author: payload.author || 'You',
          rating: payload.rating,
          title: payload.title,
          body: payload.body,
          date: new Date().toISOString(),
          helpful: 0,
        };
      }
      throw err;
    }
  },
};

// Build a rating distribution + average from a list of reviews.
export const summarize = (reviews = []) => {
  const total = reviews.length;
  const dist = [0, 0, 0, 0, 0]; // index 0 => 1 star … index 4 => 5 stars
  let sum = 0;
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    dist[star - 1] += 1;
    sum += r.rating;
  });
  return {
    total,
    average: total ? (sum / total) : 0,
    dist, // counts for 1..5
  };
};
