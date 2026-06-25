// App-wide constants

export const APP_NAME = 'ShopMart';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// localStorage keys
export const STORAGE = {
  ACCESS_TOKEN: 'sm_access_token',
  REFRESH_TOKEN: 'sm_refresh_token',
  USER: 'sm_user',
  CART_GUEST: 'sm_cart_guest',
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const ORDER_STATUS_META = {
  PENDING: { label: 'Pending', tone: 'bg-amber-100 text-amber-700' },
  CONFIRMED: { label: 'Confirmed', tone: 'bg-blue-100 text-blue-700' },
  PROCESSING: { label: 'Processing', tone: 'bg-indigo-100 text-indigo-700' },
  SHIPPED: { label: 'Shipped', tone: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Delivered', tone: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Cancelled', tone: 'bg-red-100 text-red-700' },
};

export const PAYMENT_METHODS = [
  { id: 'CARD', label: 'Credit / Debit Card' },
  { id: 'UPI', label: 'UPI' },
  { id: 'NETBANKING', label: 'Net Banking' },
  { id: 'COD', label: 'Cash on Delivery' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export const ROLES = { SUPER_ADMIN: 'SUPER_ADMIN', ADMIN: 'ADMIN', CUSTOMER: 'CUSTOMER' };
