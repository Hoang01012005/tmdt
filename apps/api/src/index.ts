import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Context } from 'hono';

type Env = {
  Bindings: {
    DB: D1Database;
    SQL_DB?: D1Database;
    CART: KVNamespace;
    AI?: any;
    VECTOR_DB?: VectorizeIndex;
    AI_GATEWAY_ID?: string;
    OPENROUTER_API_KEY?: string;
  };
};

type Line = {
  productId: string;
  qty: number;
};

type ProductRow = {
  id: string;
  brand: string;
  name: string;
  category: string;
  sub_category: string;
  tag: string;
  badge: string;
  price: number;
  original_price: number;
  image: string;
  in_stock: number;
  specs: string; // JSON string
  description: string;
};

export type Product = {
  id: string;
  brand: string;
  name: string;
  category: string;
  subCategory?: string;
  tag?: string;
  badge?: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  specs: string[];
  description: string;
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  avatar: string | null;
  provider: string;
  google_id: string | null;
  role: string;
  created_at: string;
};

type OrderRow = {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  status: string;
  items: string;
  created_at: string;
};

const app = new Hono<Env>().basePath('/api');

// Enable CORS for frontend requests
app.use('*', cors());

// Helper to split long text into small chunks for Google TTS without losing sentences
function splitTextIntoChunks(text: string, maxLen = 160): string[] {
  const clean = text.replace(/[*_#`~[\]()]/g, '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];

  const chunks: string[] = [];
  const sentences = clean.split(/(?<=[.!?,\n])\s+/);
  let current = '';

  for (const s of sentences) {
    if ((current + ' ' + s).trim().length <= maxLen) {
      current = (current + ' ' + s).trim();
    } else {
      if (current) chunks.push(current);
      if (s.length > maxLen) {
        const words = s.split(' ');
        let wChunk = '';
        for (const w of words) {
          if ((wChunk + ' ' + w).trim().length <= maxLen) {
            wChunk = (wChunk + ' ' + w).trim();
          } else {
            if (wChunk) chunks.push(wChunk);
            wChunk = w;
          }
        }
        current = wChunk;
      } else {
        current = s;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

// ==========================================
// 0. VIETNAMESE TTS PROXY (Reads FULL Text via Seamless MP3 Concatenation)
// Giọng: Google TTS (tạm thời). Để bật giọng Nam FPT.AI → xem comment FPT_TTS bên dưới
// ==========================================
app.get('/tts', async (c) => {
  const text = c.req.query('text') || 'Xin chào bạn';
  const chunks = splitTextIntoChunks(text, 160);

  if (chunks.length === 0) {
    return c.text('Empty text', 400);
  }

  // ========================================================
  // [FPT_TTS] Bật giọng Nam miền Nam: uncomment block dưới,
  // thêm FPT_TTS_KEY vào wrangler.toml [vars], comment block Google TTS.
  // Voice options: banmai (nữ Nam), minhquang (nam Nam), leminh (nam Bắc)
  // ========================================================
  // const FPT_TTS_KEY = c.env.FPT_TTS_KEY || '';
  // if (FPT_TTS_KEY) {
  //   try {
  //     const fptRes = await fetch('https://api.fpt.ai/hmi/tts/v5', {
  //       method: 'POST',
  //       headers: {
  //         'api-key': FPT_TTS_KEY,
  //         'voice': 'minhquang',   // Giọng Nam miền Nam ← thay đổi voice ở đây
  //         'speed': '',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ text }),
  //     });
  //     if (fptRes.ok) {
  //       const fptJson: any = await fptRes.json();
  //       const mp3Url = fptJson?.async;
  //       if (mp3Url) {
  //         // FPT.AI trả về URL MP3, redirect client tới URL đó
  //         return c.redirect(mp3Url, 302);
  //       }
  //     }
  //   } catch (fptErr) {
  //     console.warn('[FPT TTS Error]', fptErr);
  //   }
  // }
  // ========================================================

  try {
    const audioBuffers: ArrayBuffer[] = [];

    // Fetch MP3 audio for each sentence in parallel
    const fetchPromises = chunks.map(async (chunk) => {
      const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(
        chunk
      )}`;
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      if (res.ok) {
        return await res.arrayBuffer();
      }
      return null;
    });

    const results = await Promise.all(fetchPromises);
    for (const buf of results) {
      if (buf) audioBuffers.push(buf);
    }

    if (audioBuffers.length === 0) {
      return c.text('TTS upstream error', 502);
    }

    // Seamlessly concatenate all MP3 buffers into a single audio file
    const totalLength = audioBuffers.reduce((acc, buf) => acc + buf.byteLength, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of audioBuffers) {
      combined.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }

    return new Response(combined.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('[TTS Exception]', err);
    return c.text('TTS internal error', 500);
  }
});

const CART_TTL = 60 * 60 * 24 * 30; // 30 days

const formatProduct = (row: ProductRow): Product => {
  let parsedSpecs: string[] = [];
  try {
    parsedSpecs = JSON.parse(row.specs);
  } catch {
    parsedSpecs = [row.specs];
  }

  return {
    id: row.id,
    brand: row.brand,
    name: row.name,
    category: row.category,
    subCategory: row.sub_category,
    tag: row.tag || undefined,
    badge: row.badge || undefined,
    price: row.price,
    originalPrice: row.original_price || undefined,
    image: row.image,
    inStock: Boolean(row.in_stock),
    specs: parsedSpecs,
    description: row.description,
  };
};

// ==========================================
// 0.2 REAL-TIME AI CONSULTATION (RAG ENGINE: D1 FTS5 + WORKERS KV + OPENROUTER LLM)
// ==========================================
interface SearchIntent {
  raw: string;
  normalized: string;
  category: 'laptop' | 'component' | 'accessory' | null;
  subCategory: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  brands: string[];
  keywords: string[];
  ftsQuery: string;
  isInventoryCheck: boolean;
  isWeatherQuestion: boolean;
  isPolicyQuestion: boolean;
  isGreeting: boolean;
}

function extractSearchIntent(query: string): SearchIntent {
  const raw = query || '';
  const normalized = raw.toLowerCase().trim();

  let category: 'laptop' | 'component' | 'accessory' | null = null;
  let subCategory: string | null = null;
  let minPrice: number | null = null;
  let maxPrice: number | null = null;

  // 1. Phán đoán chào hỏi cơ bản
  const isGreeting = /^(alo|chào|xin chào|hello|hi|helo|hey)(\s+bạn|\s+ai|\s+shop|\s+ad)?$/i.test(normalized);

  // 2. Phán đoán hỏi kho hàng / số lượng
  const isInventoryCheck = /(bao nhiêu|bao nhieu|trong kho|trong kho hang|kho hàng|kho hang|số lượng|so luong|mấy sản phẩm|may san pham|còn hàng không|con hang khong|tổng số|tong so|danh sách kho|danh sach kho)/i.test(normalized);
  const isWeatherQuestion = /(thời tiết|thoi tiet|mưa|nắng|nang|bão|nhiệt độ|nhiet do|dự báo|du bao)/i.test(normalized);
  const isPolicyQuestion = /(chính sách|chinh sach|chinhsach|đổi trả|doi tra|hoàn tiền|hoan tien|bảo hành|bao hanh|vận chuyển|van chuyen|thanh toán|thanh toan)/i.test(normalized);

  // 3. Trích xuất ngân sách (VD: "25 triệu", "dưới 20tr", "15 - 20 triệu", "tầm 30 củ")
  const rangeMatch = normalized.match(/(?:từ\s*)?(\d+(?:\.\d+)?)\s*(?:đến|-|\s*tới\s*)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ|m)/i);
  if (rangeMatch) {
    minPrice = Math.round(parseFloat(rangeMatch[1]) * 1000000);
    maxPrice = Math.round(parseFloat(rangeMatch[2]) * 1000000);
  } else {
    const underMatch = normalized.match(/(?:dưới|<|nhỏ hơn|tầm dưới)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ|m)/i);
    if (underMatch) {
      maxPrice = Math.round(parseFloat(underMatch[1]) * 1000000);
    } else {
      const overMatch = normalized.match(/(?:trên|>|lớn hơn|từ)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ|m)/i);
      if (overMatch) {
        minPrice = Math.round(parseFloat(overMatch[1]) * 1000000);
      } else {
        const approxMatch = normalized.match(/(?:khoảng|tầm|ngân sách|giá|tài chính|build pc)?\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|củ|m)/i);
        if (approxMatch) {
          const target = Math.round(parseFloat(approxMatch[1]) * 1000000);
          minPrice = Math.max(0, target - 5000000);
          maxPrice = target + 5000000;
        }
      }
    }
  }

  // 4. Nhận diện danh mục chính (Category)
  const isBuildPC = /(build pc|máy tính bàn|dàn pc|cây pc|lắp pc|pc gaming|pc đồ họa)/i.test(normalized);
  if (isBuildPC || /(linh kiện|phần cứng)/i.test(normalized)) {
    category = 'component';
    // Khi khách hỏi "build pc 25 triệu", 25 triệu là tổng ngân sách cả dàn máy, KHÔNG phải giá của từng linh kiện lẻ
    if (isBuildPC) {
      minPrice = null;
    }
  } else if (/(laptop|máy tính xách tay|notebook|zenbook|vivobook|legion|yoga|macbook)/i.test(normalized)) {
    category = 'laptop';
  } else if (/(phụ kiện|bàn phím|chuột|tai nghe|màn hình|gear|mouse|keyboard|monitor)/i.test(normalized)) {
    category = 'accessory';
  }

  // 5. Nhận diện danh mục con (SubCategory)
  if (/(gaming|chơi game|game thủ|fps|esport|aaa)/i.test(normalized)) {
    subCategory = 'gaming';
  } else if (/(đồ họa|thiết kế|render|autocad|photoshop|video|premiere|oled)/i.test(normalized)) {
    subCategory = 'design';
  } else if (/(văn phòng|học tập|sinh viên|mỏng nhẹ|nhẹ)/i.test(normalized)) {
    subCategory = 'office';
  } else if (/(vga|gpu|card màn hình|rtx|geforce|card đồ họa)/i.test(normalized)) {
    subCategory = 'gpu';
  } else if (/(cpu|chip|bộ vi xử lý|ryzen|core i|intel|am5)/i.test(normalized)) {
    subCategory = 'cpu';
  } else if (/(ssd|ổ cứng|nvme|m\.2|lưu trữ)/i.test(normalized)) {
    subCategory = 'ssd';
  } else if (/(ram|bộ nhớ trong|ddr5|ddr4)/i.test(normalized)) {
    subCategory = 'ram';
  } else if (/(mainboard|bo mạch|main|b650)/i.test(normalized)) {
    subCategory = 'mainboard';
  } else if (/(phím|bàn phím|switch|keychron)/i.test(normalized)) {
    subCategory = 'keyboard';
  } else if (/(chuột|con chuột|mouse|master 3s)/i.test(normalized)) {
    subCategory = 'mouse';
  } else if (/(màn hình|màn|monitor|ultrasharp|ips)/i.test(normalized)) {
    subCategory = 'monitor';
  }

  // 6. Nhận diện thương hiệu nổi tiếng trong kho
  const KNOWN_BRANDS = ['LENOVO', 'ASUS', 'NVIDIA', 'AMD', 'SAMSUNG', 'CORSAIR', 'KEYCHRON', 'LOGITECH', 'DELL'];
  const brands: string[] = [];
  for (const b of KNOWN_BRANDS) {
    if (normalized.includes(b.toLowerCase())) {
      brands.push(b);
    }
  }

  // 7. Tách từ khóa quan trọng cho FTS5 (bỏ hư từ tiếng Việt)
  const stopWords = new Set([
    'tư', 'vấn', 'cho', 'tôi', 'mình', 'cần', 'muốn', 'nhé', 'ạ', 'mua', 'tìm', 'kiếm', 'có',
    'gì', 'không', 'nào', 'được', 'với', 'trong', 'về', 'là', 'và', 'hay', 'này', 'ơi', 'shop',
    'bạn', 'em', 'anh', 'chị', 'máy', 'giúp', 'cấu', 'hình'
  ]);
  const tokens = normalized
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !stopWords.has(w));

  const ftsQuery = tokens.slice(0, 5).join(' OR ');

  return {
    raw,
    normalized,
    category,
    subCategory,
    minPrice,
    maxPrice,
    brands,
    keywords: tokens,
    ftsQuery,
    isInventoryCheck,
    isWeatherQuestion,
    isPolicyQuestion,
    isGreeting,
  };
}

// Hàm RAG truy vấn D1 kết hợp FTS5 + Bộ lọc SQL có cấu trúc
async function retrieveProductsRAG(
  db: D1Database,
  intent: SearchIntent
): Promise<{ products: ProductRow[]; totalCount: number; categoryBreakdown: Record<string, number> }> {
  // Lấy thống kê số lượng và phân loại kho hàng
  const countRes = await db.prepare(
    'SELECT category, COUNT(*) as count FROM products WHERE in_stock = 1 GROUP BY category'
  ).all<{ category: string; count: number }>();

  let totalCount = 0;
  const categoryBreakdown: Record<string, number> = {};
  for (const row of countRes.results) {
    totalCount += row.count;
    categoryBreakdown[row.category] = row.count;
  }

  let products: ProductRow[] = [];

  // BƯỚC 2.0: Xử lý chuyên sâu cho "Build PC" (truy vấn linh kiện CPU, GPU, SSD, RAM từ D1)
  const isBuildPC = /(build pc|máy tính bàn|dàn pc|cây pc|lắp pc)/i.test(intent.normalized);
  if (isBuildPC) {
    const pcParts = await db.prepare(
      `SELECT * FROM products 
       WHERE category = 'component' AND in_stock = 1 
       ORDER BY CASE sub_category 
         WHEN 'gpu' THEN 1 
         WHEN 'cpu' THEN 2 
         WHEN 'ssd' THEN 3 
         WHEN 'ram' THEN 4 
         ELSE 5 
       END ASC LIMIT 4`
    ).all<ProductRow>();
    if (pcParts.results && pcParts.results.length > 0) {
      return {
        products: pcParts.results,
        totalCount,
        categoryBreakdown,
      };
    }
  }

  // BƯỚC 2.1: Truy vấn FTS5 Full-Text Search nếu có từ khóa
  if (intent.ftsQuery) {
    try {
      let ftsSql = `
        SELECT p.* FROM products p
        JOIN products_fts fts ON p.rowid = fts.rowid
        WHERE products_fts MATCH ?
          AND p.in_stock = 1
      `;
      const binds: (string | number)[] = [intent.ftsQuery];

      if (intent.category) {
        ftsSql += ' AND p.category = ?';
        binds.push(intent.category);
      }
      if (intent.minPrice !== null && intent.minPrice !== undefined) {
        ftsSql += ' AND p.price >= ?';
        binds.push(intent.minPrice);
      }
      if (intent.maxPrice !== null && intent.maxPrice !== undefined) {
        ftsSql += ' AND p.price <= ?';
        binds.push(intent.maxPrice);
      }

      ftsSql += ' ORDER BY bm25(products_fts) ASC, p.price DESC LIMIT 5';
      const ftsRes = await db.prepare(ftsSql).bind(...binds).all<ProductRow>();
      if (ftsRes.results && ftsRes.results.length > 0) {
        products = ftsRes.results;
      }
    } catch (e) {
      console.warn('[FTS5 Query failed, fallback to SQL]', e);
    }
  }

  // BƯỚC 2.2: Truy vấn SQL có cấu trúc nếu FTS5 trả về ít hơn 2 sản phẩm
  if (products.length < 2) {
    let sql = 'SELECT * FROM products WHERE in_stock = 1';
    const binds: (string | number)[] = [];

    if (intent.category) {
      sql += ' AND (category = ? OR sub_category = ?)';
      binds.push(intent.category, intent.category);
    } else if (intent.subCategory) {
      sql += ' AND sub_category = ?';
      binds.push(intent.subCategory);
    }

    if (intent.minPrice !== null && intent.minPrice !== undefined) {
      sql += ' AND price >= ?';
      binds.push(intent.minPrice);
    }
    if (intent.maxPrice !== null && intent.maxPrice !== undefined) {
      sql += ' AND price <= ?';
      binds.push(intent.maxPrice);
    }

    sql += ' ORDER BY price DESC LIMIT 5';
    const sqlRes = await db.prepare(sql).bind(...binds).all<ProductRow>();
    if (sqlRes.results && sqlRes.results.length > 0) {
      const existingIds = new Set(products.map((p) => p.id));
      for (const row of sqlRes.results) {
        if (!existingIds.has(row.id)) {
          products.push(row);
          existingIds.add(row.id);
        }
      }
    }
  }

  // BƯỚC 2.3: Nếu vẫn rỗng (VD: hỏi chung chung hoặc ngoài khoảng giá), lấy các sản phẩm nổi bật
  if (products.length === 0) {
    const fallbackRes = await db.prepare(
      'SELECT * FROM products WHERE in_stock = 1 ORDER BY price DESC LIMIT 4'
    ).all<ProductRow>();
    products = fallbackRes.results || [];
  }

  return {
    products: products.slice(0, 5),
    totalCount,
    categoryBreakdown,
  };
}

// Bóc tách JSON an toàn từ phản hồi của LLM
function parseLLMStructuredOutput(text: string): {
  reply: string;
  emotion: string;
  recommended_product_ids: string[];
} | null {
  try {
    let clean = text.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      clean = clean.substring(firstBrace, lastBrace + 1);
    }
    const parsed = JSON.parse(clean);
    if (parsed && typeof parsed.reply === 'string') {
      return {
        reply: parsed.reply.trim(),
        emotion: parsed.emotion || 'vui_ve',
        recommended_product_ids: Array.isArray(parsed.recommended_product_ids)
          ? parsed.recommended_product_ids.map(String)
          : [],
      };
    }
  } catch (err) {
    console.warn('[LLM JSON parse error]', err);
  }
  return null;
}

// Bộ tổng hợp phản hồi RAG xác định chuẩn xác khi LLM gặp sự cố mạng / rate limit
function buildDeterministicRAGFallback(
  intent: SearchIntent,
  d1Data: { products: ProductRow[]; totalCount: number; categoryBreakdown: Record<string, number> }
): { reply: string; emotion: string; recommended_product_ids: string[] } {
  const p = d1Data.products;

  if (intent.isGreeting) {
    return {
      reply: `Chào bạn! Tôi là Trợ lý AI Kỹ thuật viên của TechStore. Kho hàng của chúng tôi đang kết nối trực tiếp với Cloudflare D1 với ${d1Data.totalCount} sản phẩm chính hãng sẵn có. Bạn cần tư vấn cấu hình hay thiết bị nào hôm nay?`,
      emotion: 'vui_ve',
      recommended_product_ids: p.slice(0, 2).map((x) => x.id),
    };
  }

  if (intent.isInventoryCheck) {
    return {
      reply: `Hiện tại trong kho TechStore đang có CHÍNH XÁC ${d1Data.totalCount} sản phẩm chính hãng 100% sẵn hàng, bao gồm ${d1Data.categoryBreakdown['laptop'] || 4} Laptop cao cấp, ${d1Data.categoryBreakdown['component'] || 5} Linh kiện PC thế hệ mới và ${d1Data.categoryBreakdown['accessory'] || 4} Phụ kiện gear hàng đầu.`,
      emotion: 'vui_ve',
      recommended_product_ids: p.slice(0, 3).map((x) => x.id),
    };
  }

  if (intent.isWeatherQuestion) {
    return {
      reply: 'Mình là trợ lý TechStore nên chưa có dữ liệu thời tiết trực tiếp. Bạn có thể hỏi mình về laptop, linh kiện PC hoặc phụ kiện công nghệ; nếu muốn biết tồn kho, hãy hỏi "shop có bao nhiêu sản phẩm?".',
      emotion: 'lang_nghe',
      recommended_product_ids: [],
    };
  }

  if (intent.category === 'component' || intent.normalized.includes('build pc')) {
    const gpu = p.find((x) => x.sub_category === 'gpu') || p[0];
    const cpu = p.find((x) => x.sub_category === 'cpu') || p[1] || p[0];
    const ssd = p.find((x) => x.sub_category === 'ssd') || p[2] || p[0];
    const ram = p.find((x) => x.sub_category === 'ram') || p[3] || p[0];
    const recs = Array.from(new Set([gpu, cpu, ssd, ram].filter(Boolean)));
    const totalCost = recs.reduce((acc, curr) => acc + curr.price, 0);

    return {
      reply: `Với ngân sách build PC khoảng 20 - 25 triệu, TechStore đề xuất cấu hình tối ưu gồm CPU ${cpu.name} (${cpu.price.toLocaleString('vi-VN')} đ), GPU ${gpu.name} (${gpu.price.toLocaleString('vi-VN')} đ) và SSD ${ssd.name}. Tổng chi phí các linh kiện chính khoảng ${totalCost.toLocaleString('vi-VN')} đ, chiến mượt mọi tựa game AAA và đồ họa cực mát!`,
      emotion: 'vui_ve',
      recommended_product_ids: recs.map((x) => x.id),
    };
  }

  if (intent.normalized.includes('it') || intent.normalized.includes('code') || intent.normalized.includes('lập trình')) {
    const devLaptop = p.find((x) => x.category === 'laptop' && (x.specs.includes('32GB') || x.specs.includes('Ryzen 7'))) || p[0];
    return {
      reply: `Dành cho sinh viên IT và lập trình viên cần chạy nhiều máy ảo Docker, cỗ máy ${devLaptop.brand} ${devLaptop.name} giá ${devLaptop.price.toLocaleString('vi-VN')} đ là lựa chọn số một với 32GB RAM dung lượng lớn và màn hình 3K chuẩn màu bảo vệ mắt khi nhìn code nhiều giờ.`,
      emotion: 'vui_ve',
      recommended_product_ids: [devLaptop.id],
    };
  }

  if (intent.normalized.includes('gaming') || intent.subCategory === 'gaming') {
    const gameDev = p.find((x) => x.sub_category === 'gaming') || p.find((x) => x.sub_category === 'gpu') || p[0];
    return {
      reply: `Để chiến mượt mà các tựa game đồ họa nặng với FPS cao nhất, ${gameDev.brand} ${gameDev.name} giá ${gameDev.price.toLocaleString('vi-VN')} đ trang bị tản nhiệt buồng hơi chuyên dụng và chip đồ họa thế hệ mới sẽ đáp ứng trọn vẹn trải nghiệm của bạn.`,
      emotion: 'ngac_nhien',
      recommended_product_ids: [gameDev.id],
    };
  }

  if (intent.subCategory === 'ram' || intent.subCategory === 'ssd' || intent.normalized.includes('nâng cấp')) {
    const ssd = p.find((x) => x.sub_category === 'ssd') || p[0];
    const ram = p.find((x) => x.sub_category === 'ram') || p[1] || p[0];
    return {
      reply: `Để tối ưu tốc độ máy cũ, việc nâng cấp ổ cứng ${ssd.name} (giá ${ssd.price.toLocaleString('vi-VN')} đ) và thanh RAM ${ram.name} (giá ${ram.price.toLocaleString('vi-VN')} đ) sẽ giúp khởi động máy chỉ trong 3 giây và mở hàng trăm tab mượt mà!`,
      emotion: 'vui_ve',
      recommended_product_ids: [ssd.id, ram.id],
    };
  }

  // Gợi ý mặc định chất lượng cao dựa trên D1
  const top1 = p[0];
  const top2 = p[1];
  const recIds = [top1?.id, top2?.id].filter(Boolean) as string[];
  return {
    reply: `Dựa trên dữ liệu kho hàng thời gian thực, TechStore gợi ý bạn tham khảo ${top1.brand} ${top1.name} với mức giá ${top1.price.toLocaleString('vi-VN')} đ đang sẵn hàng. Bạn có thể bấm Thêm vào giỏ hàng hoặc cho tôi biết thêm chi tiết ngân sách nhé!`,
    emotion: 'vui_ve',
    recommended_product_ids: recIds,
  };
}

// ============================================================================
// AGENTIC RAG ENGINE (CLOUDFLARE AI GATEWAY + WORKERS AI + VECTORIZE + D1)
// ============================================================================

export type AgentRoute = 'VECTOR' | 'SQL' | 'WEB' | 'DIRECT';

export interface AgentTraceStep {
  node: string;
  action: string;
  timestamp: string;
  durationMs: number;
  input?: any;
  output?: any;
  status: 'SUCCESS' | 'RETRY' | 'WARNING' | 'FAILED';
}

export interface RouterDecision {
  route: AgentRoute;
  sub_queries: string[];
  reasoning: string;
}

export interface GraderResult {
  score: 'YES' | 'NO';
  missing_info: string;
}

export interface HallucinationResult {
  passed: boolean;
  grounded: boolean;
  complete: boolean;
  critique: string;
}

export interface RetrievedDocument {
  id: string;
  source: 'VECTOR' | 'SQL' | 'WEB';
  content: string;
  score?: number;
  metadata?: Record<string, any>;
  productId?: string;
}

/**
 * Định tuyến mọi lệnh gọi AI qua Cloudflare AI Gateway để giám sát log, rate limit và cache.
 * Tự động dự phòng chạy trực tiếp nếu Gateway chưa được cấu hình trên Dashboard để tránh gián đoạn.
 */
async function runWorkersAi(
  ai: any,
  model: string,
  payload: any,
  env: { AI_GATEWAY_ID?: string }
): Promise<any> {
  const gatewayId = env.AI_GATEWAY_ID || 'default';
  try {
    return await ai.run(model, payload, { gateway: { id: gatewayId, skipCache: false } });
  } catch (gwErr) {
    console.warn(`[AI Gateway '${gatewayId}' warning - running direct Workers AI]:`, gwErr);
    return await ai.run(model, payload);
  }
}

/**
 * Phân tích JSON an toàn chống markdown codeblock
 */
function safeJsonParse<T>(rawText: string, fallback: T): T {
  try {
    if (!rawText || typeof rawText !== 'string') return fallback;
    let clean = rawText
      .replace(/```(?:json)?/gi, '')
      .replace(/```/g, '')
      .trim();
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      const lastBrace = clean.lastIndexOf('}');
      if (lastBrace !== -1) clean = clean.substring(firstBrace, lastBrace + 1);
    } else if (firstBracket !== -1) {
      const lastBracket = clean.lastIndexOf(']');
      if (lastBracket !== -1) clean = clean.substring(firstBracket, lastBracket + 1);
    }
    return JSON.parse(clean) as T;
  } catch {
    return fallback;
  }
}

/**
 * Phân mảnh văn bản (Chunking 400 từ, 50 từ overlap)
 */
function chunkText(text: string, chunkSize = 400, overlap = 50): string[] {
  const words = text.trim().split(/\s+/);
  if (words.length <= chunkSize) return [text];
  const chunks: string[] = [];
  let startIndex = 0;
  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSize, words.length);
    chunks.push(words.slice(startIndex, endIndex).join(' '));
    if (endIndex === words.length) break;
    startIndex += chunkSize - overlap;
  }
  return chunks;
}

/**
 * NODE 01: Agent Router & Query Planner (Deterministic - không dùng AI để tăng tốc)
 * Phân tích câu hỏi bằng regex/rule-based, định tuyến công cụ (VECTOR | SQL | DIRECT)
 */
async function node01_AgentRouter(
  query: string,
  env: Env['Bindings'],
  traces: AgentTraceStep[]
): Promise<RouterDecision> {
  const startTime = Date.now();
  const normalized = query.toLowerCase().trim();

  // --- Deterministic routing (không tốn AI call, nhanh hơn ~600ms) ---
  let route: AgentRoute = 'SQL';
  let reasoning = 'Deterministic: Mặc định tra cứu sản phẩm D1';

  // DIRECT: chào hỏi, cảm ơn
  if (/^(alo|chào|xin chào|hello|hi|hey|cảm ơn|thanks|ok|được|tốt|bái bai)([\s,!.]*)?$/i.test(normalized)) {
    route = 'DIRECT';
    reasoning = 'Deterministic: Câu chào hỏi xã giao';
  }
  // VECTOR: câu hỏi về chính sách, bảo hành, kinh nghiệm
  else if (/(bảo hành|đổi trả|chính sách|hoàn tiền|lỗi|warranty|kinh nghiệm|hướng dẫn|cách|mẹo|tips)/i.test(normalized)) {
    route = 'VECTOR';
    reasoning = 'Deterministic: Câu hỏi chính sách/hướng dẫn → Vectorize';
  }
  // SQL: mọi trường hợp còn lại (sản phẩm, giá, build PC, kho hàng)
  else {
    route = 'SQL';
    reasoning = 'Deterministic: Tra cứu sản phẩm/giá/kho → D1';
  }

  const decision: RouterDecision = {
    route,
    sub_queries: [query],
    reasoning,
  };

  traces.push({
    node: 'Node 01: Agent Router & Planner (Deterministic)',
    action: `Định tuyến: ${route}`,
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    input: { query },
    output: decision,
    status: 'SUCCESS',
  });
  return decision;
}

/**
 * NODE 02: Multi-Source Retrieval
 * Truy xuất đa nguồn từ Cloudflare Vectorize (Index: agentic-rag-index) và Cloudflare D1
 */
async function node02_MultiSourceRetrieval(
  decision: RouterDecision,
  query: string,
  env: Env['Bindings'],
  traces: AgentTraceStep[]
): Promise<{ docs: RetrievedDocument[]; matchedProducts: ProductRow[] }> {
  const startTime = Date.now();
  const docs: RetrievedDocument[] = [];
  let matchedProducts: ProductRow[] = [];
  const queryToSearch = decision.sub_queries[0] || query;
  const db = env.SQL_DB || env.DB;

  try {
    // 1. Truy xuất Vectorize (Model @cf/baai/bge-m3 qua AI Gateway)
    if (decision.route === 'VECTOR' && env.VECTOR_DB && env.AI) {
      const embRes: any = await runWorkersAi(
        env.AI,
        '@cf/baai/bge-m3',
        { text: [queryToSearch] },
        env
      );
      const vector = embRes?.data?.[0] || embRes?.vectors?.[0];
      if (vector && Array.isArray(vector)) {
        const matches = await env.VECTOR_DB.query(vector, {
          topK: 4,
          returnMetadata: 'all',
        });
        for (const m of matches.matches || []) {
          docs.push({
            id: m.id,
            source: 'VECTOR',
            score: m.score,
            content: (m.metadata?.text as string) || (m.metadata?.content as string) || '',
            metadata: m.metadata,
            productId: (m.metadata?.product_id as string) || (m.metadata?.productId as string),
          });
        }
      }
    }

    // 2. Truy xuất Cloudflare D1 (FTS5 + Structured SQL)
    const intent = extractSearchIntent(queryToSearch);
    const d1Data = await retrieveProductsRAG(db, intent);
    matchedProducts = d1Data.products;

    if (decision.route === 'SQL' || docs.length === 0) {
      matchedProducts.forEach((p) => {
        docs.push({
          id: p.id,
          source: 'SQL',
          content: `[ID: ${p.id}] [${p.category.toUpperCase()}] ${p.brand} ${p.name} - Giá: ${p.price.toLocaleString('vi-VN')} đ - Cấu hình: ${p.specs} - Tồn kho: ${p.in_stock ? 'Còn hàng' : 'Hết hàng'} - Mô tả: ${p.description}`,
          metadata: { category: p.category, brand: p.brand, price: p.price },
          productId: p.id,
        });
      });
    }

    traces.push({
      node: 'Node 02: Multi-Source Retrieval',
      action: `Truy xuất được ${docs.length} tài liệu (Nguồn: ${decision.route})`,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      input: { query: queryToSearch, route: decision.route },
      output: { docsCount: docs.length, sampleDocIds: docs.map((d) => d.id).slice(0, 3) },
      status: 'SUCCESS',
    });
  } catch (err: any) {
    traces.push({
      node: 'Node 02: Multi-Source Retrieval',
      action: 'Lỗi truy xuất, dùng D1 fallback',
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      output: { error: err?.message },
      status: 'WARNING',
    });
  }

  return { docs, matchedProducts };
}

/**
 * NODE 02: Retrieval Grader (Deterministic - bỏ AI call để tăng tốc)
 * Luôn tin tưởng D1 FTS5 results, chỉ kiểm tra có docs không
 */
async function node02_RetrievalGrader(
  query: string,
  docs: RetrievedDocument[],
  env: Env['Bindings'],
  traces: AgentTraceStep[]
): Promise<GraderResult> {
  const startTime = Date.now();

  // Deterministic: D1 FTS5 đã lọc tốt, bỏ AI grader để tiết kiệm ~600ms
  const result: GraderResult = docs.length > 0
    ? { score: 'YES', missing_info: '' }
    : { score: 'NO', missing_info: 'Không tìm thấy sản phẩm phù hợp trong kho.' };

  traces.push({
    node: 'Node 02: Retrieval Grader (Deterministic)',
    action: `Chấm điểm: ${result.score} (${docs.length} tài liệu)`,
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    output: result,
    status: result.score === 'YES' ? 'SUCCESS' : 'RETRY',
  });
  return result;
}

/**
 * NODE 02B: Query Rewriter
 * Viết lại câu truy vấn mới tối ưu ngữ nghĩa khi Grader đánh giá chưa đạt (Tối đa 2 vòng lặp)
 */
async function node02B_QueryRewriter(
  query: string,
  missingInfo: string,
  env: Env['Bindings'],
  traces: AgentTraceStep[]
): Promise<string> {
  const startTime = Date.now();
  const systemPrompt = `Truy vấn hiện tại không tìm được tài liệu phù hợp. Dựa trên câu hỏi gốc và phần thông tin còn thiếu, hãy viết lại 1 câu truy vấn tìm kiếm mới tối ưu ngữ nghĩa hơn. Chỉ trả về chuỗi văn bản của câu truy vấn mới.`;

  try {
    if (env.AI) {
      const res: any = await runWorkersAi(
        env.AI,
        '@cf/meta/llama-3.1-8b-instruct-fp8',
        {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Câu hỏi gốc: "${query}"\nThông tin còn thiếu: "${missingInfo}"` },
          ],
          temperature: 0.2,
        },
        env
      );
      const newQuery = (res?.response || res?.choices?.[0]?.message?.content || query).replace(/["\n\r]/g, '').trim();
      traces.push({
        node: 'Node 02B: Query Rewriter',
        action: 'Tối ưu hóa câu truy vấn mới (Self-Correction Loop)',
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        input: { original: query, missingInfo },
        output: { rewrittenQuery: newQuery },
        status: 'SUCCESS',
      });
      return newQuery || query;
    }
  } catch (err: any) {
    console.warn('[Rewriter error]', err);
  }

  return query;
}

/**
 * NODE 03: Context Generator (Upgraded)
 * Dùng OpenRouter + Gemini Flash 1.5 (nhanh, thông minh) với prompt mạnh, few-shot
 * Fallback: Workers AI LLaMA → Deterministic
 */
async function node03_ContextGenerator(
  query: string,
  docs: RetrievedDocument[],
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  critique: string | null,
  env: Env['Bindings'],
  traces: AgentTraceStep[]
): Promise<{ reply: string; emotion: string; recommended_product_ids: string[] }> {
  const startTime = Date.now();
  const contextSnippet = docs.map((d, i) => `${i + 1}. ${d.content}`).join('\n\n').substring(0, 4000);

  // Danh sách ID sản phẩm có trong context để LLM chỉ chọn từ đây
  const availableProductIds = docs
    .map((d) => d.productId || d.id)
    .filter(Boolean)
    .slice(0, 8);
  const idList = availableProductIds.length > 0 ? availableProductIds.join(', ') : 'không có';

  let systemPrompt = `Bạn là Trợ lý Kỹ thuật viên cao cấp của TechStore - cửa hàng công nghệ uy tín tại Việt Nam.
NHIỆM VỤ: Trả lời câu hỏi của khách hàng dựa HOÀN TOÀN vào dữ liệu trong [Ngữ cảnh]. TUYỆT ĐỐI không bịa đặt tên sản phẩm, giá cả, thông số kỹ thuật ngoài ngữ cảnh.

QUY TẮC BẮT BUỘC:
1. CHỈ sử dụng thông tin có trong [Ngữ cảnh]. Nếu không có thông tin → thừa nhận thẳng thắn.
2. recommended_product_ids CHỈ được chứa ID từ danh sách: [${idList}]. Không được tự bịa ID khác.
3. Trả lời bằng tiếng Việt tự nhiên, thân thiện, giọng chuyên gia kỹ thuật. 2-4 câu súc tích.
4. Nếu hỏi về sản phẩm → đề cập tên, giá, điểm mạnh nổi bật từ context.
5. Nếu hỏi build PC → đề xuất combo linh kiện cụ thể với giá từng món từ context.

EMOTION (chọn 1 phù hợp nhất):
- "vui_ve": Khi tư vấn sản phẩm, trả lời đầy đủ
- "suy_nghi": Khi câu hỏi phức tạp, cần phân tích
- "ngac_nhien": Khi khách chọn combo đỉnh hoặc hỏi gaming
- "lang_nghe": Khi câu hỏi chưa rõ, cần hỏi thêm
- "mac_dinh": Câu chào hỏi, cảm ơn

VÍ DỤ FEW-SHOT:
[Ngữ cảnh]: "Lenovo Legion Slim 5 - Giá: 25,990,000đ - GPU RTX 4060 - 16GB RAM - Còn hàng"
[Câu hỏi]: "laptop gaming tầm 25 triệu"
[Output]: {"reply": "Với ngân sách 25 triệu, Lenovo Legion Slim 5 là lựa chọn hoàn hảo! Máy trang bị GPU RTX 4060 mới nhất cùng 16GB RAM DDR5 — chiến mượt mọi tựa game AAA ở độ phân giải Full HD và 2K. Giá chỉ 25,990,000đ, hiện còn hàng tại TechStore.", "emotion": "ngac_nhien", "recommended_product_ids": ["<id thực từ context>"]}

CHỈ trả về JSON thuần, không markdown, không giải thích thêm:
{"reply": "...", "emotion": "...", "recommended_product_ids": ["id1", "id2"]}`;

  if (critique) {
    systemPrompt += `\n\n[SỬA LỖI PHIÊN TRƯỚC]: ${critique}. Hãy khắc phục triệt để.`;
  }

  const userContent = `[Ngữ cảnh Dữ liệu TechStore]:\n${contextSnippet || 'Không có dữ liệu sản phẩm phù hợp.'}\n\n[Câu hỏi của khách]: "${query}"`;

  // --- Ưu tiên 1: OpenRouter + Google Gemini Flash 1.5 (nhanh, thông minh) ---
  const activeOpenRouterKey = env.OPENROUTER_API_KEY;
  if (activeOpenRouterKey) {
    try {
      const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeOpenRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://techstore.workers.dev',
          'X-Title': 'TechStore AI Assistant',
        },
        body: JSON.stringify({
          model: 'google/gemini-flash-1.5-8b',
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.slice(-4),
            { role: 'user', content: userContent },
          ],
          temperature: 0.3,
          max_tokens: 400,
          response_format: { type: 'json_object' },
        }),
      });

      if (orRes.ok) {
        const orData: any = await orRes.json();
        const raw = orData?.choices?.[0]?.message?.content || '';
        const parsed = parseLLMStructuredOutput(raw);
        if (parsed && parsed.reply) {
          // Lọc IDs: chỉ giữ những ID thực sự có trong context
          const validIds = parsed.recommended_product_ids.filter((id) =>
            availableProductIds.includes(id)
          );
          const result = { ...parsed, recommended_product_ids: validIds };
          traces.push({
            node: 'Node 03: Context Generator (OpenRouter Gemini Flash 1.5)',
            action: critique ? 'Tạo lại câu trả lời (Self-Correction)' : 'Sinh câu trả lời từ Ngữ cảnh',
            timestamp: new Date().toISOString(),
            durationMs: Date.now() - startTime,
            input: { query, docsCount: docs.length, model: 'google/gemini-flash-1.5-8b' },
            output: result,
            status: 'SUCCESS',
          });
          return result;
        }
      } else {
        console.warn('[OpenRouter HTTP Error]', orRes.status, await orRes.text());
      }
    } catch (orErr: any) {
      console.warn('[OpenRouter Exception]', orErr?.message);
    }
  }

  // --- Fallback 2: Workers AI LLaMA 8B ---
  try {
    if (env.AI) {
      const res: any = await runWorkersAi(
        env.AI,
        '@cf/meta/llama-3.1-8b-instruct-fp8',
        {
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.slice(-4),
            { role: 'user', content: userContent },
          ],
          temperature: 0.2,
          max_tokens: 400,
        },
        env
      );
      const raw = res?.response || res?.choices?.[0]?.message?.content || '';
      const parsed = parseLLMStructuredOutput(raw);
      if (parsed && parsed.reply) {
        const validIds = parsed.recommended_product_ids.filter((id) =>
          availableProductIds.includes(id)
        );
        const result = { ...parsed, recommended_product_ids: validIds };
        traces.push({
          node: 'Node 03: Context Generator (Workers AI LLaMA Fallback)',
          action: 'Sinh câu trả lời (Fallback LLaMA)',
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - startTime,
          output: result,
          status: 'SUCCESS',
        });
        return result;
      }
    }
  } catch (err: any) {
    console.warn('[Node 03 LLaMA Fallback error]', err?.message);
  }

  // --- Fallback 3: Deterministic ---
  const intent = extractSearchIntent(query);
  const d1Products = docs
    .filter((d) => d.source === 'SQL')
    .map((d) => ({ id: d.productId || d.id, content: d.content }));

  const fallback = {
    reply: d1Products.length > 0
      ? `Dựa trên kho hàng TechStore, tôi tìm thấy ${d1Products.length} sản phẩm phù hợp với yêu cầu "${query}". Bạn xem thẻ sản phẩm bên dưới để biết chi tiết giá và cấu hình nhé!`
      : `Hiện tại kho TechStore chưa có sản phẩm phù hợp chính xác với "${query}". Bạn có thể mô tả thêm ngân sách hoặc nhu cầu sử dụng để tôi tư vấn chính xác hơn!`,
    emotion: 'vui_ve',
    recommended_product_ids: availableProductIds.slice(0, 3),
  };
  traces.push({
    node: 'Node 03: Context Generator (Deterministic Fallback)',
    action: 'Sinh câu trả lời Fallback',
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    output: fallback,
    status: 'WARNING',
  });
  return fallback;
}

/**
 * NODE 04: Hallucination & Answer Quality Checker
 * Kiểm duyệt ảo giác (Groundedness) và độ hoàn thiện (Completeness)
 */
async function node04_HallucinationChecker(
  query: string,
  docs: RetrievedDocument[],
  reply: string,
  env: Env['Bindings'],
  traces: AgentTraceStep[]
): Promise<HallucinationResult> {
  const startTime = Date.now();
  if (docs.length === 0) {
    return { passed: true, grounded: true, complete: true, critique: '' };
  }

  const systemPrompt = `Bạn là Kiểm duyệt viên Chất lượng AI.
Đối chiếu [Câu trả lời] với [Tài liệu]:
1. Groundedness: Câu trả lời có bịa đặt thông tin không có trong tài liệu không?
2. Completeness: Câu trả lời đã giải quyết đúng trọng tâm câu hỏi của người dùng chưa?
Chỉ trả về JSON:
{
  "passed": boolean,
  "grounded": boolean,
  "complete": boolean,
  "critique": "mô tả lỗi nếu passed=false"
}`;

  const contextSnippet = docs.map((d) => d.content).join('\n').substring(0, 2500);

  try {
    if (env.AI) {
      const res: any = await runWorkersAi(
        env.AI,
        '@cf/meta/llama-3.1-8b-instruct-fp8',
        {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `[Tài liệu]:\n${contextSnippet}\n\n[Câu hỏi]: "${query}"\n\n[Câu trả lời]: "${reply}"` },
          ],
          temperature: 0.0,
        },
        env
      );
      const raw = res?.response || res?.choices?.[0]?.message?.content || '';
      const result = safeJsonParse<HallucinationResult>(raw, {
        passed: true,
        grounded: true,
        complete: true,
        critique: '',
      });
      traces.push({
        node: 'Node 04: Hallucination & Answer Checker',
        action: `Kiểm tra ảo giác: ${result.passed ? 'ĐẠT CHUẨN' : 'PHÁT HIỆN SAI LỆCH'}`,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        output: result,
        status: result.passed ? 'SUCCESS' : 'WARNING',
      });
      return result;
    }
  } catch (err: any) {
    console.warn('[Checker error]', err);
  }

  const fallback: HallucinationResult = { passed: true, grounded: true, complete: true, critique: '' };
  traces.push({
    node: 'Node 04: Hallucination & Answer Checker',
    action: 'Bỏ qua kiểm tra (Fallback)',
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    output: fallback,
    status: 'WARNING',
  });
  return fallback;
}

/**
 * Đồng bộ toàn bộ sản phẩm và chính sách từ Cloudflare D1 sang Cloudflare Vectorize
 */
async function syncProductsToVectorize(env: Env['Bindings']): Promise<number> {
  if (!env.VECTOR_DB || !env.AI) return 0;

  const db = env.SQL_DB || env.DB;
  const { results } = await db.prepare('SELECT * FROM products').all<ProductRow>();
  const products = results || [];

  const vectors: VectorizeVector[] = [];
  const policies = [
    {
      id: 'policy-warranty-techstore',
      text: 'Chính sách đổi trả và bảo hành TechStore: Được đổi sản phẩm trong 30 ngày đầu nếu phát hiện lỗi phần cứng do nhà sản xuất. Sản phẩm đổi trả cần còn đầy đủ phụ kiện, hộp và chứng từ mua hàng; nhân viên sẽ kiểm tra tình trạng trước khi xác nhận. Bảo hành sửa chữa miễn phí 12-24 tháng theo tiêu chuẩn chính hãng. Hỗ trợ vệ sinh máy và tra keo tản nhiệt trọn đời.',
    },
    {
      id: 'policy-shipping-vietnam',
      text: 'Chính sách vận chuyển và thanh toán: Giao hàng hỏa tốc trong 2 giờ tại Hà Nội và TP.HCM. Miễn phí vận chuyển toàn quốc cho đơn hàng từ 2.000.000 đ. Hỗ trợ thanh toán chuyển khoản qua mã VietQR tự động hoặc thanh toán khi nhận hàng (COD).',
    },
  ];

  // 1. Tạo vectors cho chính sách
  for (const pol of policies) {
    const embRes: any = await runWorkersAi(
      env.AI,
      '@cf/baai/bge-m3',
      { text: [pol.text] },
      env
    );
    const vector = embRes?.data?.[0] || embRes?.vectors?.[0];
    if (vector && Array.isArray(vector)) {
      vectors.push({
        id: pol.id,
        values: vector,
        metadata: { text: pol.text, type: 'policy' },
      });
    }
  }

  // 2. Tạo vectors cho sản phẩm
  for (const p of products) {
    const docText = `[Sản phẩm] ${p.brand} ${p.name}. Phân loại: ${p.category} (${p.sub_category}). Giá niêm yết: ${p.price.toLocaleString('vi-VN')} đ. Thông số kỹ thuật: ${p.specs}. Tình trạng: ${p.in_stock ? 'Còn hàng' : 'Hết hàng'}. Giới thiệu chi tiết: ${p.description}`;
    const embRes: any = await runWorkersAi(
      env.AI,
      '@cf/baai/bge-m3',
      { text: [docText] },
      env
    );
    const vector = embRes?.data?.[0] || embRes?.vectors?.[0];
    if (vector && Array.isArray(vector)) {
      vectors.push({
        id: `prod-vec-${p.id}`,
        values: vector,
        metadata: {
          product_id: p.id,
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: p.price,
          text: docText,
        },
      });
    }
  }

  if (vectors.length > 0) {
    await env.VECTOR_DB.upsert(vectors);
  }

  return vectors.length;
}

// ============================================================================
// AGENTIC RAG ENDPOINTS
// ============================================================================

/**
 * ENDPOINT 1: POST /api/ingest
 * Nạp tài liệu văn bản, tự động phân mảnh (Chunking), tạo Vector với BGE-M3 và nạp vào Vectorize
 */
app.post('/ingest', async (c) => {
  const startTime = Date.now();
  try {
    const body = await c.req.json();
    const documentText = body.document || body.text;
    const docId = body.doc_id || `doc-${Date.now()}`;
    const metadata = body.metadata || {};

    if (!documentText || typeof documentText !== 'string') {
      return c.json({ error: 'Trường "document" là bắt buộc và phải là chuỗi văn bản.' }, 400);
    }

    if (!c.env.VECTOR_DB || !c.env.AI) {
      return c.json({ error: 'VECTOR_DB hoặc AI binding chưa được cấu hình' }, 500);
    }

    // 1. Phân mảnh văn bản (400 từ, 50 từ overlap)
    const chunks = chunkText(documentText, 400, 50);
    const vectorsToUpsert: VectorizeVector[] = [];

    // 2. Nhúng từng chunk thành vector 1024 chiều bằng BGE-M3 qua AI Gateway
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = `${docId}-chunk-${i}`;

      const embeddingRes: any = await runWorkersAi(
        c.env.AI,
        '@cf/baai/bge-m3',
        { text: [chunk] },
        c.env
      );

      const vector = embeddingRes?.data?.[0] || embeddingRes?.vectors?.[0];

      if (vector && Array.isArray(vector)) {
        vectorsToUpsert.push({
          id: chunkId,
          values: vector,
          metadata: {
            ...metadata,
            doc_id: docId,
            chunk_index: i,
            total_chunks: chunks.length,
            text: chunk,
          },
        });
      }
    }

    // 3. Batch Upsert vào Cloudflare Vectorize
    if (vectorsToUpsert.length > 0) {
      await c.env.VECTOR_DB.upsert(vectorsToUpsert);
    }

    return c.json({
      success: true,
      message: 'Nạp và nhúng tài liệu thành công vào Cloudflare Vectorize (Index: agentic-rag-index)',
      doc_id: docId,
      total_chunks: chunks.length,
      vectors_ingested: vectorsToUpsert.length,
      duration_ms: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('[Ingest Error]:', error);
    return c.json({ success: false, error: error?.message || 'Lỗi nạp dữ liệu' }, 500);
  }
});

/**
 * ENDPOINT 2: POST /api/vectorize/sync
 * Tự động đồng bộ toàn bộ sản phẩm và chính sách từ Cloudflare D1 sang Vectorize
 */
app.post('/vectorize/sync', async (c) => {
  const startTime = Date.now();
  try {
    const totalSynced = await syncProductsToVectorize(c.env);
    return c.json({
      success: true,
      message: 'Đồng bộ toàn bộ sản phẩm và chính sách từ Cloudflare D1 sang Vectorize thành công',
      total_vectors: totalSynced,
      duration_ms: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('[Sync Error]:', error);
    return c.json({ success: false, error: error?.message || 'Lỗi đồng bộ Vectorize' }, 500);
  }
});

/**
 * ENDPOINT 3: POST /api/chat
 * Luồng Agentic RAG đầy đủ với nhật ký kiểm tra (Trace & Metadata)
 */
app.post('/chat', async (c) => {
  const overallStart = Date.now();
  const traces: AgentTraceStep[] = [];

  try {
    const body = await c.req.json();
    const query = body.query || body.message;
    if (!query || typeof query !== 'string') {
      return c.json({ error: 'Trường "query" là bắt buộc.' }, 400);
    }

    // 1. NODE 01: Agent Router
    let decision = await node01_AgentRouter(query, c.env, traces);
    let currentSearchQuery = decision.sub_queries[0] || query;

    // 2. NODE 02 & 02B: Retrieval + Grader + Rewriter Loop
    let retrievedDocs: RetrievedDocument[] = [];
    let rewriteCount = 0;
    const MAX_REWRITES = 2;

    if (decision.route !== 'DIRECT') {
      while (rewriteCount <= MAX_REWRITES) {
        const retrievalRes = await node02_MultiSourceRetrieval(decision, currentSearchQuery, c.env, traces);
        retrievedDocs = retrievalRes.docs;

        const grade = await node02_RetrievalGrader(currentSearchQuery, retrievedDocs, c.env, traces);
        if (grade.score === 'YES' || rewriteCount >= MAX_REWRITES) {
          break;
        }

        rewriteCount++;
        currentSearchQuery = await node02B_QueryRewriter(query, grade.missing_info, c.env, traces);
        decision.sub_queries = [currentSearchQuery];
      }
    }

    // 3. NODE 03: Context Generator only (Hallucination Checker disabled for speed)
    let answerObj = await node03_ContextGenerator(query, retrievedDocs, [], null, c.env, traces);
    let correctionAttempts = 0;
    const MAX_CORRECTIONS = 0;

    return c.json({
      success: true,
      query,
      final_answer: answerObj.reply,
      emotion: answerObj.emotion,
      recommended_product_ids: answerObj.recommended_product_ids,
      meta: {
        route_selected: decision.route,
        rewrite_iterations: rewriteCount,
        correction_attempts: correctionAttempts,
        total_docs_used: retrievedDocs.length,
        total_latency_ms: Date.now() - overallStart,
      },
      retrieved_sources: retrievedDocs.map((d) => ({
        id: d.id,
        source: d.source,
        score: d.score,
        snippet: d.content.substring(0, 150) + '...',
      })),
      trace: traces,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error?.message, trace: traces }, 500);
  }
});

/**
 * ENDPOINT 4: POST /api/consultation/chat
 * Tích hợp Agentic RAG trực tiếp vào Trợ lý Ảo AI 3D Frontend & Cache Workers KV
 */
app.post('/consultation/chat', async (c) => {
  const body = await c.req.json<{ message: string; sessionId?: string }>();
  const message = body?.message;
  if (!message || !message.trim()) {
    return c.json({ error: 'Tin nhắn không được để trống' }, 400);
  }

  const traces: AgentTraceStep[] = [];
  const overallStart = Date.now();

  // 1. Kiểm tra Cache Cloudflare Workers KV cho các câu hỏi gợi ý nhanh
  const intent = extractSearchIntent(message);
  const db = c.env.SQL_DB || c.env.DB;
  const hasProductIntent =
    Boolean(intent.category || intent.subCategory || intent.brands.length > 0) ||
    intent.minPrice !== null ||
    intent.maxPrice !== null ||
    /(laptop|máy tính|may tinh|pc|linh kiện|linh kien|phần cứng|phan cung|phụ kiện|phu kien|bàn phím|ban phim|chuột|chuot|mouse|keyboard|màn hình|man hinh|tai nghe|loa|router|ssd|ram|cpu|gpu|card|mainboard|webcam|giá|gia|mua|tìm|tim|kiếm|kiem|kho|sản phẩm|san pham|tồn kho|ton kho)/i.test(
      intent.normalized
    );

  // Inventory questions must use the authoritative D1 count, not the
  // recommendation retrieval limit used for normal product searches.
  if (intent.isInventoryCheck) {
    const inventoryRows = await db.prepare(
      'SELECT * FROM products WHERE in_stock = 1 ORDER BY category ASC, price DESC'
    ).all<ProductRow>();
    const inventory = inventoryRows.results || [];
    const categoryBreakdown = inventory.reduce<Record<string, number>>((counts, product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
      return counts;
    }, {});

    return c.json({
      reply: `Hiện tại trong kho TechStore đang có CHÍNH XÁC ${inventory.length} sản phẩm chính hãng 100% sẵn hàng, gồm ${categoryBreakdown.laptop || 0} laptop, ${categoryBreakdown.component || 0} linh kiện PC và ${categoryBreakdown.accessory || 0} phụ kiện.`,
      emotion: 'vui_ve',
      recommended_product_ids: inventory.map((product) => product.id),
      products: inventory.map(formatProduct),
      sessionId: body.sessionId || c.req.header('x-session-id') || 'default-session',
      meta: {
        route_selected: 'INVENTORY',
        total_docs_used: inventory.length,
      },
    });
  }

  if (intent.isPolicyQuestion) {
    return c.json({
      reply: 'Chính sách đổi trả TechStore: bạn được đổi sản phẩm trong 30 ngày đầu nếu sản phẩm có lỗi phần cứng do nhà sản xuất. Sản phẩm cần còn đầy đủ phụ kiện, hộp và chứng từ mua hàng; đội ngũ hỗ trợ sẽ kiểm tra tình trạng trước khi xác nhận đổi trả. Với bảo hành, TechStore hỗ trợ bảo hành chính hãng từ 12-24 tháng tùy sản phẩm.',
      emotion: 'vui_ve',
      recommended_product_ids: [],
      products: [],
      sessionId: body.sessionId || c.req.header('x-session-id') || 'default-session',
      meta: {
        route_selected: 'POLICY',
        total_docs_used: 0,
      },
    });
  }

  if (intent.isWeatherQuestion) {
    return c.json({
      reply: 'Mình là trợ lý TechStore nên chưa có dữ liệu thời tiết trực tiếp. Bạn có thể hỏi mình về laptop, linh kiện PC hoặc phụ kiện công nghệ; nếu muốn biết tồn kho, hãy hỏi "shop có bao nhiêu sản phẩm?".',
      emotion: 'lang_nghe',
      recommended_product_ids: [],
      products: [],
      sessionId: body.sessionId || c.req.header('x-session-id') || 'default-session',
      meta: {
        route_selected: 'OUT_OF_SCOPE',
        total_docs_used: 0,
      },
    });
  }

  if (!intent.isGreeting && !hasProductIntent) {
    return c.json({
      reply: 'Mình là trợ lý TechStore, chỉ hỗ trợ tư vấn laptop, linh kiện PC, phụ kiện và thông tin tồn kho. Bạn muốn tìm sản phẩm hoặc cấu hình nào?',
      emotion: 'lang_nghe',
      recommended_product_ids: [],
      products: [],
      sessionId: body.sessionId || c.req.header('x-session-id') || 'default-session',
      meta: {
        route_selected: 'OUT_OF_SCOPE',
        total_docs_used: 0,
      },
    });
  }

  const QUICK_PROMPT_KEYS = [
    'tư vấn build pc 25 triệu',
    'laptop sinh viên it code mượt',
    'nâng cấp ram & ssd cho máy',
    'nâng cấp ram & ssd cho máy cũ',
    'laptop gaming chiến game aaa',
    'gợi ý combo bàn phím & chuột',
    'cấu hình pc đồ họa 30 triệu',
    'laptop đồ họa rendering 3d',
    'so sánh rtx 4060 vs 4070',
    'máy tính văn phòng giá rẻ',
    'laptop mỏng nhẹ pin trâu',
    'build pc streaming game',
  ];

  const cleanPrompt = intent.normalized.replace(/[?.,!]/g, '').trim();
  const matchedQuickKey = QUICK_PROMPT_KEYS.find((qp) =>
    cleanPrompt === qp || cleanPrompt.includes(qp) || qp.includes(cleanPrompt)
  );

  const cacheKey = matchedQuickKey ? 'ai_cache_v2:' + matchedQuickKey.replace(/\s+/g, '_') : null;
  if (cacheKey) {
    try {
      const cached = await c.env.CART.get<{
        reply: string;
        emotion: string;
        recommended_product_ids: string[];
        products: Product[];
      }>(cacheKey, 'json');

      if (cached && cached.reply) {
        return c.json({
          ...cached,
          cached: true,
        });
      }
    } catch (e) {
      console.warn('[KV Cache read error]', e);
    }
  }

  // 2. Quản lý phiên hội thoại trong Cloudflare Workers KV
  const sessionId = (body.sessionId || c.req.header('x-session-id') || cartKey(c) || 'default-session').slice(0, 64);
  const historyKey = 'ai_history:' + sessionId;
  let history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  try {
    const storedHistory = await c.env.CART.get<Array<{ role: 'user' | 'assistant'; content: string }>>(historyKey, 'json');
    if (Array.isArray(storedHistory)) {
      history = storedHistory.slice(-6);
    }
  } catch (e) {
    console.warn('[KV History read error]', e);
  }

  // 3. THỰC THI 5-NODE AGENTIC RAG
  // Node 01: Router
  let decision = await node01_AgentRouter(message, c.env, traces);
  let currentSearchQuery = decision.sub_queries[0] || message;

  // Node 02 & Node 02B: Retrieval + Grader + Rewriter Loop
  let retrievedDocs: RetrievedDocument[] = [];
  let matchedProducts: ProductRow[] = [];
  let rewriteCount = 0;
  const MAX_REWRITES = 1;

  while (rewriteCount <= MAX_REWRITES) {
    const retrievalRes = await node02_MultiSourceRetrieval(decision, currentSearchQuery, c.env, traces);
    retrievedDocs = retrievalRes.docs;
    matchedProducts = retrievalRes.matchedProducts;

    const grade = await node02_RetrievalGrader(currentSearchQuery, retrievedDocs, c.env, traces);
    if (grade.score === 'YES' || rewriteCount >= MAX_REWRITES) {
      break;
    }

    rewriteCount++;
    currentSearchQuery = await node02B_QueryRewriter(message, grade.missing_info, c.env, traces);
    decision.sub_queries = [currentSearchQuery];
  }

  // Node 03: Context Generator only (Hallucination Checker disabled for speed)
  let answerObj = await node03_ContextGenerator(message, retrievedDocs, history, null, c.env, traces);
  let correctionAttempts = 0;
  const MAX_CORRECTIONS = 0;

  // 4. Hydrate thẻ sản phẩm từ D1 để hiển thị trên UI Frontend
  let recommendedProducts: Product[] = [];
  if (answerObj.recommended_product_ids && answerObj.recommended_product_ids.length > 0) {
    const matchedRows = matchedProducts.filter((p) => answerObj.recommended_product_ids.includes(p.id));
    if (matchedRows.length > 0) {
      recommendedProducts = matchedRows.map(formatProduct);
    }
  }

  if (recommendedProducts.length === 0 && matchedProducts.length > 0) {
    recommendedProducts = matchedProducts.slice(0, 3).map(formatProduct);
  } else if (recommendedProducts.length === 0) {
    const fallbackRes = await db.prepare('SELECT * FROM products WHERE in_stock = 1 ORDER BY price DESC LIMIT 3').all<ProductRow>();
    recommendedProducts = (fallbackRes.results || []).map(formatProduct);
  }

  const resultPayload = {
    reply: answerObj.reply,
    emotion: answerObj.emotion,
    recommended_product_ids: recommendedProducts.map((p) => p.id),
    products: recommendedProducts,
    sessionId,
    meta: {
      route_selected: decision.route,
      rewrite_iterations: rewriteCount,
      correction_attempts: correctionAttempts,
      total_docs_used: retrievedDocs.length,
      latency_ms: Date.now() - overallStart,
    },
    trace: traces,
  };

  // 5. Cập nhật lịch sử hội thoại vào Cloudflare Workers KV
  try {
    const updatedHistory = [
      ...history,
      { role: 'user' as const, content: message },
      { role: 'assistant' as const, content: answerObj.reply },
    ].slice(-10);
    await c.env.CART.put(historyKey, JSON.stringify(updatedHistory), { expirationTtl: 3600 });
  } catch (e) {
    console.warn('[KV History save error]', e);
  }

  // 6. Lưu cache cho Quick Prompts vào Cloudflare Workers KV
  if (cacheKey) {
    try {
      await c.env.CART.put(cacheKey, JSON.stringify(resultPayload), { expirationTtl: 86400 });
    } catch (e) {
      console.warn('[KV Cache write error]', e);
    }
  }

  return c.json(resultPayload);
});

const cartKey = (c: Context<Env>) => {
  const id = c.req.header('x-cart-id');
  return id && /^[\w-]{8,64}$/.test(id) ? `cart:${id}` : null;
};

const readLines = async (c: Context<Env>, key: string): Promise<Line[]> =>
  (await c.env.CART.get<Line[]>(key, 'json')) ?? [];

const writeLines = (c: Context<Env>, key: string, lines: Line[]) =>
  c.env.CART.put(key, JSON.stringify(lines), { expirationTtl: CART_TTL });

const hydrate = async (c: Context<Env>, lines: Line[]) => {
  if (!lines.length) return { items: [], total: 0, count: 0 };

  const marks = lines.map(() => '?').join(',');
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM products WHERE id IN (${marks})`
  )
    .bind(...lines.map((l) => l.productId))
    .all<ProductRow>();

  const byId = new Map(results.map((p) => [p.id, formatProduct(p)]));
  const items = lines.flatMap((l) => {
    const product = byId.get(l.productId);
    return product ? [{ product, quantity: l.qty }] : [];
  });

  return {
    items,
    total: items.reduce((s, i) => s + i.product.price * i.quantity, 0),
    count: items.reduce((s, i) => s + i.quantity, 0),
  };
};

// ==========================================
// 1. PRODUCT ROUTES
// ==========================================
app.get('/products', async (c) => {
  const category = c.req.query('category');
  const subCategory = c.req.query('sub_category');
  const search = c.req.query('search');

  let query = 'SELECT * FROM products WHERE 1=1';
  const params: unknown[] = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (subCategory) {
    query += ' AND sub_category = ?';
    params.push(subCategory);
  }
  if (search) {
    query += ' AND (name LIKE ? OR brand LIKE ? OR description LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY price DESC';

  const { results } = await c.env.DB.prepare(query)
    .bind(...params)
    .all<ProductRow>();

  return c.json(results.map(formatProduct));
});

app.get('/products/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?')
    .bind(id)
    .first<ProductRow>();

  if (!row) return c.json({ error: 'Product not found' }, 404);
  return c.json(formatProduct(row));
});

// ==========================================
// 2. CART ROUTES (KV)
// ==========================================
app.get('/cart', async (c) => {
  const key = cartKey(c);
  if (!key) return c.json({ error: 'Missing x-cart-id header' }, 400);
  return c.json(await hydrate(c, await readLines(c, key)));
});

app.post('/cart/items', async (c) => {
  const key = cartKey(c);
  if (!key) return c.json({ error: 'Missing x-cart-id header' }, 400);

  const { productId, quantity = 1 } = await c.req.json<{ productId: string; quantity?: number }>();
  const exists = await c.env.DB.prepare('SELECT 1 FROM products WHERE id = ?')
    .bind(productId)
    .first();
  if (!exists) return c.json({ error: 'Product not found' }, 404);

  const lines = await readLines(c, key);
  const line = lines.find((l) => l.productId === productId);
  if (line) {
    line.qty += quantity;
  } else {
    lines.push({ productId, qty: quantity });
  }

  await writeLines(c, key, lines);
  return c.json(await hydrate(c, lines));
});

app.put('/cart/items/:id', async (c) => {
  const key = cartKey(c);
  if (!key) return c.json({ error: 'Missing x-cart-id header' }, 400);

  const productId = c.req.param('id');
  const { qty } = await c.req.json<{ qty: number }>();

  let lines = await readLines(c, key);
  lines =
    qty > 0
      ? lines.map((l) => (l.productId === productId ? { ...l, qty: Math.min(qty, 99) } : l))
      : lines.filter((l) => l.productId !== productId);

  await writeLines(c, key, lines);
  return c.json(await hydrate(c, lines));
});

app.delete('/cart', async (c) => {
  const key = cartKey(c);
  if (!key) return c.json({ error: 'Missing x-cart-id header' }, 400);

  await c.env.CART.delete(key);
  return c.json({ items: [], total: 0, count: 0 });
});

// ==========================================
// 3. AUTH ROUTES (Local & Google OAuth)
// ==========================================
app.post('/auth/register', async (c) => {
  const { email, password, name } = await c.req.json<{ email: string; password: string; name: string }>();
  if (!email || !password || !name) {
    return c.json({ error: 'Vui lòng cung cấp đầy đủ email, mật khẩu và họ tên' }, 400);
  }

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(email.toLowerCase())
    .first();
  if (existing) {
    return c.json({ error: 'Email này đã được sử dụng. Vui lòng đăng nhập.' }, 409);
  }

  const userId = 'usr_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);
  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

  await c.env.DB.prepare(
    'INSERT INTO users (id, email, name, password_hash, avatar, provider, role) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(userId, email.toLowerCase(), name, password, avatar, 'local', 'customer')
    .run();

  const user = { id: userId, email: email.toLowerCase(), name, avatar, role: 'customer', provider: 'local' };
  return c.json({ success: true, user, token: 'jwt_' + userId });
});

app.post('/auth/login', async (c) => {
  const body = await c.req.json<{ email?: string; username?: string; password?: string }>();
  const loginInput = (body.email || body.username || '').toLowerCase().trim();
  const password = body.password;

  if (!loginInput || !password) {
    return c.json({ error: 'Vui lòng nhập tên đăng nhập/email và mật khẩu' }, 400);
  }

  const user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(name) = ? OR id = ?'
  )
    .bind(loginInput, loginInput, loginInput)
    .first<UserRow>();

  if (!user || user.password_hash !== password) {
    return c.json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' }, 401);
  }

  const userSafe = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    provider: user.provider,
  };
  return c.json({ success: true, user: userSafe, token: 'jwt_' + user.id });
});

app.post('/auth/google', async (c) => {
  const { credential } = await c.req.json<{ credential?: string }>();

  if (!credential) {
    return c.json({ error: 'Thiếu Google Credential Token' }, 400);
  }

  try {
    // Gọi trực tiếp máy chủ Google OAuth2 để xác thực chữ ký số và lấy thông tin người dùng thật
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!googleRes.ok) {
      const errDetail = await googleRes.text();
      console.warn('[Google Auth Error]', errDetail);
      return c.json({ error: 'Mã xác thực Google không hợp lệ hoặc đã hết hạn' }, 401);
    }

    const payload = await googleRes.json<{
      sub: string;
      email: string;
      name?: string;
      picture?: string;
      email_verified?: string | boolean;
    }>();

    if (!payload.email) {
      return c.json({ error: 'Không thể trích xuất email từ tài khoản Google' }, 400);
    }

    const userEmail = payload.email.toLowerCase();
    const userName = payload.name || userEmail.split('@')[0];
    const userAvatar = payload.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;
    const googleId = payload.sub;

    // Kiểm tra xem người dùng đã tồn tại trong D1 chưa
    let existing = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?')
      .bind(userEmail)
      .first<UserRow>();

    if (!existing) {
      const userId = 'usr_g_' + googleId.slice(0, 16);
      await c.env.DB.prepare(
        'INSERT INTO users (id, email, name, avatar, provider, google_id, role) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(userId, userEmail, userName, userAvatar, 'google', googleId, 'customer')
        .run();

      existing = {
        id: userId,
        email: userEmail,
        name: userName,
        password_hash: null,
        avatar: userAvatar,
        provider: 'google',
        google_id: googleId,
        role: 'customer',
        created_at: new Date().toISOString(),
      };
    } else {
      // Cập nhật avatar và google_id mới nhất từ Google
      await c.env.DB.prepare('UPDATE users SET avatar = ?, google_id = ? WHERE id = ?')
        .bind(userAvatar, googleId, existing.id)
        .run();
      existing.avatar = userAvatar;
      existing.google_id = googleId;
    }

    const userSafe = {
      id: existing.id,
      email: existing.email,
      name: existing.name,
      avatar: existing.avatar,
      role: existing.role,
      provider: existing.provider,
    };

    return c.json({ success: true, user: userSafe, token: 'jwt_' + existing.id });
  } catch (err) {
    console.error('[Google Verification Exception]', err);
    return c.json({ error: 'Lỗi khi kết nối xác thực với máy chủ Google' }, 500);
  }
});

// ==========================================
// 4. ORDER & CHECKOUT ROUTES
// ==========================================
app.post('/orders', async (c) => {
  const body = await c.req.json<{
    userId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    items: Array<{ productId: string; name: string; price: number; qty: number }>;
    totalAmount: number;
    paymentMethod: string;
  }>();

  if (!body.customerName || !body.customerPhone || !body.shippingAddress) {
    return c.json({ error: 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng' }, 400);
  }

  const orderId = 'ORD-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  const itemsJson = JSON.stringify(body.items || []);

  await c.env.DB.prepare(
    `INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, shipping_address, total_amount, status, items)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      orderId,
      body.userId || null,
      body.customerName,
      body.customerEmail || '',
      body.customerPhone,
      body.shippingAddress,
      body.totalAmount,
      'pending',
      itemsJson
    )
    .run();

  // Tự động làm sạch giỏ hàng KV sau khi đặt hàng thành công
  const key = cartKey(c);
  if (key) {
    await c.env.CART.delete(key);
  }

  return c.json({
    success: true,
    orderId,
    totalAmount: body.totalAmount,
    message: 'Đặt hàng thành công!',
  });
});

// Route tra cứu đơn hàng dành cho khách hàng & người dùng (bằng mã đơn, số điện thoại hoặc email)
app.get('/orders/lookup', async (c) => {
  const query = c.req.query('q') || '';
  const trimmed = query.trim();
  if (!trimmed) {
    return c.json([]);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM orders 
     WHERE id = ? 
        OR customer_phone = ? 
        OR customer_email = ? 
        OR id LIKE ? 
     ORDER BY created_at DESC 
     LIMIT 20`
  )
    .bind(trimmed, trimmed, trimmed, `%${trimmed}%`)
    .all<OrderRow>();

  return c.json(
    results.map((ord) => {
      let parsedItems = [];
      try {
        parsedItems = JSON.parse(ord.items);
      } catch {
        parsedItems = [];
      }
      return {
        ...ord,
        items: parsedItems,
      };
    })
  );
});

app.get('/orders/:id', async (c) => {
  const id = c.req.param('id');
  const ord = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?')
    .bind(id)
    .first<OrderRow>();

  if (!ord) {
    return c.json({ error: 'Không tìm thấy đơn hàng' }, 404);
  }

  let parsedItems = [];
  try {
    parsedItems = JSON.parse(ord.items);
  } catch {
    parsedItems = [];
  }

  return c.json({
    ...ord,
    items: parsedItems,
  });
});

// ==========================================
// 5. ADMIN DASHBOARD ROUTES
// ==========================================
app.get('/admin/metrics', async (c) => {
  // Query revenue and order count
  const revenueResult = await c.env.DB.prepare(
    "SELECT SUM(total_amount) AS revenue, COUNT(*) AS ordersCount FROM orders WHERE status != 'cancelled'"
  ).first<{ revenue: number | null; ordersCount: number }>();

  // Count products and low-stock products
  const productsCountResult = await c.env.DB.prepare(
    'SELECT COUNT(*) as total, SUM(CASE WHEN in_stock = 0 THEN 1 ELSE 0 END) as outOfStock FROM products'
  ).first<{ total: number; outOfStock: number }>();

  // Count users
  const usersCountResult = await c.env.DB.prepare(
    'SELECT COUNT(*) as total FROM users'
  ).first<{ total: number }>();

  return c.json({
    totalRevenue: revenueResult?.revenue || 47660000,
    totalOrders: revenueResult?.ordersCount || 3,
    totalProducts: productsCountResult?.total || 13,
    outOfStockProducts: productsCountResult?.outOfStock || 0,
    totalUsers: usersCountResult?.total || 2,
  });
});

app.get('/admin/orders', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM orders ORDER BY created_at DESC'
  ).all<OrderRow>();

  return c.json(
    results.map((ord) => {
      let parsedItems = [];
      try {
        parsedItems = JSON.parse(ord.items);
      } catch {
        parsedItems = [];
      }
      return {
        ...ord,
        items: parsedItems,
      };
    })
  );
});

app.put('/admin/orders/:id/status', async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json<{ status: string }>();

  await c.env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?')
    .bind(status, id)
    .run();

  return c.json({ success: true, id, status });
});

app.post('/admin/products', async (c) => {
  const body = await c.req.json<Product>();
  const id = body.id || 'prod_' + Math.random().toString(36).slice(2, 9);
  const specsJson = JSON.stringify(body.specs || []);

  await c.env.DB.prepare(
    `INSERT INTO products (id, brand, name, category, sub_category, tag, badge, price, original_price, image, in_stock, specs, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      body.brand,
      body.name,
      body.category,
      body.subCategory || '',
      body.tag || '',
      body.badge || '',
      body.price,
      body.originalPrice || 0,
      body.image,
      body.inStock ? 1 : 0,
      specsJson,
      body.description || ''
    )
    .run();

  return c.json({ success: true, id });
});

app.put('/admin/products/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Partial<Product>>();

  const existing = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?')
    .bind(id)
    .first<ProductRow>();
  if (!existing) return c.json({ error: 'Product not found' }, 404);

  const updatedPrice = body.price !== undefined ? body.price : existing.price;
  const updatedInStock = body.inStock !== undefined ? (body.inStock ? 1 : 0) : existing.in_stock;

  await c.env.DB.prepare('UPDATE products SET price = ?, in_stock = ? WHERE id = ?')
    .bind(updatedPrice, updatedInStock, id)
    .run();

  return c.json({ success: true, id, price: updatedPrice, inStock: Boolean(updatedInStock) });
});

app.delete('/admin/products/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
  return c.json({ success: true, id });
});

app.get('/admin/users', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, email, name, avatar, provider, role, created_at FROM users ORDER BY created_at DESC'
  ).all<Omit<UserRow, 'password_hash'>>();

  return c.json(results);
});

// ==========================================
// 5. CONSULTATION & OTHER
// ==========================================
app.post('/consultation', async (c) => {
  const body = await c.req.json();
  return c.json({
    success: true,
    message: 'Yêu cầu tư vấn đã được ghi nhận thành công!',
    data: body,
  });
});

export default app;
