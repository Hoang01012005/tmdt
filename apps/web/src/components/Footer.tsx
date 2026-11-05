import React, { useState } from 'react';
import { Check, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-slate-100 dark:bg-[#0B0D11] border-t border-slate-200 dark:border-[#1E2330] pt-16 pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-200 dark:border-[#1E2330]">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20">
                T
              </div>
              <span className="text-2xl font-black tracking-wider text-slate-900 dark:text-white">
                TECHSTORE
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-[#8E95A5] max-w-sm leading-relaxed">
              Công nghệ tiên phong. Hiệu năng đỉnh cao. Cung cấp máy tính và linh kiện cao cấp cho lập trình viên, nhà sáng tạo nội dung và game thủ chuyên nghiệp.
            </p>

            <div className="pt-2 text-xs text-slate-500 dark:text-[#5B6170] space-y-1">
              <p>Hotline hỗ trợ: 1900 8888 (8:00 - 21:00 hàng ngày)</p>
              <p>Email liên hệ: contact@novatech.vn</p>
              <p>Trụ sở chính: 182 Thái Hà, Đống Đa, Hà Nội</p>
            </div>
          </div>

          {/* Links 1: Khám phá */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase mb-4">
              Khám phá
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-[#8E95A5]">
              <li>
                <a href="#laptops" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                  Laptop Tuyển Chọn
                </a>
              </li>
              <li>
                <a href="#components" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                  Linh kiện PC & Tản nhiệt
                </a>
              </li>
              <li>
                <a href="#accessories" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                  Màn hình đồ họa & Chuột phím
                </a>
              </li>
              <li>
                <a href="#use-cases" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                  Cấu hình theo nhu cầu thực tế
                </a>
              </li>
            </ul>
          </div>

          {/* Links 2: Hỗ trợ khách hàng */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase mb-4">
              Chính sách
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-[#8E95A5]">
              <li>
                <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                  Chính sách bảo hành 1 đổi 1
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                  Vận chuyển & Giao hàng toàn quốc
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                  Thanh toán VietQR tự động
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                  Điều khoản mua hàng
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase">
              Bản tin công nghệ
            </h4>
            <p className="text-xs text-slate-600 dark:text-[#8E95A5] leading-relaxed">
              Nhận thông báo ưu đãi độc quyền và các bài đánh giá phần cứng chuyên sâu mỗi tuần.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn..."
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#1E2330] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#5B6170] focus:outline-none focus:border-indigo-500 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                  title="Đăng ký"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {subscribed && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã đăng ký nhận bản tin thành công!</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-[#5B6170]">
          <p>© 2026 TECHSTORE. Bản quyền thuộc về hệ thống TMDT cao cấp.</p>
          <div className="flex items-center gap-6">
            <span>Powered by Cloudflare Workers & D1</span>
            <span>Trợ lý AI 3D Realtime</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
