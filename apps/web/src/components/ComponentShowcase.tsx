import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../types';
import { FEATURED_COMPONENTS } from '../data/products';

interface ComponentShowcaseProps {
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ComponentShowcase: React.FC<ComponentShowcaseProps> = ({
  onAddToCart,
  onSelectProduct
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const tabs = [
    { id: 'all', label: 'Tất cả linh kiện' },
    { id: 'gpu', label: 'Card đồ họa (GPU)' },
    { id: 'cpu', label: 'Vi xử lý (CPU)' },
    { id: 'ram', label: 'Bộ nhớ RAM' },
    { id: 'ssd', label: 'Ổ cứng SSD' },
    { id: 'psu', label: 'Nguồn & Tản nhiệt' }
  ];

  const filteredComponents = FEATURED_COMPONENTS.filter(comp => {
    if (activeTab === 'all') return true;
    return comp.subCategory === activeTab;
  });

  return (
    <section id="components" className="py-12 sm:py-20 bg-white dark:bg-[#0B0D11] border-t border-slate-200 dark:border-[#1E2330] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-6 sm:mb-8">
          <div className="text-xs font-mono font-semibold tracking-widest text-indigo-600 dark:text-[#818CF8] uppercase mb-2">
            03 / TỪNG LINH KIỆN. MỘT HỆ THỐNG.
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
            Nâng cấp có chủ đích.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#8E95A5] max-w-2xl leading-relaxed">
            Bắt đầu từ điểm nghẽn. Chọn phần cứng chuẩn chính hãng để hệ thống của bạn hoạt động bền bỉ, êm mát.
          </p>
        </div>

        {/* Component Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm dark:bg-[#1E2138] dark:text-[#818CF8] dark:border dark:border-[#5856D6]'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 dark:bg-[#11141B] dark:text-[#8E95A5] dark:hover:text-white dark:border-[#1E2330]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Component Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {filteredComponents.map(comp => (
            <div
              key={comp.id}
              className="group flex flex-col justify-between rounded-2xl bg-slate-50/70 hover:bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#1E2330] hover:border-indigo-400 dark:hover:border-[#5856D6]/40 shadow-xs hover:shadow-lg transition-all duration-300 p-5 sm:p-6"
            >
              <div>
                {/* Image */}
                <div 
                  onClick={() => onSelectProduct(comp)}
                  className="relative aspect-[16/12] rounded-xl overflow-hidden bg-white dark:bg-[#0E1017] mb-5 cursor-pointer shadow-xs"
                >
                  <img
                    src={comp.image}
                    alt={comp.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 dark:from-[#11141B]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Tag */}
                <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 dark:text-[#818CF8] font-bold block mb-1.5">
                  {comp.tag || `${comp.subCategory?.toUpperCase() || 'PHẦN CỨNG'} / CHÍNH HÃNG`}
                </span>

                {/* Title */}
                <h3 
                  onClick={() => onSelectProduct(comp)}
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#A5B4FC] transition-colors mb-2 cursor-pointer"
                >
                  {comp.name}
                </h3>

                {/* Specs */}
                <div className="text-xs text-slate-500 dark:text-[#94A3B8] space-y-1 mb-5">
                  {comp.specs.map((spec, idx) => (
                    <p key={idx} className="leading-snug">
                      {spec}
                    </p>
                  ))}
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-[#1E2330]">
                <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                  <span className="text-xl sm:text-2xl font-bold">
                    {comp.price.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-sm font-medium text-slate-500 dark:text-[#94A3B8]">đ</span>
                </div>

                <button
                  onClick={() => onAddToCart(comp)}
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
