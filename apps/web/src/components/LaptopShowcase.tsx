import React, { useState } from 'react';
import { Plus, Check, ShoppingCart } from 'lucide-react';
import type { Product } from '../types';
import { FEATURED_LAPTOPS } from '../data/products';

interface LaptopShowcaseProps {
  onAddToCart: (product: Product) => void;
  onCompareToggle: (product: Product) => void;
  comparedIds: string[];
  onSelectProduct: (product: Product) => void;
}

export const LaptopShowcase: React.FC<LaptopShowcaseProps> = ({
  onAddToCart,
  onCompareToggle,
  comparedIds,
  onSelectProduct
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'office' | 'gaming' | 'design'>('all');

  const filteredLaptops = FEATURED_LAPTOPS.filter(p => {
    if (activeTab === 'all') return true;
    return p.subCategory === activeTab;
  });

  return (
    <section id="laptops" className="py-12 sm:py-20 bg-slate-50 dark:bg-[#0B0D11] border-t border-slate-200 dark:border-[#1E2330] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-6 sm:mb-8">
          <div className="text-xs font-mono font-semibold tracking-widest text-indigo-600 dark:text-[#818CF8] uppercase mb-2">
            02 / LAPTOP TUYỂN CHỌN
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
            Hiệu năng theo cách của bạn.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#8E95A5] max-w-2xl leading-relaxed">
            Từ giảng đường đến studio. Chọn cấu hình phù hợp, tối ưu ngân sách và độ bền dài lâu.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {[
            { id: 'all', label: 'Tất cả laptop' },
            { id: 'office', label: 'Văn phòng & Sinh viên' },
            { id: 'gaming', label: 'Gaming & Đồ họa nặng' },
            { id: 'design', label: 'Thiết kế & Sáng tạo' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm dark:bg-[#1E2138] dark:text-[#818CF8] dark:border dark:border-[#5856D6]'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 dark:bg-[#11141B] dark:text-[#8E95A5] dark:hover:text-white dark:border-[#1E2330]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredLaptops.map(lap => {
            const isCompared = comparedIds.includes(lap.id);
            return (
              <div
                key={lap.id}
                className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#1E2330] hover:border-indigo-400 dark:hover:border-[#5856D6]/50 shadow-xs hover:shadow-lg transition-all duration-300 p-4 sm:p-5"
              >
                <div>
                  {/* Image */}
                  <div 
                    onClick={() => onSelectProduct(lap)}
                    className="relative aspect-[16/11] rounded-xl overflow-hidden bg-slate-100 dark:bg-[#0E1017] mb-4 cursor-pointer"
                  >
                    <img
                      src={lap.image}
                      alt={lap.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 dark:from-[#11141B]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Brand */}
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8E95A5] font-semibold block mb-1">
                    {lap.brand}
                  </span>

                  {/* Title */}
                  <h3 
                    onClick={() => onSelectProduct(lap)}
                    className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#A5B4FC] transition-colors mb-3 cursor-pointer line-clamp-1"
                  >
                    {lap.name}
                  </h3>

                  {/* Specs */}
                  <div className="text-xs text-slate-500 dark:text-[#94A3B8] space-y-1 mb-4">
                    {lap.specs.map((spec, idx) => (
                      <p key={idx} className="leading-snug">
                        {spec}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  {/* Price Row */}
                  <div className="flex items-baseline justify-between pt-3 border-t border-slate-100 dark:border-[#1E2330] mb-3">
                    <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {lap.price.toLocaleString('vi-VN')} đ
                    </span>
                    <button
                      onClick={() => onAddToCart(lap)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white dark:bg-[#161923] dark:hover:bg-[#5856D6] dark:text-[#8E95A5] dark:hover:text-white transition-colors cursor-pointer"
                      title="Thêm vào giỏ hàng"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Compare Button */}
                  <button
                    onClick={() => onCompareToggle(lap)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isCompared
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-[#5856D6]/20 dark:text-[#A5B4FC] dark:border-[#5856D6]/40'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#161923] dark:text-[#8E95A5] dark:hover:text-white dark:hover:bg-[#1E2330]'
                    }`}
                  >
                    {isCompared ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isCompared ? 'Đã thêm so sánh' : 'So sánh'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
