# Nền Tảng Thương Mại Điện Tử Thiết Bị Công Nghệ (TechStore / webTMDT)

Dự án Web TMĐT được xây dựng theo mô hình **Monorepo** và đóng gói triển khai dưới dạng **một Cloudflare Worker duy nhất**:
- **Backend (`apps/api`)**: Cloudflare Worker sử dụng Hono framework, xử lý toàn bộ endpoint `/api/*`.
- **Database**: Cloudflare D1 (`store-db`) lưu trữ toàn bộ danh mục sản phẩm (Laptop, PC, Linh kiện, Phụ kiện) và thông số kỹ thuật specs.
- **Giỏ hàng (Cart)**: Cloudflare KV (`CART`) lưu trạng thái giỏ hàng theo session `x-cart-id` trong 30 ngày.
- **Frontend (`apps/web`)**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Three.js VRM (Trợ lý ảo AI 3D), được build và phục vụ trực tiếp như static assets bởi Worker.

---

## 1. Cấu Trúc Thư Mục Monorepo
```
webTMDT/
├── package.json                 # Root monorepo (workspaces: ["apps/*"])
├── .agents/skills/              # Bộ kỹ năng BMad Method (30 skills)
├── apps/
│   ├── api/                     # Backend Cloudflare Worker (Hono)
│   │   ├── package.json
│   │   ├── wrangler.toml        # Cấu hình production Cloudflare
│   │   ├── wrangler.toml.example
│   │   ├── schema.sql           # Schema bảng products (D1 SQLite)
│   │   ├── seed.sql             # Dữ liệu 13 sản phẩm mẫu TechStore
│   │   └── src/index.ts         # REST API (/api/products, /api/cart, /api/consultation)
│   └── web/                     # Frontend React 19 + Three.js VRM
│       ├── package.json
│       ├── vite.config.ts       # Proxy /api -> 127.0.0.1:8788 khi dev
│       ├── index.html
│       └── src/
│           ├── api.ts           # API Client kết nối Cloudflare D1 & KV
│           ├── App.tsx          # Storefront chính
│           └── components/      # LaptopShowcase, CompareModal, AICompanion3D,...
```

---

## 2. Hướng Dẫn Phát Triển Local

1. **Cài đặt dependencies tại thư mục gốc**:
   ```bash
   npm install
   ```

2. **Khởi tạo cơ sở dữ liệu D1 local**:
   ```bash
   npm run db:init
   ```

3. **Chạy song song API và Web**:
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5174`
   - Backend API Worker: `http://127.0.0.1:8788`

---

## 3. Hướng Dẫn Deploy Lên Cloudflare Production

### Bước 1: Đăng nhập Cloudflare Wrangler
```bash
npx wrangler login
npx wrangler whoami
```

### Bước 2: Tạo tài nguyên D1 Database và KV Namespace
```bash
npx wrangler d1 create store-db
npx wrangler kv namespace create CART
```
Lấy 2 mã ID trả về từ terminal và cập nhật vào file `apps/api/wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "store-db"
database_id = "<ID_TRA_VE_TU_D1_CREATE>"

[[kv_namespaces]]
binding = "CART"
id = "<ID_TRA_VE_TU_KV_NAMESPACE_CREATE>"
```

### Bước 3: Khởi tạo Schema và Dữ liệu mẫu trên Remote D1
```bash
npm run db:init:remote -w apps/api
```
Kiểm tra số lượng sản phẩm sau khi seed:
```bash
cd apps/api
npx wrangler d1 execute store-db --remote --command "SELECT COUNT(*) AS total FROM products;"
cd ../..
```

### Bước 4: Kiểm tra trước khi Deploy
```bash
npm run typecheck
npm run build
npm run deploy -w apps/api -- --dry-run
```

### Bước 5: Deploy chính thức
```bash
npm run deploy
```
Sau khi hoàn tất, Wrangler sẽ in ra URL chính thức của bạn:
`https://webtmdt-store.<subdomain>.workers.dev`

---

## 4. Tài Liệu Chi Tiết & Báo Cáo Triển Khai
Xem toàn bộ báo cáo kết quả triển khai thực tế, bảng thông số tài nguyên, hướng dẫn xử lý lỗi chi tiết tại:
👉 [**Báo Cáo Triển Khai Cloudflare Chi Tiết (BAO_CAO_DEPLOY.md)**](./BAO_CAO_DEPLOY.md)
