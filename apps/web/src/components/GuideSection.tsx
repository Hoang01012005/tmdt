import React from 'react';
import { BookOpen, MessageSquare, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface GuideSectionProps {
  onOpenConsultation: () => void;
  onOpenGuideModal: () => void;
}

export const GuideSection: React.FC<GuideSectionProps> = ({
  onOpenConsultation,
  onOpenGuideModal
}) => {
  return (
    <section className="py-12 sm:py-20 bg-slate-50 dark:bg-[#0B0D11] border-t border-slate-200 dark:border-[#1E2330] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8 sm:mb-12">
          <div className="text-xs font-mono font-semibold tracking-widest text-indigo-600 dark:text-[#818CF8] uppercase mb-2">
            06 / CHỌN VỚI SỰ TỰ TIN
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Thông số rõ. Quyết định đúng.
          </h2>
        </div>

        {/* 2 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Card 1: Guide */}
          <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#1E2330] p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-[#5856D6]/15 border border-indigo-200 dark:border-[#5856D6]/30 flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-[#818CF8]" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Đọc thông số, hiểu nhu cầu
              </h3>

              <p className="text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-6">
                Không chỉ nhìn vào xung nhịp hay dung lượng. Hiểu đúng cấu hình giúp bạn đầu tư hiệu quả, bền bỉ theo thời gian.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <strong className="text-slate-900 dark:text-white font-semibold">Học tập, văn phòng cơ bản:</strong>
                    <span className="text-slate-500 dark:text-[#8E95A5] block sm:inline sm:ml-1.5">8–16GB RAM, SSD 512GB</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <strong className="text-slate-900 dark:text-white font-semibold">Code, máy ảo & dữ liệu:</strong>
                    <span className="text-slate-500 dark:text-[#8E95A5] block sm:inline sm:ml-1.5">16–32GB RAM, CPU 8+ nhân</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <strong className="text-slate-900 dark:text-white font-semibold">Dựng phim, render 3D:</strong>
                    <span className="text-slate-500 dark:text-[#8E95A5] block sm:inline sm:ml-1.5">GPU rời 6GB+ VRAM, 32GB+ RAM</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenGuideModal}
              className="w-full sm:w-auto self-start px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#161923] dark:hover:bg-[#1E2330] border border-slate-200 dark:border-[#1E2330] text-sm font-semibold text-slate-800 dark:text-white flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <span>Mở bản hướng dẫn chi tiết</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:text-[#8E95A5] dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </button>
          </div>

          {/* Card 2: Consultation */}
          <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-gradient-to-br dark:from-[#11141B] dark:to-[#141724] border border-slate-200 dark:border-[#1E2330] p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-[#5856D6]/20 border border-indigo-200 dark:border-[#5856D6]/40 flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-[#A5B4FC]" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Tư vấn đúng cấu hình
              </h3>

              <p className="text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-6">
                Cùng chọn linh kiện phù hợp với ngân sách và công việc thực tế của bạn. Đội ngũ kỹ thuật viên và Trợ lý AI 3D đồng hành 24/7.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161923]/80 border border-slate-200 dark:border-[#1E2330] mb-8 space-y-2">
                <div className="text-xs font-mono font-semibold text-indigo-600 dark:text-[#818CF8] uppercase tracking-wider">
                  Cam kết dịch vụ
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
                  Linh kiện chính hãng 100%, bảo hành 1 đổi 1 trong 30 ngày đầu tiên nếu phát sinh lỗi từ nhà sản xuất.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenConsultation}
              className="w-full sm:w-auto self-start px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer group"
            >
              <span>Trò chuyện cùng Trợ lý AI</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
