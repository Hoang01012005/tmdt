export interface Product {
  id: string;
  brand: string;
  name: string;
  category: 'laptop' | 'component' | 'accessory';
  subCategory: string; // 'office' | 'gaming' | 'design' | 'gpu' | 'cpu' | 'ssd' | 'ram' | 'mainboard' | 'keyboard' | 'mouse' | 'monitor'
  specs: string[];
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  tag?: string;
  rating?: number;
  inStock: boolean;
  description?: string;
}

export interface CategoryItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  link: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'customer' | 'admin';
  provider: 'local' | 'google';
}

export interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  items: Array<{ productId: string; name: string; price: number; qty: number }>;
  created_at: string;
}

export interface AdminMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  outOfStockProducts: number;
  totalUsers: number;
}
