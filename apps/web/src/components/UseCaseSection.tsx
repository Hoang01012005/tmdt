import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { USE_CASES } from '../data/products';

interface UseCaseSectionProps {
  onSelectUseCase?: (id: string) => void;
}

export const UseCaseSection: React.FC<UseCaseSectionProps> = ({ onSelectUseCase }) => {
  return (
    <section id="use-cases" className="py-12 sm:py-20 bg-white dark:bg-[#0B0D11] border-t border-slate-200 dark:border-[#1E2330] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8 sm:mb-12">
          <div className="text-xs font-mono font-semibold tracking-widest text-indigo-600 dark:text-[#818CF8] uppercase mb-2">
            04 / CHỌN THEO NHU CẦU THỰC TẾ
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Bạn muốn làm điều gì tiếp theo?
          </h2>
        </div>

        {/* 3 Workflow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {USE_CASES.map(uc => (
            <div
              key={uc.id}
              onClick={() => onSelectUseCase && onSelectUseCase(uc.id)}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-[#1E2330] hover:border-indigo-500/60 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-end aspect-[4/5] sm:aspect-[3/4]"
            >
              {/* Background Photography */}
              <div className="absolute inset-0 z-0">
                <img
                  src={uc.image}
                  alt={uc.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent opacity-90" />
              </div>

              {/* Card Content Overlay */}
              <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-end">
                {/* Badge */}
                <div className="inline-flex self-start items-center px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700 mb-3">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-indigo-300 uppercase">
                    {uc.badge}
                  </span>
                </div>

                {/* Title + Arrow */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-indigo-200 transition-colors">
                    {uc.title}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-white/15 group-hover:bg-indigo-600 flex items-center justify-center transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {uc.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
                  {uc.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] text-slate-200 bg-white/10 px-2.5 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
