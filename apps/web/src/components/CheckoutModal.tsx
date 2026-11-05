import React, { useState } from 'react';
import { X, CheckCircle2, QrCode, Truck, ShieldCheck, ArrowRight, Copy, Check, Eye } from 'lucide-react';
import type { CartItem, User } from '../types';
import { createOrderApi } from '../api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentUser: User | null;
  onOrderSuccess: (orderId: string) => void;
  onViewOrderDetails?: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currentUser,
  onOrderSuccess,
  onViewOrderDetails,
}) => {
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'cod'>('vietqr');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [finalTotalAmount, setFinalTotalAmount] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    setPlacedOrderId(null);
    setFinalTotalAmount(0);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const memoCode = 'TECH' + Math.floor(100000 + Math.random() * 900000);

  // VietQR Dynamic URL (MB Bank standard format)
  const vietQrUrl = `https://api.vietqr.io/image/970422-0988123456-compact2.jpg?amount=${totalAmount}&addInfo=${encodeURIComponent(memoCode)}&accountName=${encodeURIComponent('CONG TY TECHSTORE VN')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !shippingAddress) {
      setError('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.');
      return;
    }

    setLoading(true);
    setError(null);
    const orderTotal = totalAmount;
    setFinalTotalAmount(orderTotal);

    try {
      const orderItems = items.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price,
        qty: i.quantity,
      }));

      const res = await createOrderApi({
        userId: currentUser?.id,
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        items: orderItems,
        totalAmount: orderTotal,
        paymentMethod,
      });

      if (res.success && res.orderId) {
        setFinalTotalAmount(res.totalAmount || orderTotal);
        setPlacedOrderId(res.orderId);
        onOrderSuccess(res.orderId);
      } else {
        setError(res.error || 'Đã có lỗi xảy ra khi tạo đơn hàng');
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#11141B] border border-slate-200 dark:border-cyan-500/40 p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-[#F8FAFC] max-h-[90vh] overflow-y-auto transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* MÀN HÌNH ĐẶT HÀNG THÀNH CÔNG */}
        {placedOrderId ? (
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Đặt Hàng Thành Công!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Đơn hàng của bạn đã được ghi nhận trên hệ thống Cloudflare D1</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-cyan-400 text-sm">{placedOrderId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Người nhận:</span>
                <span className="text-slate-900 dark:text-white font-medium">{customerName} ({customerPhone})</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Địa chỉ giao:</span>
                <span className="text-slate-700 dark:text-slate-200">{shippingAddress}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Hình thức thanh toán:</span>
                <span className="text-indigo-600 dark:text-cyan-300 font-semibold">
                  {paymentMethod === 'vietqr' ? 'Chuyển khoản VietQR' : 'Thanh toán tiền mặt khi nhận (COD)'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-800 dark:text-slate-300 font-bold">Tổng thanh toán:</span>
                <span className="font-mono text-base font-bold text-indigo-600 dark:text-white">
                  {(finalTotalAmount || totalAmount).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={() => {
                  const idToView = placedOrderId;
                  handleClose();
                  if (idToView && onViewOrderDetails) {
                    onViewOrderDetails(idToView);
                  }
                }}
                className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Xem chi tiết đơn hàng</span>
              </button>
              <button
                onClick={handleClose}
                className="py-3.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        ) : (
          /* FORM THANH TOÁN VÀ CHỌN PHƯƠNG THỨC */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-cyan-500/10 border border-indigo-200 dark:border-cyan-500/30 text-indigo-700 dark:text-cyan-400 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                CỔNG THANH TOÁN BẢO MẬT
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Xác Nhận & Thanh Toán</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Vui lòng cung cấp thông tin nhận hàng và chọn phương thức</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            {/* Thông tin người nhận */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">1. Thông tin người nhận</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0988 123 456"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 font-mono focus:bg-white"
                  />
                </div>
              </div>
              <div className="text-xs">
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Email nhận thông báo đơn hàng</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 focus:bg-white"
                />
              </div>
              <div className="text-xs">
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Địa chỉ giao hàng chi tiết *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/TP"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-400 focus:bg-white"
                />
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">2. Phương thức thanh toán</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setPaymentMethod('vietqr')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    paymentMethod === 'vietqr'
                      ? 'bg-indigo-50/80 border-indigo-500 dark:bg-cyan-500/10 dark:border-cyan-400 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-cyan-500/20 dark:text-cyan-400">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Chuyển khoản VietQR</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Quét mã QR qua app ngân hàng</p>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    paymentMethod === 'cod'
                      ? 'bg-indigo-50/80 border-indigo-500 dark:bg-cyan-500/10 dark:border-cyan-400 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Thanh toán khi nhận (COD)</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Kiểm tra hàng rồi thanh toán</p>
                  </div>
                </div>
              </div>

              {/* KHỐI HIỂN THỊ VIETQR NẾU CHỌN VIETQR */}
              {paymentMethod === 'vietqr' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-cyan-500/30 flex flex-col sm:flex-row items-center gap-5 animate-in fade-in duration-150">
                  <div className="bg-white p-2.5 rounded-xl shadow-md shrink-0 border border-slate-200 dark:border-transparent">
                    <img
                      src={vietQrUrl}
                      alt="Mã VietQR"
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                  <div className="space-y-1.5 text-xs flex-1">
                    <p className="text-[11px] text-indigo-700 dark:text-cyan-300 font-bold uppercase">Ngân hàng Quân Đội (MB Bank)</p>
                    <p className="text-slate-600 dark:text-slate-300">Chủ TK: <strong className="text-slate-900 dark:text-white">CONG TY TECHSTORE VN</strong></p>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 dark:text-slate-300">Số TK: <strong className="text-indigo-600 dark:text-cyan-400 font-mono text-sm">0988123456</strong></span>
                      <button
                        type="button"
                        onClick={() => handleCopy('0988123456')}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        title="Copy"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">Nội dung: <strong className="text-slate-900 dark:text-white font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent px-1.5 py-0.5 rounded">{memoCode}</strong></p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      Mở app ngân hàng bất kỳ (Vietcombank, MB, Techcombank, Momo) quét mã để chuyển khoản tức thì.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tóm tắt chi phí */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tạm tính ({items.length} món):</span>
                <span className="font-mono text-slate-900 dark:text-white">{totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Phí giao hàng:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">MIỄN PHÍ TOÀN QUỐC</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Tổng thanh toán:</span>
                <span className="font-mono text-indigo-600 dark:text-cyan-400 text-base">{totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Xác Nhận Đặt Hàng Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
