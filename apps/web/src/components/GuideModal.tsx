import React from 'react';
import { X, Cpu, HardDrive, Monitor, ShieldCheck } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#1E2330] rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 z-10 max-h-[85vh] overflow-y-auto transition-colors duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161923] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-xs font-mono font-bold tracking-widest text-indigo-600 dark:text-[#818CF8] uppercase">
            CẨM NANG PHẦN CỨNG
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Hướng dẫn phân tích thông số kỹ thuật chuẩn
          </h2>
        </div>

        <div className="space-y-6 text-sm text-slate-700 dark:text-[#CBD5E1]">
          {/* Section 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161923] border border-slate-200 dark:border-[#1E2330]">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-2">
              <Cpu className="w-4 h-4 text-indigo-600 dark:text-[#818CF8]" />
              <span>1. Bộ vi xử lý (CPU): Số nhân vs Xung nhịp</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-2">
              Game thường yêu cầu hiệu năng đơn nhân cao (xung nhịp 4.8GHz trở lên). Trong khi đó, Lập trình (compile code), Máy ảo và Render 3D lại tận dụng tối đa số lượng nhân/luồng (từ 8 nhân 16 luồng trở lên).
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161923] border border-slate-200 dark:border-[#1E2330]">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-2">
              <HardDrive className="w-4 h-4 text-indigo-600 dark:text-[#818CF8]" />
              <span>2. Bộ nhớ (RAM & SSD NVMe)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-2">
              Chuẩn DDR5 6000MHz mang lại băng thông vượt trội so với DDR4. Với SSD, dòng PCIe 4.0/5.0 với tốc độ đọc 5.000MB/s giúp thời gian load dữ liệu và mở dự án nặng diễn ra tức thì.
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161923] border border-slate-200 dark:border-[#1E2330]">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-2">
              <Monitor className="w-4 h-4 text-indigo-600 dark:text-[#818CF8]" />
              <span>3. Màn hình: Độ phân giải & Chuẩn màu</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-2">
              Dành cho đồ họa: Nên chọn tấm nền IPS Black hoặc OLED với độ phủ 100% sRGB hoặc 100% DCI-P3, Delta E &lt; 2. Tần số quét 120Hz–165Hz giúp chuyển động chuột và cửa sổ mượt mà, giảm mỏi mắt.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-[#5856D6]/10 border border-indigo-200 dark:border-[#5856D6]/20 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-[#818CF8] shrink-0" />
            <p className="text-xs text-indigo-900 dark:text-[#A5B4FC]">
              Tất cả cấu hình tại TECHSTORE đều được kỹ sư test nhiệt độ và benchmark độ ổn định 24H trước khi bàn giao tới tay khách hàng.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
