import type { Product } from '../types';
import type { CompanionEmotion } from '../components/AICompanion3D';
import {
  HERO_PRODUCT,
  FEATURED_LAPTOPS,
  FEATURED_COMPONENTS,
  FEATURED_ACCESSORIES,
} from '../data/products';

export interface AIResponse {
  text: string;
  emotion: CompanionEmotion;
  products?: Product[];
  cached?: boolean;
}

export const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'session_default';
  let sid = localStorage.getItem('ai_consultation_session_id');
  if (!sid) {
    sid = 'ses_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);
    localStorage.setItem('ai_consultation_session_id', sid);
  }
  return sid;
};

export const normalizeEmotion = (emotion?: string): CompanionEmotion => {
  if (!emotion) return 'happy';
  const e = emotion.toLowerCase().trim();
  switch (e) {
    case 'mac_dinh':
    case 'neutral':
      return 'neutral';
    case 'vui_ve':
    case 'happy':
      return 'happy';
    case 'suy_nghi':
    case 'thinking':
      return 'thinking';
    case 'ngac_nhien':
    case 'surprised':
      return 'surprised';
    case 'lang_nghe':
    case 'listening':
      return 'listening';
    case 'speaking':
      return 'speaking';
    default:
      return 'happy';
  }
};

export const getAIConsultationResponse = (query: string): AIResponse => {
  const q = query.toLowerCase().trim();

  // 0. Bắt buộc biết chính xác số lượng sản phẩm trong kho (13 sản phẩm)
  if (
    q.includes('bao nhiêu') ||
    q.includes('trong kho') ||
    q.includes('kho hàng') ||
    q.includes('số lượng') ||
    q.includes('mấy sản phẩm') ||
    q.includes('có những sản phẩm nào') ||
    q.includes('tổng số')
  ) {
    return {
      text: 'Hiện tại trong kho TechStore đang có CHÍNH XÁC 13 sản phẩm chính hãng đang sẵn hàng, bao gồm 4 mẫu laptop cao cấp (Yoga Pro 7, Vivobook 14, Legion Slim 5, Zenbook 14 OLED), 5 dòng linh kiện PC thế hệ mới và 4 phụ kiện công nghệ hàng đầu.',
      emotion: 'happy',
      products: [HERO_PRODUCT, FEATURED_LAPTOPS[1], FEATURED_COMPONENTS[0]],
    };
  }

  // 1. Tư vấn Build PC / Cấu hình máy tính để bàn
  if (q.includes('build pc') || q.includes('pc') || q.includes('máy bàn') || q.includes('cây')) {
    if (q.includes('20') || q.includes('25') || q.includes('tầm trung')) {
      return {
        text: 'Với mức ngân sách 20 - 25 triệu, combo tối ưu nhất hiện nay là CPU AMD Ryzen 5 7600 (socket AM5 đời mới) kết hợp card đồ họa GeForce RTX 4060 8GB và SSD Samsung 990 EVO 1TB. Cấu hình này bảo đảm cân mượt mọi tựa game AAA ở độ phân giải 2K và render video cực mát mẻ!',
        emotion: 'happy',
        products: [FEATURED_COMPONENTS[0], FEATURED_COMPONENTS[1], FEATURED_COMPONENTS[2]],
      };
    }
    return {
      text: 'TechStore hỗ trợ tư vấn và lắp ráp PC theo yêu cầu linh kiện chính hãng. Dưới đây là các linh kiện AM5 và card đồ họa thế hệ mới được ưa chuộng nhất mà bạn có thể tham khảo ngay:',
      emotion: 'happy',
      products: [FEATURED_COMPONENTS[0], FEATURED_COMPONENTS[1], FEATURED_COMPONENTS[3]],
    };
  }

  // 2. Tư vấn Sinh viên IT / Lập trình / Coder / Đa nhiệm
  if (q.includes('it') || q.includes('code') || q.includes('lập trình') || q.includes('dev') || q.includes('docker')) {
    return {
      text: 'Chào bạn đồng nghiệp lập trình viên! Để code mượt mà, chạy nhiều máy ảo Docker và IDE cùng lúc, bạn nhất định nên ưu tiên từ 32GB RAM kết hợp chip 8 nhân thế hệ mới. Lenovo Yoga Pro 7 trang bị sẵn 32GB RAM DDR5 và màn hình 3K 120Hz siêu nét bảo vệ mắt khi nhìn code nhiều giờ liền.',
      emotion: 'speaking',
      products: [HERO_PRODUCT, FEATURED_LAPTOPS[3]],
    };
  }

  // 3. Tư vấn Laptop Gaming / Chơi game AAA / Đồ họa nặng
  if (q.includes('game') || q.includes('gaming') || q.includes('đồ họa') || q.includes('render') || q.includes('fps')) {
    return {
      text: 'Chiến game đỉnh cao và dựng hình 3D thì GPU RTX 40-series và màn hình tần số quét cao là yếu tố quyết định! Lenovo Legion Slim 5 trang bị RTX 4060 cùng màn hình 16 inch 165Hz và hệ thống tản nhiệt buồng hơi ColdFront 5.0 sẽ giúp bạn duy trì FPS tối đa mà không bị hạ xung.',
      emotion: 'surprised',
      products: [FEATURED_LAPTOPS[2], FEATURED_COMPONENTS[0]],
    };
  }

  // 4. Tư vấn Sinh viên / Văn phòng / Dưới 20 triệu / Nhẹ bền
  if (q.includes('sinh viên') || q.includes('văn phòng') || q.includes('học tập') || q.includes('dưới 20') || q.includes('rẻ') || q.includes('tiết kiệm')) {
    return {
      text: 'Đối với nhu cầu học tập, văn phòng và làm việc di động với chi phí hợp lý, ASUS Vivobook 14 là sự lựa chọn số 1 với CPU Intel Core i5 thế hệ 13, 16GB RAM chuẩn, vỏ nhôm sang trọng và trọng lượng chỉ 1.4kg.',
      emotion: 'happy',
      products: [FEATURED_LAPTOPS[1]],
    };
  }

  // 5. Nâng cấp RAM & Ổ cứng SSD
  if (q.includes('ram') || q.includes('ssd') || q.includes('ổ cứng') || q.includes('nâng cấp') || q.includes('chậm') || q.includes('lag')) {
    return {
      text: 'Để hồi sinh tốc độ máy tính cũ hoặc mở rộng không gian chứa dự án, việc nâng cấp lên SSD NVMe Samsung 990 EVO (tốc độ đọc lên tới 5.000MB/s) và thanh RAM Corsair DDR5 6000MHz sẽ giúp máy bật trong 3 giây và mở hàng trăm tab không giật lag!',
      emotion: 'happy',
      products: [FEATURED_COMPONENTS[2], FEATURED_COMPONENTS[4]],
    };
  }

  // 6. Bàn phím cơ & Chuột công thái học & Phụ kiện
  if (q.includes('phím') || q.includes('chuột') || q.includes('gear') || q.includes('màn hình') || q.includes('tai nghe') || q.includes('phụ kiện')) {
    return {
      text: 'Góc setup chuẩn mực cho dân công nghệ không thể thiếu bộ đôi bàn phím cơ Keychron K2 V2 (switch Gateron gõ cực êm) và chuột công thái học Logitech MX Master 3S chống mỏi cổ tay. Bạn cũng có thể nâng cấp thêm màn hình đồ họa Dell UltraSharp 2K IPS Black.',
      emotion: 'happy',
      products: [FEATURED_ACCESSORIES[0], FEATURED_ACCESSORIES[1], FEATURED_ACCESSORIES[2]],
    };
  }

  // 7. Hỏi về giá, mua hàng, bảo hành
  if (q.includes('giá') || q.includes('bảo hành') || q.includes('mua') || q.includes('ship') || q.includes('giao')) {
    return {
      text: 'Mọi sản phẩm tại TechStore đều là hàng chính hãng 100%, bảo hành 1 đổi 1 trong 30 ngày và bảo hành hãng lên tới 24-36 tháng. Chúng tôi hỗ trợ giao hàng toàn quốc và thanh toán quét mã VietQR tự động cực kỳ nhanh gọn!',
      emotion: 'speaking',
      products: [HERO_PRODUCT, FEATURED_ACCESSORIES[1]],
    };
  }

  // Mặc định
  return {
    text: `Chào bạn! Tôi là Trợ lý AI Kỹ thuật viên của TechStore. Kho hàng hiện có 13 sản phẩm chính hãng với đầy đủ laptop, linh kiện PC và gear cao cấp. Bạn có thể gõ câu hỏi hoặc bấm nút Micro để nói trực tiếp với tôi nhé!`,
    emotion: 'happy',
    products: [HERO_PRODUCT, FEATURED_LAPTOPS[1], FEATURED_COMPONENTS[0]],
  };
};

/**
 * Gọi API Backend Cloudflare Worker tích hợp RAG Engine (D1 FTS5 + Workers KV + OpenRouter LLM)
 */
export const fetchAIConsultation = async (query: string): Promise<AIResponse> => {
  const sessionId = getSessionId();

  try {
    const res = await fetch('/api/consultation/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      },
      body: JSON.stringify({ message: query, sessionId }),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        reply?: string;
        emotion?: string;
        products?: Product[];
        cached?: boolean;
      };
      if (data && data.reply) {
        return {
          text: data.reply,
          emotion: normalizeEmotion(data.emotion),
          products: data.products,
          cached: data.cached,
        };
      }
    }
  } catch (err) {
    console.warn('[AI API Network Error, using local fallback]', err);
  }

  // Fallback to local rule-based response
  return getAIConsultationResponse(query);
};
