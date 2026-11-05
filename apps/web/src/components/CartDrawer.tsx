import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import type { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#11141B] border-l border-slate-200 dark:border-[#1E2330] shadow-2xl flex flex-col justify-between transition-colors duration-200">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-[#1E2330] flex items-center justify-between bg-slate-50 dark:bg-[#161923]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-[#818CF8]" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Giỏ hàng của bạn</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#161923] text-indigo-700 dark:text-[#818CF8] border border-indigo-200 dark:border-[#1E2330]">
                {items.length} món
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E2330] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-transparent">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-[#2E3547] mb-3" />
                <p className="text-base font-semibold text-slate-900 dark:text-white mb-1">Giỏ hàng đang trống</p>
                <p className="text-xs text-slate-500 dark:text-[#8E95A5] max-w-xs">
                  Khám phá các dòng laptop và linh kiện phần cứng để thêm vào giỏ hàng.
                </p>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#161923] border border-slate-200 dark:border-[#1E2330] shadow-xs flex gap-3.5 items-center"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover bg-slate-100 dark:bg-[#0B0D11] shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono uppercase text-indigo-600 dark:text-[#818CF8] font-bold">
                      {product.brand}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {product.name}
                    </h4>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                      {product.price.toLocaleString('vi-VN')} đ
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#11141B] border border-slate-200 dark:border-[#1E2330] rounded-lg p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 dark:text-[#8E95A5] hover:text-slate-900 dark:hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold text-slate-800 dark:text-white px-1">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 dark:text-[#8E95A5] hover:text-slate-900 dark:hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-200 dark:border-[#1E2330] bg-white dark:bg-[#0E1017] space-y-4 shadow-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-[#8E95A5]">Tạm tính:</span>
                <span className="text-xl font-bold font-mono text-indigo-600 dark:text-cyan-400">
                  {subtotal.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#5B6170]">
                <span>Phí vận chuyển:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">MIỄN PHÍ TOÀN QUỐC</span>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-cyan-500 dark:via-blue-600 dark:to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Tiến hành đặt hàng & Thanh toán</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
