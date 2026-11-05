import React from 'react';
import { X, Check, ShoppingCart, SlidersHorizontal } from 'lucide-react';
import type { Product } from '../types';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onRemoveCompare: (productId: string) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddToCart,
  onRemoveCompare
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
      />

      <div className="relative w-full max-w-4xl bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#1E2330] rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] flex flex-col transition-colors duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-[#1E2330]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-[#5856D6]/20 border border-indigo-200 dark:border-[#5856D6]/30 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-indigo-600 dark:text-[#818CF8]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">So sánh thông số kỹ thuật</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#8E95A5]">
                Đối chiếu cấu hình chi tiết để lựa chọn thiết bị tối ưu cho nhu cầu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161923] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-x-auto py-6">
          {products.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-[#8E95A5]">
              Chưa có sản phẩm nào được chọn để so sánh. Nhấp nút "+ So sánh" trên sản phẩm bất kỳ.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 min-w-[600px]">
              {products.map(p => (
                <div 
                  key={p.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161923] border border-slate-200 dark:border-[#1E2330] flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() => onRemoveCompare(p.id)}
                        className="text-xs text-slate-400 hover:text-red-500"
                      >
                        Bỏ chọn
                      </button>
                    </div>

                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full aspect-[16/10] object-cover rounded-xl mb-3 bg-white dark:bg-[#0B0D11]"
                    />

                    <span className="text-[10px] font-mono uppercase text-indigo-600 dark:text-[#818CF8] font-bold">
                      {p.brand}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
                      {p.name}
                    </h4>

                    <div className="text-base font-bold text-slate-900 dark:text-white mb-4">
                      {p.price.toLocaleString('vi-VN')} đ
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-600 dark:text-[#CBD5E1] pt-3 border-t border-slate-200 dark:border-[#1E2330]">
                      {p.specs.map((spec, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onAddToCart(p);
                    }}
                    className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-[#5856D6] dark:hover:bg-[#4845C6] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Thêm giỏ hàng</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
