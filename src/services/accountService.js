import api from './api';

// Authenticated account + commerce operations (cart, wishlist, orders, profile).
// These hit the backend; callers handle errors. Cart/wishlist also keep a local
// mirror in Redux so the UI stays responsive.

export const accountService = {
  // Profile
  getProfile: () => api.get('/users/me').then((r) => r.data),
  updateProfile: (payload) => api.put('/users/me', payload).then((r) => r.data),
  changePassword: (payload) => api.put('/users/me/password', payload).then((r) => r.data),

  // Addresses
  getAddresses: () => api.get('/users/me/addresses').then((r) => r.data),
  addAddress: (payload) => api.post('/users/me/addresses', payload).then((r) => r.data),
  updateAddress: (id, payload) => api.put(`/users/me/addresses/${id}`, payload).then((r) => r.data),
  deleteAddress: (id) => api.delete(`/users/me/addresses/${id}`).then((r) => r.data),

  // Cart
  getCart: () => api.get('/cart').then((r) => r.data),
  addToCart: (payload) => api.post('/cart/items', payload).then((r) => r.data),
  updateCartItem: (itemId, qty) => api.put(`/cart/items/${itemId}`, { quantity: qty }).then((r) => r.data),
  removeCartItem: (itemId) => api.delete(`/cart/items/${itemId}`).then((r) => r.data),
  clearCart: () => api.delete('/cart').then((r) => r.data),

  // Wishlist
  getWishlist: () => api.get('/wishlist').then((r) => r.data),
  addToWishlist: (productId) => api.post('/wishlist/items', { productId }).then((r) => r.data),
  removeFromWishlist: (productId) => api.delete(`/wishlist/items/${productId}`).then((r) => r.data),

  // Orders
  getOrders: () => api.get('/orders').then((r) => r.data),
  getOrder: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  placeOrder: (payload) => api.post('/orders', payload).then((r) => r.data),
  trackOrder: (id) => api.get(`/orders/${id}/tracking`).then((r) => r.data),

  // Payments
  getPaymentMethods: () => api.get('/users/me/payment-methods').then((r) => r.data),
  createPayment: (payload) => api.post('/payments', payload).then((r) => r.data),
};
