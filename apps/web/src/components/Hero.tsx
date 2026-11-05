import React from 'react';
import { ArrowUpRight, Sparkles, Cpu, Zap, Eye } from 'lucide-react';
import type { Product } from '../types';

interface HeroProps {
  product: Product;
  onExplore: (product: Product) => void;
}

export const Hero: React.FC<HeroProps> = ({ product, onExplore }) => {
  return (
    <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden bg-gradient-to-b from-slate-100/90 via-slate-50 to-white dark:from-[#0B0D11] dark:via-[#0E1118] dark:to-[#0B0D11] transition-colors duration-200">
      
      {/* 1. Lưới kiến trúc công nghệ vi mô (Cyber Blueprint Matrix Grid) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f112_1px,transparent_1px),linear-gradient(to_bottom,#6366f112_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#38bdf815_1px,transparent_1px),linear-gradient(to_bottom,#38bdf815_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_35%,#000_65%,transparent_100%)] pointer-events-none" />

      {/* 2. Cực quang ánh sáng nghệ thuật đa sắc (Ambient Aurora Mesh Glow) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] sm:w-[950px] h-[400px] sm:h-[500px] bg-gradient-to-tr from-cyan-400/25 via-indigo-500/25 to-fuchsia-500/20 dark:from-cyan-500/20 dark:via-blue-600/25 dark:to-indigo-500/30 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-20 -left-20 w-[400px] h-[400px] bg-cyan-400/20 dark:bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-28 -right-20 w-[450px] h-[450px] bg-indigo-400/20 dark:bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* 3. Studio Exhibition Spotlight chiếu trực diện vào sản phẩm */}
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[950px] h-[260px] bg-gradient-to-r from-cyan-400/30 via-blue-500/35 to-indigo-500/30 dark:from-cyan-400/20 dark:via-blue-500/25 dark:to-indigo-500/20 blur-[85px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          
          {/* Subtitle / Kicker tag với hiệu ứng kính mờ */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-[#161923]/90 backdrop-blur-md border border-indigo-200/80 dark:border-indigo-500/30 mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-400"></span>
            </span>
            <span className="text-[11px] sm:text-xs font-bold tracking-wider text-indigo-700 dark:text-[#A5B4FC] uppercase font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              {product.badge || 'FLAGSHIP TECH SELECTION / 2026'}
            </span>
          </div>

          {/* Main Headline nghệ thuật */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.08] mb-6">
            Ý tưởng lớn.
            <br />
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
              Không giới hạn.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-[#94A3B8] leading-relaxed max-w-2xl mb-8">
            {product.description}
          </p>

          {/* CTA & Price Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-16 w-full sm:w-auto">
            <button
              onClick={() => onExplore(product)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Khám phá Yoga Pro 7</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <div className="flex items-baseline gap-1 text-slate-900 dark:text-white bg-white/60 dark:bg-slate-900/40 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">Giá chỉ:</span>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-cyan-400 font-mono">
                {product.price.toLocaleString('vi-VN')}
              </span>
              <span className="text-base font-bold text-slate-500 dark:text-[#94A3B8]">đ</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Display with Studio Floating Effect */}
        <div className="relative max-w-4xl mx-auto">
          {/* Ambient Rim Light Ring */}
          <div className="absolute -inset-1.5 rounded-[2.5rem] bg-gradient-to-r from-cyan-500/35 via-indigo-500/40 to-blue-500/35 blur-xl opacity-80 group-hover:opacity-100 transition duration-1000 -z-10" />

          {/* Laptop Container Card */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white/90 dark:bg-[#11141B]/95 backdrop-blur-xl border border-slate-200/90 dark:border-cyan-500/30 p-4 sm:p-8 shadow-2xl group transition-all">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 dark:from-[#0B0D11] dark:to-[#161923]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="eager"
              />
              
              {/* Subtle metallic reflection gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 dark:from-[#0B0D11] via-transparent to-transparent opacity-50 dark:opacity-80" />
              
              {/* Laptop Badge Label */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-3.5 py-2 rounded-xl bg-white/95 dark:bg-[#0E1017]/90 backdrop-blur-md border border-slate-200 dark:border-[#1E2330] shadow-md flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                <span className="text-xs sm:text-sm font-bold tracking-widest text-slate-900 dark:text-[#E2E8F0] uppercase font-mono">
                  {product.tag || 'YOGA PRO 7 (2026 EDITION)'}
                </span>
              </div>
            </div>
          </div>

          {/* Key Specs Pill Bar với hiệu ứng tinh tế */}
          <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4 p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-[#11141B]/90 backdrop-blur-md border border-slate-200 dark:border-[#1E2330] shadow-sm">
            <div className="flex flex-col items-center justify-center text-center p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#0B0D11]/60">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-wide flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
                RYZEN 7
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-[#8E95A5] mt-0.5 font-mono">
                8845HS · 8C/16T
              </span>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#0B0D11]/60 border-x border-slate-200 dark:border-[#1E2330]">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-wide flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                RTX 4050
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-[#8E95A5] mt-0.5 font-mono">
                6GB GDDR6 Ray Tracing
              </span>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[#0B0D11]/60">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-wide flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                3K / 120Hz
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-[#8E95A5] mt-0.5 font-mono">
                Màn hình 14.5" PureSight Pro
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
