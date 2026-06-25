import api from './api';

// Demo notifications so the bell and notifications page are populated without a backend.
export const mockNotifications = [
  {
    id: 'n-1', category: 'ORDER', icon: 'truck', title: 'Your order is in transit',
    body: 'Great news! Your order #SM-100238 is on the way and will be delivered by 02 Jun 2026.',
    link: '/track?id=SM-100238', read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'n-approval', category: 'UPDATES', icon: 'approval', title: 'New product pending approval',
    body: 'Priya submitted “Cotton Casual Shirt” for review. Approve or reject it from Product Approvals.',
    link: '/superadmin/approvals', read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'n-order-placed', category: 'ORDER', icon: 'box', title: 'New order placed',
    body: 'Order #SM-100240 was placed for ₹3,499.',
    link: '/admin/orders', read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: 'n-admin-created', category: 'ACCOUNT', icon: 'admin', title: 'Admin created',
    body: 'A new admin “Vikram Rao” was added to the platform.',
    link: '/superadmin/admins', read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'n-2', category: 'ORDER', icon: 'box', title: 'Order delivered successfully',
    body: 'Your order #SM-100195 has been delivered successfully. Thank you for shopping with us!',
    link: '/dashboard/orders/SM-100195', read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'n-3', category: 'OFFER', icon: 'tag', title: 'Exclusive offer for you!',
    body: 'Get flat 20% OFF on your next purchase. Use code: SAVE20. Valid till 30 Jun 2026.',
    link: '/shop', read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'n-4', category: 'UPDATES', icon: 'star', title: 'Review your recent purchase',
    body: 'We\u2019d love to hear your feedback on Smart Fitness Watch. Your review helps other customers.',
    link: '/dashboard/orders', read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 'n-5', category: 'ACCOUNT', icon: 'shield', title: 'Password changed successfully',
    body: 'Your account password was changed successfully. If this wasn\u2019t you, please contact support.',
    link: '/dashboard/settings', read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'n-6', category: 'OFFER', icon: 'bell', title: 'Price drop alert',
    body: 'We found a price drop on Bluetooth Bookshelf Speakers. Check it out now!',
    link: '/shop', read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'n-7', category: 'OFFER', icon: 'gift', title: 'Happy Birthday! \uD83C\uDF89',
    body: 'Here\u2019s a special 10% OFF just for you. Use code: BDAY10.',
    link: '/shop', read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
];

export const notificationService = {
  async list() {
    try {
      const { data } = await api.get('/notifications');
      return Array.isArray(data) ? data : data?.content || [];
    } catch (err) {
      if (!err?.response) return mockNotifications;
      throw err;
    }
  },
  async markRead(id) {
    try { await api.put(`/notifications/${id}/read`); } catch { /* demo no-op */ }
  },
  async markAllRead() {
    try { await api.put('/notifications/read-all'); } catch { /* demo no-op */ }
  },
};
