import React from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../types';
import { ADDITIONAL_PRODUCTS, FEATURED_ACCESSORIES } from '../data/products';

interface AccessoryShowcaseProps {
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const AccessoryShowcase: React.FC<AccessoryShowcaseProps> = ({
  onAddToCart,
  onSelectProduct
}) => {
  return (
    <section id="accessories" className="py-12 sm:py-20 bg-slate-50 dark:bg-[#0B0D11] border-t border-slate-200 dark:border-[#1E2330] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-6 sm:mb-8">
          <div className="text-xs font-mono font-semibold tracking-widest text-indigo-600 dark:text-[#818CF8] uppercase mb-2">
            05 / HOÀN THIỆN GÓC MÁY
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
            Chi tiết nhỏ. Khác biệt lớn.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#8E95A5] max-w-2xl leading-relaxed">
            Màn hình đồ họa, bàn phím cơ và chuột công thái học cho trải nghiệm làm việc năng suất mỗi ngày.
          </p>
        </div>

        {/* 3 Accessory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            ...FEATURED_ACCESSORIES,
            ...ADDITIONAL_PRODUCTS.filter(product => product.category === 'accessory')
          ].map(acc => (
            <div
              key={acc.id}
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#1E2330] hover:border-indigo-400 dark:hover:border-[#5856D6]/40 shadow-xs hover:shadow-lg transition-all duration-300 p-5 sm:p-6"
            >
              <div>
                {/* Image */}
                <div 
                  onClick={() => onSelectProduct(acc)}
                  className="relative aspect-[16/12] rounded-xl overflow-hidden bg-slate-100 dark:bg-[#0E1017] mb-5 cursor-pointer shadow-xs"
                >
                  <img
                    src={acc.image}
                    alt={acc.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 dark:from-[#11141B]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Brand */}
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8E95A5] font-semibold block mb-1">
                  {acc.brand}
                </span>

                {/* Title */}
                <h3 
                  onClick={() => onSelectProduct(acc)}
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#A5B4FC] transition-colors mb-2 cursor-pointer"
                >
                  {acc.name}
                </h3>

                {/* Specs */}
                <div className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mb-5">
                  {acc.specs.map((spec, idx) => (
                    <p key={idx}>{spec}</p>
                  ))}
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-[#1E2330]">
                <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                  <span className="text-xl sm:text-2xl font-bold">
                    {acc.price.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-sm font-medium text-slate-500 dark:text-[#94A3B8]">đ</span>
                </div>

                <button
                  onClick={() => onAddToCart(acc)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-[#161923] dark:hover:bg-[#5856D6] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Chọn mua</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
