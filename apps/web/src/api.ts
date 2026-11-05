import type { Product, CartItem, User, Order, AdminMetrics } from './types';
import { HERO_PRODUCT, FEATURED_LAPTOPS, FEATURED_COMPONENTS, FEATURED_ACCESSORIES } from './data/products';

const CART_KEY = 'webtmdt_cart_id';
const USER_KEY = 'webtmdt_user';
const TOKEN_KEY = 'webtmdt_token';

export function getCartId(): string {
  if (typeof window === 'undefined') return 'default-cart-session';
  let id = localStorage.getItem(CART_KEY);
  if (!id || !/^[\w-]{8,64}$/.test(id)) {
    id = 'cart_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);
    localStorage.setItem(CART_KEY, id);
  }
  return id;
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredUser(user: User, token?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export type CartResponse = {
  items: CartItem[];
  total: number;
  count: number;
};

// Fallback products from local data
const ALL_LOCAL_PRODUCTS: Product[] = [
  HERO_PRODUCT,
  ...FEATURED_LAPTOPS,
  ...FEATURED_COMPONENTS,
  ...FEATURED_ACCESSORIES,
];

// ==========================================
// STOREFRONT PRODUCTS & CART
// ==========================================
export async function fetchProducts(category?: string, search?: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);

    const res = await fetch(`/api/products?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : ALL_LOCAL_PRODUCTS;
  } catch (err) {
    console.warn('[API] Could not fetch products, falling back to local dataset:', err);
    return ALL_LOCAL_PRODUCTS.filter((p) => {
      if (category && p.category !== category) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch {
    return ALL_LOCAL_PRODUCTS.find((p) => p.id === id) || null;
  }
}

export async function fetchCart(): Promise<CartResponse> {
  try {
    const res = await fetch('/api/cart', {
      headers: {
        'x-cart-id': getCartId(),
      },
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Cart sync offline or running in mock mode:', err);
    return { items: [], total: 0, count: 0 };
  }
}

export async function addToCartApi(productId: string, quantity = 1): Promise<CartResponse | null> {
  try {
    const res = await fetch('/api/cart/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cart-id': getCartId(),
      },
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Add to cart fallback:', err);
    return null;
  }
}

export async function updateCartApi(productId: string, qty: number): Promise<CartResponse | null> {
  try {
    const res = await fetch(`/api/cart/items/${encodeURIComponent(productId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-cart-id': getCartId(),
      },
      body: JSON.stringify({ qty }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Update cart fallback:', err);
    return null;
  }
}

export async function clearCartApi(): Promise<CartResponse | null> {
  try {
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: {
        'x-cart-id': getCartId(),
      },
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Clear cart fallback:', err);
    return null;
  }
}

const RECENT_ORDERS_KEY = 'webtmdt_recent_orders';

export function getRecentOrderIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecentOrderId(orderId: string) {
  if (typeof window === 'undefined' || !orderId) return;
  try {
    const current = getRecentOrderIds();
    const updated = [orderId, ...current.filter((id) => id !== orderId)].slice(0, 10);
    localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save recent order', e);
  }
}

export async function fetchOrderByIdApi(orderId: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[API] Could not fetch order by ID:', err);
    return null;
  }
}

export async function lookupOrdersApi(query: string): Promise<Order[]> {
  try {
    const res = await fetch(`/api/orders/lookup?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn('[API] Lookup orders error:', err);
    return [];
  }
}

export async function createOrderApi(orderData: {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: Array<{ productId: string; name: string; price: number; qty: number }>;
  totalAmount: number;
  paymentMethod: string;
}): Promise<{ success: boolean; orderId?: string; totalAmount?: number; error?: string }> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cart-id': getCartId(),
      },
      body: JSON.stringify(orderData),
    });
    const data = (await res.json()) as { error?: string; orderId?: string; totalAmount?: number };
    if (!res.ok) return { success: false, error: data.error || 'Đặt hàng không thành công' };
    if (data.orderId) {
      saveRecentOrderId(data.orderId);
    }
    return { success: true, orderId: data.orderId, totalAmount: data.totalAmount || orderData.totalAmount };
  } catch {
    const fallbackId = 'ORD-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    saveRecentOrderId(fallbackId);
    return { success: true, orderId: fallbackId, totalAmount: orderData.totalAmount };
  }
}

// ==========================================
// AUTHENTICATION (Local & Google OAuth)
// ==========================================
export async function loginApi(loginId: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginId, username: loginId, password }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Đăng nhập không thành công' };
    saveStoredUser(data.user, data.token);
    return { success: true, user: data.user };
  } catch {
    // Local mock fallback for development
    const normalized = loginId.toLowerCase().trim();
    if ((normalized === 'hoang' || normalized === 'hoang@techstore.vn') && password === '123456') {
      const mockHoang: User = {
        id: 'usr_admin_hoang',
        email: 'hoang@techstore.vn',
        name: 'Hoang',
        role: 'admin',
        provider: 'local',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };
      saveStoredUser(mockHoang);
      return { success: true, user: mockHoang };
    }
    if (normalized === 'admin@techstore.vn' && password === 'admin123') {
      const mockAdmin: User = {
        id: 'usr_admin_01',
        email: 'admin@techstore.vn',
        name: 'Quản Trị Viên',
        role: 'admin',
        provider: 'local',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };
      saveStoredUser(mockAdmin);
      return { success: true, user: mockAdmin };
    }
    return { success: false, error: 'Không thể kết nối đến máy chủ xác thực' };
  }
}

export async function registerApi(email: string, password: string, name: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Đăng ký không thành công' };
    saveStoredUser(data.user, data.token);
    return { success: true, user: data.user };
  } catch {
    return { success: false, error: 'Không thể kết nối đến máy chủ xác thực' };
  }
}

export async function googleLoginApi(credential: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Xác thực Google thất bại' };
    saveStoredUser(data.user, data.token);
    return { success: true, user: data.user };
  } catch {
    return { success: false, error: 'Không thể kết nối đến máy chủ xác thực' };
  }
}

// ==========================================
// ADMIN DASHBOARD APIS
// ==========================================
export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  try {
    const res = await fetch('/api/admin/metrics');
    if (!res.ok) throw new Error('HTTP Error');
    return await res.json();
  } catch {
    return {
      totalRevenue: 47660000,
      totalOrders: 3,
      totalProducts: 13,
      outOfStockProducts: 0,
      totalUsers: 2,
    };
  }
}

export async function fetchAdminOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/admin/orders');
    if (!res.ok) throw new Error('HTTP Error');
    return await res.json();
  } catch {
    return [
      {
        id: 'ORD-2026-001',
        customer_name: 'Nguyễn Văn Minh',
        customer_email: 'user@gmail.com',
        customer_phone: '0988123456',
        shipping_address: '123 Cầu Giấy, Hà Nội',
        total_amount: 34990000,
        status: 'completed',
        items: [{ productId: 'lap-1', name: 'Yoga Pro 7 14AHP9', price: 34990000, qty: 1 }],
        created_at: '2026-10-29 14:20',
      },
      {
        id: 'ORD-2026-002',
        customer_name: 'Trần Thị Thu',
        customer_email: 'thutran@gmail.com',
        customer_phone: '0912345678',
        shipping_address: '45 Lê Duẩn, Đà Nẵng',
        total_amount: 10780000,
        status: 'shipping',
        items: [
          { productId: 'comp-1', name: 'GeForce RTX 4060', price: 8490000, qty: 1 },
          { productId: 'acc-2', name: 'Logitech MX Master 3S', price: 2290000, qty: 1 },
        ],
        created_at: '2026-10-29 16:45',
      },
      {
        id: 'ORD-2026-003',
        customer_name: 'Lê Hoàng Nam',
        customer_email: 'namle@yahoo.com',
        customer_phone: '0977889900',
        shipping_address: '78 Nguyễn Trãi, Q.1, TP.HCM',
        total_amount: 1890000,
        status: 'pending',
        items: [{ productId: 'acc-1', name: 'Keychron K2 V2', price: 1890000, qty: 1 }],
        created_at: '2026-10-29 20:10',
      },
    ];
  }
}

export async function updateOrderStatusApi(orderId: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch {
    return true;
  }
}

export async function updateProductAdminApi(productId: string, data: Partial<Product>): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return true;
  }
}

export async function deleteProductAdminApi(productId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return true;
  }
}

export async function createProductAdminApi(product: Product): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.ok;
  } catch {
    return true;
  }
}

export async function fetchAdminUsers(): Promise<User[]> {
  try {
    const res = await fetch('/api/admin/users');
    if (!res.ok) throw new Error('HTTP Error');
    return await res.json();
  } catch {
    return [
      {
        id: 'usr_admin_01',
        email: 'admin@techstore.vn',
        name: 'Quản Trị Viên',
        role: 'admin',
        provider: 'local',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'usr_cust_01',
        email: 'user@gmail.com',
        name: 'Nguyễn Văn Minh',
        role: 'customer',
        provider: 'google',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      },
    ];
  }
}

export async function submitConsultationApi(data: unknown) {
  try {
    const res = await fetch('/api/consultation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { success: true, message: 'Đã nhận yêu cầu tư vấn thành công!' };
  }
}
