import React from 'react';
import { Laptop, Cpu, HardDrive, Monitor, Headphones, Wifi } from 'lucide-react';
import { CATEGORIES } from '../data/products';

const iconMap: Record<string, React.ReactNode> = {
  Laptop: <Laptop className="w-6 h-6 text-indigo-600 dark:text-[#818CF8]" />,
  Cpu: <Cpu className="w-6 h-6 text-indigo-600 dark:text-[#818CF8]" />,
  HardDrive: <HardDrive className="w-6 h-6 text-indigo-600 dark:text-[#818CF8]" />,
  Monitor: <Monitor className="w-6 h-6 text-indigo-600 dark:text-[#818CF8]" />,
  Headphones: <Headphones className="w-6 h-6 text-indigo-600 dark:text-[#818CF8]" />,
  Wifi: <Wifi className="w-6 h-6 text-indigo-600 dark:text-[#818CF8]" />,
};

interface CategoryGridProps {
  onSelectCategory?: (id: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-[#0B0D11] border-t border-slate-200 dark:border-[#1E2330] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8 sm:mb-12">
          <div className="text-xs font-mono font-semibold tracking-widest text-indigo-600 dark:text-[#818CF8] uppercase mb-2">
            01 / KHÁM PHÁ DANH MỤC
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Đúng thiết bị. Đúng nhu cầu.
          </h2>
        </div>

        {/* 6 Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={cat.link}
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              className="group p-4 sm:p-6 rounded-2xl bg-slate-50/70 hover:bg-white dark:bg-[#11141B] dark:hover:bg-[#161923] border border-slate-200 dark:border-[#1E2330] hover:border-indigo-400 dark:hover:border-[#5856D6]/50 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-[#161923] group-hover:bg-indigo-50 dark:group-hover:bg-[#5856D6]/15 border border-slate-200 dark:border-[#1E2330] group-hover:border-indigo-200 dark:group-hover:border-[#5856D6]/30 flex items-center justify-center mb-4 transition-colors shadow-xs">
                {iconMap[cat.iconName] || <Laptop className="w-6 h-6 text-indigo-600 dark:text-[#818CF8]" />}
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#A5B4FC] transition-colors mb-1">
                  {cat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-[#8E95A5] line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
