import React from 'react';
import { X, CheckCircle2, ShoppingCart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import type { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
      />

      <div className="relative w-full max-w-3xl bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#1E2330] rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto transition-colors duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161923] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          {/* Image */}
          <div className="aspect-[16/11] rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#0B0D11] border border-slate-200 dark:border-[#1E2330]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Details */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-[#5856D6]/15 border border-indigo-200 dark:border-[#5856D6]/30 text-[11px] font-mono font-bold text-indigo-700 dark:text-[#818CF8] uppercase mb-2">
              {product.brand} · {product.category.toUpperCase()}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {product.name}
            </h2>

            <p className="text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-4">
              {product.description || 'Sản phẩm phần cứng công nghệ được tuyển chọn kỹ lưỡng, đảm bảo hiệu năng và độ ổn định cao nhất.'}
            </p>

            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-6">
              {product.price.toLocaleString('vi-VN')} đ
            </div>

            {/* Specifications list */}
            <div className="space-y-2 mb-6 p-4 rounded-xl bg-slate-50 dark:bg-[#161923] border border-slate-200 dark:border-[#1E2330]">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-[#818CF8] uppercase block mb-1">
                Thông số chính:
              </span>
              {product.specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-[#CBD5E1]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>

            {/* Warranty perks */}
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 dark:text-[#8E95A5] mb-6">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-[#818CF8] shrink-0" />
                <span>Bảo hành 3 năm</span>
              </div>
              <div className="flex items-center gap-1">
                <RotateCcw className="w-4 h-4 text-indigo-600 dark:text-[#818CF8] shrink-0" />
                <span>1 đổi 1 30 ngày</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-indigo-600 dark:text-[#818CF8] shrink-0" />
                <span>Giao hỏa tốc 2H</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-[#5856D6] dark:hover:bg-[#4845C6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Thêm vào giỏ hàng</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
