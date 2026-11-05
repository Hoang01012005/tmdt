import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  Search,
  Save,
  X,
  Eye,
  RefreshCw,
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Database,
  Bot,
  ShieldCheck,
  CreditCard,
  Phone,
  ChevronRight
} from 'lucide-react';
import type { Product, Order, AdminMetrics, User } from '../types';
import {
  fetchAdminMetrics,
  fetchAdminOrders,
  fetchProducts,
  updateOrderStatusApi,
  updateProductAdminApi,
  deleteProductAdminApi,
  createProductAdminApi,
  fetchAdminUsers
} from '../api';
import { OrderDetailModal } from './OrderDetailModal';

interface AdminDashboardProps {
  onBackToStore: () => void;
  currentUser: User | null;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStore,
  currentUser,
  theme = 'light',
  onToggleTheme
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'orders' | 'products' | 'users'>('metrics');
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalRevenue: 47660000,
    totalOrders: 3,
    totalProducts: 13,
    outOfStockProducts: 0,
    totalUsers: 2,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Search
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    brand: 'ASUS',
    name: '',
    category: 'laptop',
    subCategory: 'gaming',
    price: 25000000,
    originalPrice: 27000000,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    specs: ['Core i7 · 16GB / 512GB · 15.6" 144Hz'],
    description: 'Sản phẩm mới ra mắt 2026',
  });

  // Quick edit product price state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  // Load data
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [m, p, o, u] = await Promise.all([
        fetchAdminMetrics(),
        fetchProducts(),
        fetchAdminOrders(),
        fetchAdminUsers()
      ]);
      setMetrics(m);
      setProducts(p);
      setOrders(o);
      setUsers(u);
    } catch (err) {
      console.error('Error refreshing admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleToggleStock = async (product: Product) => {
    const updatedStock = !product.inStock;
    setProducts(prev =>
      prev.map(p => (p.id === product.id ? { ...p, inStock: updatedStock } : p))
    );
    await updateProductAdminApi(product.id, { inStock: updatedStock });
  };

  const handleSavePrice = async (productId: string) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, price: editPrice } : p))
    );
    await updateProductAdminApi(productId, { price: editPrice });
    setEditingProductId(null);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống cơ sở dữ liệu Cloudflare D1?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      await deleteProductAdminApi(id);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
    await updateOrderStatusApi(orderId, newStatus);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    const created: Product = {
      id: 'prod_' + Date.now().toString(36),
      brand: newProduct.brand || 'TECHSTORE',
      name: newProduct.name,
      category: (newProduct.category as 'laptop' | 'component' | 'accessory') || 'laptop',
      subCategory: newProduct.subCategory || 'gaming',
      price: Number(newProduct.price),
      originalPrice: Number(newProduct.originalPrice || newProduct.price),
      image: newProduct.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
      inStock: newProduct.inStock ?? true,
      specs: typeof newProduct.specs === 'string' ? (newProduct.specs as string).split('·').map(s => s.trim()) : (newProduct.specs || []),
      description: newProduct.description || '',
    };

    setProducts(prev => [created, ...prev]);
    await createProductAdminApi(created);
    setIsAddModalOpen(false);
  };

  // Filtered lists
  const filteredProducts = products.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearchQuery.toLowerCase());
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchesQuery && matchesCategory;
  });

  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'all' ? true : o.status === orderStatusFilter;
    const matchesQuery =
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customer_phone.includes(orderSearchQuery) ||
      o.shipping_address.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const shippingOrdersCount = orders.filter(o => o.status === 'shipping').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'cancelled').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090D] text-slate-900 dark:text-[#F8FAFC] flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Enterprise Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0B0E14]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/30 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Về Cửa hàng</span>
          </button>
          
          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase">
                  TechStore Enterprise Console
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Cloudflare D1 Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* Refresh Data button */}
          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer"
            title="Làm mới dữ liệu từ D1"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          {/* Theme Switcher in Admin */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          )}

          {/* Admin User Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt="Admin"
              className="w-6 h-6 rounded-full object-cover border border-cyan-400/50"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline">
              {currentUser?.name || 'Quản Trị Viên'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 dark:bg-cyan-500/20 text-blue-600 dark:text-cyan-300 font-mono font-bold">
              ROOT ADMIN
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B0D11] p-4 flex md:flex-col gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'metrics'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>Tổng quan & KPIs</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4 h-4" />
              <span>Đơn đặt hàng</span>
            </div>
            <div className="flex items-center gap-1.5">
              {pendingOrdersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'orders'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {orders.length}
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>Sản phẩm & Tồn kho</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'products'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Tài khoản người dùng</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'users'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {users.length}
            </span>
          </button>

          {/* Quick System Status Footer in Sidebar */}
          <div className="hidden md:block mt-auto p-4 rounded-2xl bg-slate-100/70 dark:bg-[#11141B] border border-slate-200/80 dark:border-slate-800 space-y-2 text-[11px]">
            <div className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Hạ tầng phân tán
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-blue-500" /> Cloudflare D1</span>
              <span className="font-mono text-emerald-500 font-bold">~12ms</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-cyan-500" /> Trợ lý AI Bot</span>
              <span className="font-mono text-cyan-500 font-bold">Online</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-indigo-500" /> VietQR Gateway</span>
              <span className="font-mono text-emerald-500 font-bold">Khả dụng</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          
          {/* TAB 1: METRICS OVERVIEW */}
          {activeTab === 'metrics' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Thống kê hoạt động kinh doanh
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Báo cáo doanh thu, đơn hàng và kho dữ liệu thời gian thực đồng bộ Cloudflare D1
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-cyan-400 text-xs font-semibold border border-blue-200 dark:border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Xem {pendingOrdersCount} đơn cần duyệt</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm sản phẩm</span>
                  </button>
                </div>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#11141B] border border-slate-200/80 dark:border-cyan-500/20 shadow-xs dark:shadow-none relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">TỔNG DOANH THU</span>
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {metrics.totalRevenue.toLocaleString('vi-VN')} đ
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2.5 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>↑ +18.4%</span>
                    <span className="text-slate-400 dark:text-slate-500 font-normal">so với tuần trước</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#11141B] border border-slate-200/80 dark:border-blue-500/20 shadow-xs dark:shadow-none relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ĐƠN ĐẶT HÀNG</span>
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-blue-500/10 text-indigo-600 dark:text-blue-400">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {orders.length} đơn
                  </div>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-2.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{pendingOrdersCount} đơn chờ xử lý</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#11141B] border border-slate-200/80 dark:border-indigo-500/20 shadow-xs dark:shadow-none relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">SẢN PHẨM TRÊN SÀN</span>
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-indigo-500/10 text-purple-600 dark:text-indigo-400">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {products.length} models
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>100% sẵn hàng trong kho</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#11141B] border border-slate-200/80 dark:border-purple-500/20 shadow-xs dark:shadow-none relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">NGƯỜI DÙNG HỆ THỐNG</span>
                    <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-purple-500/10 text-cyan-600 dark:text-purple-400">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {users.length} tài khoản
                  </div>
                  <div className="text-[11px] text-blue-600 dark:text-cyan-400 font-semibold mt-2.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Hỗ trợ Google SSO & Local</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#11141B] border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-none">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Đơn hàng mới nhất cần xử lý</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Bấm vào bất kỳ dòng nào để mở Chi tiết Đơn hàng</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Xem tất cả {orders.length} đơn</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <th className="pb-3 font-semibold">Mã đơn</th>
                        <th className="pb-3 font-semibold">Khách hàng</th>
                        <th className="pb-3 font-semibold">Số tiền</th>
                        <th className="pb-3 font-semibold">Trạng thái</th>
                        <th className="pb-3 font-semibold">Thời gian</th>
                        <th className="pb-3 font-semibold text-right">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                      {orders.slice(0, 5).map(ord => (
                        <tr
                          key={ord.id}
                          onClick={() => setSelectedOrder(ord)}
                          className="hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer transition-colors"
                        >
                          <td className="py-3 font-bold text-blue-600 dark:text-cyan-400">{ord.id}</td>
                          <td className="py-3 text-slate-700 dark:text-slate-200 font-sans font-medium">{ord.customer_name}</td>
                          <td className="py-3 text-slate-900 dark:text-white font-bold">{ord.total_amount.toLocaleString('vi-VN')} đ</td>
                          <td className="py-3 font-sans">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                              ord.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                              ord.status === 'shipping' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                              ord.status === 'cancelled' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {ord.status === 'completed' ? 'Hoàn thành' : ord.status === 'shipping' ? 'Đang giao' : ord.status === 'cancelled' ? 'Đã hủy' : 'Chờ duyệt'}
                            </span>
                          </td>
                          <td className="py-3 text-slate-500 dark:text-slate-400 font-sans text-[11px]">{ord.created_at}</td>
                          <td className="py-3 text-right font-sans">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(ord);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                              <span>Xem</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Quản lý Đơn đặt hàng
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Theo dõi tiến trình xử lý, in phiếu giao hàng và cập nhật trạng thái đơn
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Tổng: <strong className="text-slate-900 dark:text-white">{orders.length}</strong> đơn
                  </span>
                </div>
              </div>

              {/* Search & Status Filter Bar */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo Mã đơn (ORD-...), Tên khách hàng, SĐT hoặc Địa chỉ..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#11141B] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 shadow-xs"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'Tất cả', count: orders.length },
                    { id: 'pending', label: 'Chờ duyệt', count: pendingOrdersCount },
                    { id: 'shipping', label: 'Đang giao', count: shippingOrdersCount },
                    { id: 'completed', label: 'Hoàn thành', count: completedOrdersCount },
                    { id: 'cancelled', label: 'Đã hủy', count: cancelledOrdersCount },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderStatusFilter(tab.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        orderStatusFilter === tab.id
                          ? 'bg-blue-600 dark:bg-cyan-500 text-white shadow-xs'
                          : 'bg-white dark:bg-[#11141B] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        orderStatusFilter === tab.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Data Table */}
              <div className="rounded-2xl bg-white dark:bg-[#11141B] border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-none overflow-hidden">
                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc tìm kiếm.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-semibold">
                          <th className="p-4">Mã đơn hàng</th>
                          <th className="p-4">Khách hàng & Liên hệ</th>
                          <th className="p-4">Sản phẩm</th>
                          <th className="p-4">Tổng tiền</th>
                          <th className="p-4">Thanh toán</th>
                          <th className="p-4">Trạng thái</th>
                          <th className="p-4 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                        {filteredOrders.map(ord => (
                          <tr
                            key={ord.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                          >
                            <td className="p-4">
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="font-mono font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer block text-left"
                              >
                                {ord.id}
                              </button>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{ord.created_at}</span>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-slate-900 dark:text-white">{ord.customer_name}</div>
                              <div className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" />
                                <span>{ord.customer_phone}</span>
                              </div>
                              <div className="text-slate-400 dark:text-slate-500 text-[10px] truncate max-w-xs mt-0.5">
                                {ord.shipping_address}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {ord.items.length} món
                              </span>
                              <span className="text-slate-400 text-[11px] block truncate max-w-xs">
                                {ord.items[0]?.name} {ord.items.length > 1 ? `+${ord.items.length - 1} khác` : ''}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                              {ord.total_amount.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                <CreditCard className="w-3 h-3" />
                                <span>VietQR</span>
                              </span>
                            </td>
                            <td className="p-4">
                              <select
                                value={ord.status}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as Order['status'])}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border focus:outline-none cursor-pointer ${
                                  ord.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                                  ord.status === 'shipping' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-500/30' :
                                  ord.status === 'cancelled' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-500/30' :
                                  'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                }`}
                              >
                                <option value="pending">Chờ xác nhận</option>
                                <option value="shipping">Đang giao hàng</option>
                                <option value="completed">Đã hoàn thành</option>
                                <option value="cancelled">Đã hủy đơn</option>
                              </select>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 dark:bg-cyan-500 hover:bg-blue-700 dark:hover:bg-cyan-400 text-white font-semibold text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Chi tiết</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Danh mục Sản phẩm & Tồn kho
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Dữ liệu được lưu trữ và truy vấn siêu tốc từ Cloudflare D1
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Sản phẩm mới</span>
                </button>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm theo tên hoặc thương hiệu..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#11141B] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 shadow-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'laptop', label: 'Laptop' },
                    { id: 'component', label: 'Linh kiện' },
                    { id: 'accessory', label: 'Phụ kiện' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setProductCategoryFilter(cat.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        productCategoryFilter === cat.id
                          ? 'bg-blue-600 dark:bg-cyan-500 text-white'
                          : 'bg-white dark:bg-[#11141B] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Table */}
              <div className="rounded-2xl bg-white dark:bg-[#11141B] border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-semibold">
                        <th className="p-4">Sản phẩm</th>
                        <th className="p-4">Danh mục</th>
                        <th className="p-4">Giá bán (VND)</th>
                        <th className="p-4">Tình trạng kho</th>
                        <th className="p-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-800" />
                              <div>
                                <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-mono font-bold block">{p.brand}</span>
                                <span className="font-semibold text-slate-900 dark:text-white">{p.name}</span>
                                {p.specs && p.specs.length > 0 && (
                                  <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5">{p.specs.join(' · ')}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {p.category}
                            </span>
                          </td>
                          <td className="p-4">
                            {editingProductId === p.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(Number(e.target.value))}
                                  className="w-28 px-2 py-1 rounded bg-slate-100 dark:bg-black border border-blue-500 dark:border-cyan-400 text-slate-900 dark:text-white font-mono text-xs focus:outline-none"
                                />
                                <button
                                  onClick={() => handleSavePrice(p.id)}
                                  className="p-1 text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform"
                                  title="Lưu giá"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                  {p.price.toLocaleString('vi-VN')} đ
                                </span>
                                <button
                                  onClick={() => { setEditingProductId(p.id); setEditPrice(p.price); }}
                                  className="text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                                  title="Sửa giá nhanh"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleStock(p)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 ${
                                p.inStock
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              <span>{p.inStock ? 'Còn hàng' : 'Hết hàng'}</span>
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Danh sách Khách hàng & Phân quyền
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Quản lý tài khoản đăng ký, phương thức Google SSO và quyền ROOT ADMIN
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#11141B] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#11141B] border border-slate-200/80 dark:border-slate-800 shadow-xs dark:shadow-none overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-semibold">
                      <th className="p-4">Người dùng</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Phương thức</th>
                      <th className="p-4">Vai trò</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                          <span className="font-semibold text-slate-900 dark:text-white">{u.name}</span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-mono">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                            u.provider === 'google'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}>
                            {u.provider === 'google' ? 'Google SSO' : 'Mật khẩu cục bộ'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-blue-500/15 text-blue-600 dark:bg-cyan-500/20 dark:text-cyan-300 border border-blue-500/30 dark:border-cyan-500/40'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* POPUP CHI TIẾT ĐƠN HÀNG (Order Detail Modal) */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        isAdmin={true}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
      />

      {/* MODAL THÊM SẢN PHẨM MỚI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#11141B] border border-slate-200 dark:border-cyan-500/40 p-6 sm:p-8 text-slate-900 dark:text-white shadow-2xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold mb-4 tracking-tight">Thêm sản phẩm mới vào Cloudflare D1</h3>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Tên sản phẩm</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="VD: ASUS ROG Zephyrus G16"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Thương hiệu</label>
                  <input
                    type="text"
                    required
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    placeholder="ASUS, LENOVO, MSI..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Danh mục</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as Product['category'] })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400"
                  >
                    <option value="laptop">Laptop</option>
                    <option value="component">Linh kiện PC</option>
                    <option value="accessory">Phụ kiện & Màn hình</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Giá bán (VND)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Giá niêm yết gốc (VND)</label>
                  <input
                    type="number"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">URL Hình ảnh</label>
                <input
                  type="url"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white font-bold text-xs shadow-lg cursor-pointer hover:scale-[1.01] transition-all"
              >
                Lưu vào cơ sở dữ liệu D1
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
