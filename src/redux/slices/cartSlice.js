import { createSlice } from '@reduxjs/toolkit';
import { STORAGE } from '../../utils/constants';

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE.CART_GUEST)) || []; } catch { return []; }
};
const persist = (items) => localStorage.setItem(STORAGE.CART_GUEST, JSON.stringify(items));

const COUPON_KEY = 'shopmart-coupon';
const loadCoupon = () => {
  try { return localStorage.getItem(COUPON_KEY) || null; } catch { return null; }
};
const persistCoupon = (code) => {
  try { if (code) localStorage.setItem(COUPON_KEY, code); else localStorage.removeItem(COUPON_KEY); } catch { /* ignore */ }
};

// Stable line key combining product + chosen variant.
const lineKey = (item) => `${item.productId}-${item.size || ''}-${item.color || ''}`;

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: load(), coupon: loadCoupon() },
  reducers: {
    addItem(state, action) {
      const incoming = action.payload;
      const key = lineKey(incoming);
      const existing = state.items.find((i) => lineKey(i) === key);
      if (existing) {
        existing.quantity += incoming.quantity || 1;
      } else {
        state.items.push({ ...incoming, quantity: incoming.quantity || 1 });
      }
      persist(state.items);
    },
    updateQuantity(state, action) {
      const { key, quantity } = action.payload;
      const item = state.items.find((i) => lineKey(i) === key);
      if (item) item.quantity = Math.max(1, quantity);
      persist(state.items);
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => lineKey(i) !== action.payload);
      persist(state.items);
    },
    clearCart(state) {
      state.items = [];
      state.coupon = null;
      persist(state.items);
      persistCoupon(null);
    },
    setCart(state, action) {
      state.items = action.payload || [];
      persist(state.items);
    },
    setCoupon(state, action) {
      state.coupon = action.payload || null;
      persistCoupon(state.coupon);
    },
    clearCoupon(state) {
      state.coupon = null;
      persistCoupon(null);
    },
  },
});

export const { addItem, updateQuantity, removeItem, clearCart, setCart, setCoupon, clearCoupon } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (s) => s.cart.items;
export const selectCartCount = (s) => s.cart.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartSubtotal = (s) =>
  s.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export const selectCoupon = (s) => s.cart.coupon;
export const cartLineKey = lineKey;
