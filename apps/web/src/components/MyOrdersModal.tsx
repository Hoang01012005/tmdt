import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Search,
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  RefreshCw,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';
import type { Order, User } from '../types';
import { lookupOrdersApi, getRecentOrderIds, fetchOrderByIdApi } from '../api';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSelectOrder: (order: Order) => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'my-orders' | 'lookup'>('my-orders');
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResults, setLookupResults] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Load user's recent orders or account orders
  const loadUserOrders = async () => {
    setLoading(true);
    try {
      const ordersMap = new Map<string, Order>();

      // 1. If user is logged in, lookup by their email
      if (currentUser?.email) {
        const emailOrders = await lookupOrdersApi(currentUser.email);
        emailOrders.forEach(o => ordersMap.set(o.id, o));
      }

      // 2. Also lookup recently placed orders from this browser
      const recentIds = getRecentOrderIds();
      if (recentIds.length > 0) {
        const promises = recentIds.slice(0, 6).map(id => fetchOrderByIdApi(id));
        const fetchedRecent = await Promise.all(promises);
        fetchedRecent.forEach(o => {
          if (o) ordersMap.set(o.id, o);
        });
      }

      const list = Array.from(ordersMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setMyOrders(list);
    } catch (err) {
      console.warn('Error loading user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUserOrders();
    }
  }, [isOpen, currentUser]);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = lookupQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      // If looks like exact order ID
      if (query.toUpperCase().startsWith('ORD-')) {
        const exact = await fetchOrderByIdApi(query.toUpperCase());
        if (exact) {
          setLookupResults([exact]);
          setIsSearching(false);
          return;
        }
      }

      const results = await lookupOrdersApi(query);
      setLookupResults(results);
    } catch (err) {
      console.error('Lookup error:', err);
      setLookupResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  const statusConfig = {
    pending: {
      label: 'Chờ xác nhận',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      icon: Clock,
    },
    processing: {
      label: 'Đang xử lý',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      icon: Package,
    },
    shipping: {
      label: 'Đang giao hàng',
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      icon: Truck,
    },
    completed: {
      label: 'Giao thành công',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      icon: CheckCircle2,
    },
    cancelled: {
      label: 'Đã hủy đơn',
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      icon: AlertTriangle,
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-[#11141B] border border-slate-200 dark:border-cyan-500/30 p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-[#F8FAFC] max-h-[88vh] flex flex-col transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Đơn Hàng & Tra Cứu Vận Chuyển
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Theo dõi tiến trình đóng gói và lộ trình giao hàng trực tuyến
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <button
            onClick={() => setActiveTab('my-orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'my-orders'
                ? 'bg-blue-600 dark:bg-cyan-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Đơn hàng của tôi ({myOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lookup')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'lookup'
                ? 'bg-blue-600 dark:bg-cyan-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Tra cứu theo Mã / SĐT</span>
          </button>

          <div className="ml-auto">
            <button
              onClick={loadUserOrders}
              disabled={loading}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab 1: My Orders */}
        {activeTab === 'my-orders' && (
          <div className="flex-1 overflow-y-auto pt-4 space-y-3.5 pr-1">
            {loading ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                <p>Đang đồng bộ danh sách đơn hàng từ Cloudflare D1...</p>
              </div>
            ) : myOrders.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Package className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Bạn chưa có đơn hàng nào trên thiết bị này
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nếu bạn đã đặt hàng qua điện thoại khác, hãy chuyển sang tab <strong className="text-blue-600 dark:text-cyan-400 cursor-pointer" onClick={() => setActiveTab('lookup')}>"Tra cứu theo Mã / SĐT"</strong>.
                  </p>
                </div>
              </div>
            ) : (
              myOrders.map(ord => {
                const cfg = statusConfig[ord.status] || statusConfig.pending;
                const IconComponent = cfg.icon;

                return (
                  <div
                    key={ord.id}
                    onClick={() => onSelectOrder(ord)}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-500/40 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-blue-600 dark:text-cyan-400">
                            {ord.id}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.color}`}>
                            <IconComponent className="w-3 h-3" />
                            <span>{cfg.label}</span>
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">{ord.created_at}</span>
                      </div>

                      <div className="text-right sm:text-right">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">Tổng thanh toán</span>
                        <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                          {ord.total_amount.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-500 dark:text-slate-400">Sản phẩm:</span>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {ord.items.map((it, idx) => (
                            <span key={idx} className="block">
                              • {it.name} <span className="text-slate-400">(x{it.qty})</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(ord);
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 dark:bg-cyan-500 hover:bg-blue-700 dark:hover:bg-cyan-400 text-white font-semibold text-xs shadow-xs inline-flex items-center justify-center gap-1.5 transition-all self-end sm:self-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Lookup */}
        {activeTab === 'lookup' && (
          <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
            <form onSubmit={handleLookup} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Nhập mã đơn (VD: ORD-2026-BXDSD), số điện thoại hoặc email..."
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 shadow-xs"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSearching ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Tra cứu</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {hasSearched && (
              <div className="space-y-3 pt-2">
                {lookupResults.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    Không tìm thấy đơn hàng nào khớp với "{lookupQuery}". Vui lòng kiểm tra lại mã đơn hàng hoặc số điện thoại khi đặt hàng.
                  </div>
                ) : (
                  lookupResults.map(ord => {
                    const cfg = statusConfig[ord.status] || statusConfig.pending;
                    const IconComponent = cfg.icon;

                    return (
                      <div
                        key={ord.id}
                        onClick={() => onSelectOrder(ord)}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-500/40 transition-all cursor-pointer"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-blue-600 dark:text-cyan-400">
                                {ord.id}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.color}`}>
                                <IconComponent className="w-3 h-3" />
                                <span>{cfg.label}</span>
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">{ord.created_at}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-slate-500 dark:text-slate-400 block">Tổng thanh toán</span>
                            <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                              {ord.total_amount.toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Khách hàng:</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {ord.customer_name} ({ord.customer_phone})
                            </span>
                            <span className="text-slate-400 block text-[11px] mt-0.5">
                              {ord.shipping_address}
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectOrder(ord);
                            }}
                            className="px-4 py-2 rounded-xl bg-blue-600 dark:bg-cyan-500 hover:bg-blue-700 dark:hover:bg-cyan-400 text-white font-semibold text-xs shadow-xs inline-flex items-center justify-center gap-1.5 transition-all self-end sm:self-center"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem chi tiết</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
