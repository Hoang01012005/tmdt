import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Mail,
  MapPin,
  CreditCard,
  QrCode,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import type { Order } from '../types';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, newStatus: Order['status']) => void;
  isAdmin?: boolean;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  isAdmin = false
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | null>(null);

  if (!isOpen || !order) return null;

  const currentStatus = selectedStatus || order.status;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = (newStatus: Order['status']) => {
    setSelectedStatus(newStatus);
    if (onUpdateStatus) {
      onUpdateStatus(order.id, newStatus);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Status mapping and styling
  const statusConfig = {
    pending: {
      label: 'Chờ xác nhận',
      step: 1,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icon: Clock
    },
    processing: {
      label: 'Đang xử lý',
      step: 2,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      icon: Package
    },
    shipping: {
      label: 'Đang vận chuyển',
      step: 3,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      icon: Truck
    },
    completed: {
      label: 'Giao thành công',
      step: 4,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2
    },
    cancelled: {
      label: 'Đã hủy đơn',
      step: 0,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      icon: AlertTriangle
    }
  };

  const currentCfg = statusConfig[currentStatus] || statusConfig.pending;
  const currentStep = currentCfg.step;

  const timelineSteps = [
    { step: 1, label: 'Đặt hàng', desc: 'Đã gửi yêu cầu' },
    { step: 2, label: 'Đã xác nhận', desc: 'Đã kiểm tra kho' },
    { step: 3, label: 'Đang giao', desc: 'Đang vận chuyển' },
    { step: 4, label: 'Hoàn thành', desc: 'Đã nhận hàng' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#11141B] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 max-h-[92vh] overflow-y-auto text-slate-900 dark:text-[#F8FAFC] transition-colors duration-200 print:m-0 print:p-0 print:border-none print:shadow-none print:max-h-none print:w-full">
        
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Mã đơn hàng</span>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-mono font-extrabold text-sm text-indigo-600 dark:text-cyan-400">{order.id}</span>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-300 transition-colors"
                  title="Sao chép mã đơn"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentCfg.color}`}>
                <currentCfg.icon className="w-3 h-3" />
                {currentCfg.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {order.created_at || 'Thời gian gần đây'}
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Cloudflare D1 Verified
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="In phiếu giao hàng"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In phiếu gửi</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. Timeline Stepper (Trừ khi đơn bị hủy) */}
        {currentStatus !== 'cancelled' ? (
          <div className="py-6 border-b border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-4 relative">
              {/* Connecting Bar */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                />
              </div>

              {timelineSteps.map((s) => {
                const isPassed = currentStep >= s.step;
                const isCurrent = currentStep === s.step;
                return (
                  <div key={s.step} className="flex flex-col items-center text-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                      isPassed
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-indigo-500/20 dark:ring-cyan-500/20 scale-110' : ''}`}>
                      {isPassed ? <Check className="w-4 h-4" /> : s.step}
                    </div>
                    <span className={`text-xs font-bold mt-2 ${
                      isPassed ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                    }`}>
                      {s.label}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">{s.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="my-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Đơn hàng này đã bị hủy.</p>
              <p className="text-[11px] opacity-90">Sản phẩm chưa được xuất kho. Quý khách có thể đặt lại đơn mới bất cứ lúc nào.</p>
            </div>
          </div>
        )}

        {/* 2. Hai cột thông tin Khách hàng & Giao vận */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 py-6 border-b border-slate-200 dark:border-slate-800 text-xs">
          {/* Cột 1: Thông tin khách hàng & Địa chỉ */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              <User className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
              <span>Thông tin nhận hàng</span>
            </div>
            
            <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
              <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>{order.customer_name}</span>
                <span className="font-mono text-xs font-normal text-slate-500">({order.customer_phone})</span>
              </p>
              {order.customer_email && (
                <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.customer_email}</span>
                </p>
              )}
              <div className="flex items-start gap-1.5 pt-1 text-slate-600 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>{order.shipping_address}</span>
              </div>
            </div>
          </div>

          {/* Cột 2: Hình thức thanh toán & Vận chuyển */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
              <span>Thanh toán & Giao vận</span>
            </div>

            <div className="space-y-2 text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Phương thức:</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
                  Chuyển khoản VietQR (MB Bank)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Vận chuyển:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Giao hỏa tốc toàn quốc (Miễn phí)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Bảo hành:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">1 đổi 1 trong 30 ngày chính hãng</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bảng sản phẩm chi tiết */}
        <div className="py-6 border-b border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
            <span>Danh sách sản phẩm trong đơn ({order.items?.length || 0})</span>
          </h4>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="p-3">Sản phẩm</th>
                  <th className="p-3 text-center">Số lượng</th>
                  <th className="p-3 text-right">Đơn giá</th>
                  <th className="p-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#11141B]">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-600 dark:text-cyan-400 shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">ID: {item.productId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-800 dark:text-slate-200 font-mono">
                        x{item.qty}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {item.price.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {(item.price * item.qty).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400">
                      Không tìm thấy chi tiết danh mục
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Tóm tắt tài chính */}
        <div className="pt-4 flex flex-col items-end text-xs space-y-1.5">
          <div className="flex justify-between w-full sm:w-72 text-slate-500 dark:text-slate-400">
            <span>Tạm tính tiền hàng:</span>
            <span className="font-mono text-slate-900 dark:text-white">{order.total_amount.toLocaleString('vi-VN')} đ</span>
          </div>
          <div className="flex justify-between w-full sm:w-72 text-slate-500 dark:text-slate-400">
            <span>Phí giao hàng:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">0 đ (MIỄN PHÍ)</span>
          </div>
          <div className="flex justify-between w-full sm:w-72 pt-2 border-t border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
            <span>Tổng thanh toán:</span>
            <span className="font-mono text-lg text-indigo-600 dark:text-cyan-400">{order.total_amount.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        {/* 5. Admin Control Toolbar (Nếu mở trong trang Admin) */}
        {isAdmin && (
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl print:hidden">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Cập nhật trạng thái đơn:</span>
              <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-black border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="pending">🟡 Chờ xác nhận</option>
                <option value="shipping">🔵 Đang vận chuyển</option>
                <option value="completed">🟢 Giao hoàn thành</option>
                <option value="cancelled">🔴 Hủy đơn hàng</option>
              </select>
            </div>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Đóng chi tiết
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
