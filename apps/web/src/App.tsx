import React, { useState, useEffect } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryGrid } from './components/CategoryGrid';
import { LaptopShowcase } from './components/LaptopShowcase';
import { ComponentShowcase } from './components/ComponentShowcase';
import { UseCaseSection } from './components/UseCaseSection';
import { AccessoryShowcase } from './components/AccessoryShowcase';
import { GuideSection } from './components/GuideSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CompareModal } from './components/CompareModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ConsultationModal } from './components/ConsultationModal';
import { GuideModal } from './components/GuideModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { MyOrdersModal } from './components/MyOrdersModal';

import type { Product, CartItem, User, Order } from './types';
import { HERO_PRODUCT, FEATURED_LAPTOPS, FEATURED_ACCESSORIES } from './data/products';
import { fetchCart, addToCartApi, updateCartApi, getStoredUser, clearStoredUser, fetchOrderByIdApi } from './api';

export const App: React.FC = () => {
  // View mode: 'store' or 'admin'
  const [viewMode, setViewMode] = useState<'store' | 'admin'>('store');

  // Theme state: defaults to 'light' (Option A: bright, clean UI)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('techstore_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('techstore_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: HERO_PRODUCT, quantity: 1 },
    { product: FEATURED_ACCESSORIES[0], quantity: 1 }, // Keychron K2
    { product: FEATURED_ACCESSORIES[1], quantity: 1 }  // Logitech MX Master 3S
  ]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Sync cart from Cloudflare KV
  useEffect(() => {
    fetchCart().then(cart => {
      if (cart && cart.items && cart.items.length > 0) {
        setCartItems(cart.items);
      }
    });
  }, []);

  // Comparison state
  const [comparedProducts, setComparedProducts] = useState<Product[]>([
    FEATURED_LAPTOPS[0],
    FEATURED_LAPTOPS[2]
  ]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Customer Orders & Lookup
  const [myOrdersModalOpen, setMyOrdersModalOpen] = useState(false);
  const [customerSelectedOrder, setCustomerSelectedOrder] = useState<Order | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => {
    clearStoredUser();
    setCurrentUser(null);
    setViewMode('store');
    showToast('Đã đăng xuất thành công');
  };

  const handleAddToCart = (product: Product) => {
    // Optimistic UI update
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    // Sync to Cloudflare KV
    addToCartApi(product.id, 1).then(updated => {
      if (updated && updated.items) {
        setCartItems(updated.items);
      }
    });
    showToast(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
    updateCartApi(productId, quantity).then(updated => {
      if (updated && updated.items) {
        setCartItems(updated.items);
      }
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    updateCartApi(productId, 0).then(updated => {
      if (updated && updated.items) {
        setCartItems(updated.items);
      }
    });
    showToast('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const handleCompareToggle = (product: Product) => {
    const exists = comparedProducts.some(p => p.id === product.id);
    if (exists) {
      setComparedProducts(prev => prev.filter(p => p.id !== product.id));
      showToast(`Đã bỏ so sánh "${product.name}"`);
    } else {
      if (comparedProducts.length >= 4) {
        showToast('Bạn chỉ có thể so sánh tối đa 4 thiết bị cùng lúc');
        return;
      }
      setComparedProducts(prev => [...prev, product]);
      setCompareModalOpen(true);
    }
  };

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // If in Admin Console mode
  if (viewMode === 'admin') {
    return (
      <AdminDashboard
        onBackToStore={() => setViewMode('store')}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-[#0B0D11] text-slate-900 dark:text-[#F8FAFC] selection:bg-cyan-500 selection:text-black flex flex-col font-sans transition-colors duration-200 relative`}>
      
      {/* Global Subtle Ambient Tech Texture */}
      <div className="fixed inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:32px_32px] opacity-30 dark:opacity-35 pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-white dark:bg-[#161923] border border-slate-200 dark:border-cyan-500/60 text-slate-900 dark:text-white text-xs sm:text-sm shadow-xl dark:shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-cyan-400"></span>
            <span>{toastMessage}</span>
          </div>
        )}

      {/* Floating Compare Bar */}
      {comparedProducts.length > 0 && (
        <div className="fixed bottom-6 left-6 z-40 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-[#11141B]/95 backdrop-blur-md border border-slate-200 dark:border-cyan-500/40 shadow-xl dark:shadow-2xl">
          <span className="text-xs text-slate-600 dark:text-[#CBD5E1]">
            Đang so sánh <strong className="text-slate-900 dark:text-white font-bold">{comparedProducts.length}</strong> máy
          </span>
          <button
            onClick={() => setCompareModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-md shadow-indigo-600/20"
          >
            Mở bảng so sánh
          </button>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onSearch={(query) => {
          if (query.trim().length > 1) {
            const el = document.getElementById('laptops');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpenConsultation={() => setConsultationOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAdmin={() => setViewMode('admin')}
        onOpenMyOrders={() => setMyOrdersModalOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          product={HERO_PRODUCT}
          onExplore={(p) => setSelectedProduct(p)}
        />

        {/* Section 01: Categories */}
        <CategoryGrid
          onSelectCategory={(id) => {
            const target = id === 'laptop' ? 'laptops' : id === 'peripherals' || id === 'audio' ? 'accessories' : 'components';
            const el = document.getElementById(target);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Section 02: Laptops */}
        <LaptopShowcase
          onAddToCart={handleAddToCart}
          onCompareToggle={handleCompareToggle}
          comparedIds={comparedProducts.map(p => p.id)}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />

        {/* Section 03: Components */}
        <ComponentShowcase
          onAddToCart={handleAddToCart}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />

        {/* Section 04: Use Cases */}
        <UseCaseSection
          onSelectUseCase={() => {
            const el = document.getElementById('laptops');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Section 05: Accessories */}
        <AccessoryShowcase
          onAddToCart={handleAddToCart}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />

        {/* Section 06: Knowledge & Consultation */}
        <GuideSection
          onOpenConsultation={() => setConsultationOpen(true)}
          onOpenGuideModal={() => setGuideModalOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Drawers & Modals */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutModalOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        items={cartItems}
        currentUser={currentUser}
        onOrderSuccess={(orderId) => {
          setCartItems([]);
          showToast(`Đặt hàng thành công! Mã đơn: ${orderId}`);
        }}
        onViewOrderDetails={async (orderId) => {
          const ord = await fetchOrderByIdApi(orderId);
          if (ord) {
            setCustomerSelectedOrder(ord);
          }
        }}
      />

      <CompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        products={comparedProducts}
        onAddToCart={handleAddToCart}
        onRemoveCompare={(id) => {
          setComparedProducts(prev => prev.filter(p => p.id !== id));
        }}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <ConsultationModal
        isOpen={consultationOpen}
        onClose={() => setConsultationOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <GuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Xin chào ${user.name}!`);
        }}
      />

      {/* Customer Orders & Lookup Modal */}
      <MyOrdersModal
        isOpen={myOrdersModalOpen}
        onClose={() => setMyOrdersModalOpen(false)}
        currentUser={currentUser}
        onSelectOrder={(ord) => {
          setCustomerSelectedOrder(ord);
        }}
      />

      {/* Customer Order Detail Modal */}
      <OrderDetailModal
        order={customerSelectedOrder}
        isOpen={!!customerSelectedOrder}
        isAdmin={false}
        onClose={() => setCustomerSelectedOrder(null)}
      />

        {/* Floating 3D AI Companion Trigger Button */}
        <button
          onClick={() => setConsultationOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-medium shadow-[0_0_25px_rgba(0,229,255,0.45)] hover:shadow-[0_0_35px_rgba(0,229,255,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer border border-cyan-400/40"
          aria-label="Mở Trợ lý AI 3D"
        >
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping absolute -top-0.5 -right-0.5" />
            <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-200" />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-tight flex items-center gap-1">
              Trợ Lý Ảo AI 3D
              <Sparkles className="w-3 h-3 text-cyan-200" />
            </span>
            <span className="text-[10px] text-cyan-100/80 font-mono">Hỏi đáp & Báo giá</span>
          </div>
        </button>

      </div>
    </div>
  );
};

export default App;
