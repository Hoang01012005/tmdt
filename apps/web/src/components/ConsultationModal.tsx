import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Eye, EyeOff, Mic, MicOff, Volume2, VolumeX, ShoppingCart, Sparkles } from 'lucide-react';
import { AICompanion3D } from './AICompanion3D';
import type { CompanionEmotion } from './AICompanion3D';
import type { Product } from '../types';
import { getAIConsultationResponse, fetchAIConsultation } from '../utils/aiConsultant';
import { HERO_PRODUCT } from '../data/products';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  products?: Product[];
}

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ lý AI Kỹ thuật viên của TechStore. Bạn đang tìm cấu hình phục vụ nhu cầu gì và mức ngân sách dự kiến là bao nhiêu?',
      products: [HERO_PRODUCT],
    },
  ]);
  const [input, setInput] = useState('');
  const [show3D, setShow3D] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState<CompanionEmotion>('neutral');
  const [lastBotReply, setLastBotReply] = useState<string>('Xin chào! Tôi là trợ lý AI TechStore.');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([HERO_PRODUCT]);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Tư vấn build PC 25 triệu',
    'Laptop sinh viên IT code mượt',
    'Nâng cấp RAM & SSD cho máy cũ',
    'Laptop gaming chiến game AAA',
    'Gợi ý combo bàn phím & chuột',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Push user message
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    if (!textToSend) setInput('');
    setCurrentEmotion('thinking');
    setIsThinking(true);

    try {
      // Gọi API OpenRouter LLM + D1 Context RAG
      const response = await fetchAIConsultation(text);

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: response.text,
          products: response.products,
        },
      ]);

      if (response.products && response.products.length > 0) {
        setRecommendedProducts(response.products);
      }
      setCurrentEmotion(response.emotion);
      if (!isVoiceMuted) {
        setLastBotReply(response.text);
      }
    } catch {
      const response = getAIConsultationResponse(text);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: response.text,
          products: response.products,
        },
      ]);

      if (response.products && response.products.length > 0) {
        setRecommendedProducts(response.products);
      }
      setCurrentEmotion(response.emotion);
      if (!isVoiceMuted) {
        setLastBotReply(response.text);
      }
    } finally {
      setIsThinking(false);
    }
  };

  // Web Speech Recognition (Chuyển giọng nói thành văn bản -> Hiện vào chat -> Model trả lời)
  const toggleVoiceInput = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói (Web Speech API). Hãy sử dụng Google Chrome hoặc Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setCurrentEmotion('neutral');
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = 'vi-VN';
      rec.continuous = false;
      rec.interimResults = true;

      rec.onstart = () => {
        setIsListening(true);
        setCurrentEmotion('listening');
        setInput('');
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onresult = (event: any) => {
        let currentTranscript = '';
        let isFinal = false;

        for (let i = 0; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }

        const text = currentTranscript.trim();
        setInput(text);

        if (isFinal && text) {
          setIsListening(false);
          setInput('');
          handleSend(text);
        }
      };

      rec.onerror = () => {
        setIsListening(false);
        setCurrentEmotion('neutral');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsListening(false);
      setCurrentEmotion('neutral');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md" />

      <div
        className={`relative w-full ${
          show3D ? 'max-w-5xl' : 'max-w-2xl'
        } bg-white/95 dark:bg-[#0E1118]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-cyan-500/30 rounded-2xl sm:rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.35)] dark:shadow-[0_0_80px_rgba(0,229,255,0.14)] flex flex-col z-10 overflow-hidden transition-all duration-300 max-h-[92vh]`}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-[#1E2330] flex items-center justify-between bg-slate-50 dark:bg-[#161923]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Trợ lý Ảo AI 3D TechStore</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-cyan-400 animate-pulse"></span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tương tác thời gian thực • Giọng nói & Khẩu hình 3D</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Mute/Unmute Toggle */}
            <button
              onClick={() => setIsVoiceMuted(!isVoiceMuted)}
              title={isVoiceMuted ? 'Bật giọng đọc AI' : 'Tắt giọng đọc AI'}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#1F2533] hover:bg-slate-100 dark:hover:bg-[#2B3346] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {isVoiceMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
              <span className="hidden sm:inline">{isVoiceMuted ? 'Đã tắt tiếng' : 'Giọng đọc AI'}</span>
            </button>

            {/* Toggle 3D View */}
            <button
              onClick={() => setShow3D(!show3D)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#1F2533] hover:bg-slate-100 dark:hover:bg-[#2B3346] text-slate-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/30 transition-all cursor-pointer shadow-xs"
            >
              {show3D ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-cyan-500" />}
              <span className="hidden sm:inline">{show3D ? 'Thu gọn 3D' : 'Xem Mô hình 3D'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E2330] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-[480px]">
          {/* Left: 3D Companion Canvas */}
          {show3D && (
            <div className="lg:w-1/2 p-3 sm:p-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-[#1E2330] flex flex-col justify-center bg-slate-900">
              <AICompanion3D
                currentEmotion={currentEmotion}
                onEmotionChange={setCurrentEmotion}
                speechText={isVoiceMuted ? undefined : lastBotReply}
                onVoiceSubmit={(transcript) => handleSend(transcript)}
              />
            </div>
          )}

          {/* Right: Chat History & Input */}
          <div className={`flex flex-col flex-1 overflow-hidden ${show3D ? 'lg:w-1/2' : 'w-full'} bg-slate-50/50 dark:bg-[#0B0D11]`}>
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[380px] lg:max-h-[460px]">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 max-w-[92%] ${
                    m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      m.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-[#161923] text-indigo-600 dark:text-cyan-400 border border-slate-200 dark:border-cyan-500/30 shadow-xs'
                    }`}
                  >
                    {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-sm'
                          : 'bg-white dark:bg-[#161923] text-slate-800 dark:text-[#E2E8F0] border border-slate-200 dark:border-[#1E2330] rounded-tl-none shadow-xs'
                      }`}
                    >
                      {m.text}
                    </div>


                  </div>
                </div>
              ))}

              {/* Dynamic Typing / Searching Indicator (Spring Physics Bouncy Dots) */}
              {isThinking && (
                <div className="flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-white dark:bg-[#161923] text-indigo-600 dark:text-cyan-400 border border-slate-200 dark:border-cyan-500/30 shadow-xs">
                    <Bot className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-none bg-white dark:bg-[#161923] border border-slate-200 dark:border-[#1E2330] shadow-xs text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                    </span>
                    <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                      Đang tra cứu dữ liệu Cloudflare D1 & suy nghĩ...
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompts */}
            <div className="p-2.5 bg-slate-100/70 dark:bg-[#11141B] border-t border-slate-200 dark:border-[#1E2330] flex gap-2 overflow-x-auto no-scrollbar">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(p)}
                  className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-[#161923] hover:bg-indigo-50 dark:hover:bg-cyan-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E2330] hover:border-indigo-300 dark:hover:border-cyan-500/40 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer shadow-xs"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* ===== Recommended Products Panel ===== */}
            {recommendedProducts.length > 0 && (
              <div className="border-t border-slate-200 dark:border-[#1E2330] bg-white dark:bg-[#0E1118]">
                {/* Header */}
                <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider">
                    Sản phẩm đề xuất
                  </span>
                </div>
                {/* Product list - horizontal scroll */}
                <div className="flex gap-2 px-3 pb-3 overflow-x-auto no-scrollbar">
                  {recommendedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex-shrink-0 w-48 flex flex-col rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-[#131722] overflow-hidden hover:border-indigo-400 dark:hover:border-cyan-500/50 transition-colors shadow-xs"
                    >
                      {/* Product image */}
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-24 object-cover bg-slate-100 dark:bg-slate-800"
                      />
                      {/* Info */}
                      <div className="p-2 flex flex-col gap-1 flex-1">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-500 dark:text-cyan-400">
                          {prod.brand}
                        </span>
                        <p className="text-[11px] font-semibold text-slate-800 dark:text-white leading-tight line-clamp-2">
                          {prod.name}
                        </p>
                        <p className="text-[11px] font-bold text-indigo-600 dark:text-cyan-300 mt-auto">
                          {prod.price.toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                      {/* Add to cart button */}
                      {onAddToCart && (
                        <button
                          type="button"
                          onClick={() => onAddToCart(prod)}
                          className="flex items-center justify-center gap-1.5 w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 hover:from-blue-500 hover:to-indigo-500 dark:hover:from-cyan-400 dark:hover:to-blue-500 text-white text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Thêm vào giỏ hàng
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real-time Voice Listening Indicator */}
            {isListening && (
              <div className="px-4 py-2 bg-rose-50 dark:bg-gradient-to-r dark:from-rose-950/60 dark:via-red-900/40 dark:to-slate-900 border-t border-rose-300 dark:border-rose-500/40 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span>Đang nghe bạn nói... (Nói xong AI sẽ tự đưa vào chat và trả lời)</span>
                </span>
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className="px-2.5 py-1 rounded bg-rose-200 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 hover:bg-rose-300 dark:hover:bg-rose-500/30 font-semibold cursor-pointer text-[11px]"
                >
                  Dừng nói
                </button>
              </div>
            )}

            {/* Input Bar with Real-time Voice Button */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-slate-200 dark:border-[#1E2330] bg-white dark:bg-[#11141B] flex items-center gap-2"
            >
              {/* Voice Microphone Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                title={isListening ? 'Đang lắng nghe... bấm để dừng' : 'Bấm để nói tiếng Việt trực tiếp'}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-100 border-rose-500 text-rose-600 animate-pulse shadow-sm'
                    : 'bg-slate-100 dark:bg-[#161923] border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 hover:border-indigo-300'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Đang lắng nghe bạn nói...' : 'Hỏi về cấu hình, tư vấn công nghệ...'}
                className="flex-1 bg-slate-100 dark:bg-[#0B0D11] border border-slate-200 dark:border-[#1E2330] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-[#0B0D11] transition-colors"
              />

              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold flex items-center justify-center transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
