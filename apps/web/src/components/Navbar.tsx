import React, { useState } from 'react';
import { Menu, X, ShoppingBag, Search, ChevronDown, Phone, SlidersHorizontal, ArrowUpRight, User as UserIcon, Shield, LogOut, Sun, Moon, Package, Truck } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onSearch: (query: string) => void;
  onOpenConsultation: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenMyOrders: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onSearch,
  onOpenConsultation,
  currentUser,
  onOpenAuth,
  onOpenAdmin,
  onOpenMyOrders,
  onLogout,
  theme,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0B0D11]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E2330] transition-colors duration-200">
      {/* Top Banner for Desktop */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1.5 text-xs text-slate-500 dark:text-[#8E95A5] border-b border-slate-200/80 dark:border-[#1E2330]/60 bg-slate-50 dark:bg-[#0E1017]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Hệ thống bán lẻ phần cứng & laptop chính hãng TECHSTORE (NOVATECH)
          </span>
          <span className="text-slate-300 dark:text-[#2E3547]">|</span>
          <span>Bảo hành 1 đổi 1 trong 30 ngày</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={onOpenMyOrders}
            className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
          >
            <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>Tra cứu đơn hàng</span>
          </button>
          <button 
            onClick={onOpenConsultation}
            className="hover:text-cyan-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            Tư vấn kỹ thuật online
          </button>
          <a href="tel:19008888" className="flex items-center gap-1.5 hover:text-cyan-600 dark:hover:text-white transition-colors">
            <Phone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Hotline: <strong className="text-slate-800 dark:text-white font-medium">1900 8888</strong></span>
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-[#8E95A5] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20">
              T
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-slate-900 dark:text-white">
                TECHSTORE
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <div 
              className="relative"
              onMouseEnter={() => setDropdownOpen('laptops')}
              onMouseLeave={() => setDropdownOpen(null)}
            >
              <a 
                href="#laptops" 
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-[#CBD5E1] hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161923] rounded-lg transition-colors"
              >
                Laptop
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#8E95A5]" />
              </a>

              {dropdownOpen === 'laptops' && (
                <div className="absolute top-full left-0 w-64 p-3 bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#1E2330] rounded-xl shadow-xl dark:shadow-2xl backdrop-blur-xl animate-in fade-in duration-150">
                  <a href="#laptops" className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1E2330] text-sm text-slate-800 dark:text-[#E2E8F0] transition-colors">
                    <div>
                      <div className="font-medium">Laptop Đồ họa & Sáng tạo</div>
                      <div className="text-xs text-slate-500 dark:text-[#8E95A5]">Màn chuẩn màu, GPU RTX</div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-[#8E95A5]" />
                  </a>
                  <a href="#laptops" className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1E2330] text-sm text-slate-800 dark:text-[#E2E8F0] transition-colors">
                    <div>
                      <div className="font-medium">Laptop Gaming Hiệu năng cao</div>
                      <div className="text-xs text-slate-500 dark:text-[#8E95A5]">165Hz+, tản nhiệt buồng hơi</div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-[#8E95A5]" />
                  </a>
                </div>
              )}
            </div>

            <a 
              href="#components" 
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-[#CBD5E1] hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161923] rounded-lg transition-colors"
            >
              Linh kiện PC
            </a>

            <a 
              href="#accessories" 
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-[#CBD5E1] hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161923] rounded-lg transition-colors"
            >
              Màn hình & Phụ kiện
            </a>

            <a 
              href="#laptops" 
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-[#CBD5E1] hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161923] rounded-lg transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Build Cấu hình
              <span className="text-[10px] uppercase font-bold tracking-wider bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-500/30">
                AI Match
              </span>
            </a>

            <button 
              onClick={onOpenConsultation}
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-[#CBD5E1] hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161923] rounded-lg transition-colors cursor-pointer"
            >
              Tư vấn cấu hình
            </button>

            <button 
              onClick={onOpenMyOrders}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-[#161923] rounded-lg transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Tra cứu đơn</span>
            </button>
          </nav>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xs xl:max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#8E95A5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Tìm laptop, card RTX 4060, chuột..."
                className="w-full bg-slate-100 dark:bg-[#11141B] border border-slate-200 dark:border-[#1E2330] rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#5B6170] focus:outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-[#11141B] focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-[#11141B] dark:hover:bg-[#161923] dark:text-amber-400 dark:border-[#1E2330] transition-all cursor-pointer flex items-center gap-1.5"
              title={theme === 'light' ? 'Chuyển sang chế độ Tối (Dark Mode)' : 'Chuyển sang chế độ Sáng (Light Mode)'}
              aria-label="Đổi giao diện"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden xl:inline text-xs font-semibold text-slate-600">Giao diện Tối</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden xl:inline text-xs font-semibold text-slate-300">Giao diện Sáng</span>
                </>
              )}
            </button>

            {/* User Account / Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-[#11141B] dark:hover:bg-[#161923] dark:border-cyan-500/30 transition-all cursor-pointer group"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-cyan-500/60"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 p-2 rounded-2xl bg-white dark:bg-[#11141B] border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-2xl backdrop-blur-xl z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{currentUser.email}</p>
                      {currentUser.role === 'admin' && (
                        <span className="mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-bold">
                          ADMINISTRATOR
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { setUserMenuOpen(false); onOpenMyOrders(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                        <span>Đơn hàng của tôi</span>
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => { setUserMenuOpen(false); onOpenAdmin(); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors text-left cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          <span>Trang Quản trị (Admin)</span>
                        </button>
                      )}

                      <button
                        onClick={() => { setUserMenuOpen(false); onLogout(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 dark:bg-[#11141B] dark:hover:bg-[#161923] dark:border-cyan-500/30 dark:text-white text-xs font-semibold hover:border-cyan-500 transition-all cursor-pointer shadow-xs"
              >
                <UserIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-slate-800 dark:text-white bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-[#11141B] dark:hover:bg-[#161923] dark:border-[#1E2330] rounded-xl transition-all cursor-pointer group shadow-xs"
              aria-label="Giỏ hàng"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-slate-700 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                Giỏ hàng
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search & Controls */}
        <div className="lg:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#8E95A5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm máy tính, phụ kiện..."
              className="w-full bg-slate-100 dark:bg-[#11141B] border border-slate-200 dark:border-[#1E2330] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#5B6170] focus:outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-[#11141B] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-[#1E2330] bg-white dark:bg-[#0E1017] px-4 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200 shadow-xl">
          <div className="space-y-1">
            <a
              href="#laptops"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-base font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-[#161923] rounded-lg"
            >
              Laptop Tuyển Chọn
            </a>
            <a
              href="#components"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-base font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-[#161923] rounded-lg"
            >
              Linh kiện PC & Tản nhiệt
            </a>
            <a
              href="#accessories"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-base font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-[#161923] rounded-lg"
            >
              Màn hình & Phụ kiện
            </a>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenMyOrders(); }}
              className="w-full text-left px-3 py-2.5 text-base font-medium text-blue-600 dark:text-cyan-400 hover:bg-slate-100 dark:hover:bg-[#161923] rounded-lg cursor-pointer flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Đơn hàng của tôi & Tra cứu</span>
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenConsultation(); }}
              className="w-full text-left px-3 py-2.5 text-base font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-[#161923] rounded-lg cursor-pointer"
            >
              Tư vấn cấu hình AI
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
