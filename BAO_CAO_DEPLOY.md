# Hướng Dẫn Deploy Lên Cloudflare & Báo Cáo Triển Khai Thực Tế

Ứng dụng web thương mại điện tử **TECHSTORE (webTMDT)** được deploy dưới dạng **một Cloudflare Worker duy nhất**:
- **Worker** xử lý `/api/*` bằng **Hono framework**, dữ liệu sản phẩm, tài khoản người dùng và đơn hàng lưu ở **D1 (`store-db`)**, giỏ hàng lưu ở **KV (`CART`)**.
- **Frontend React** (build từ `apps/web/dist`) được phục vụ như **static assets** trực tiếp bởi chính Worker đó thông qua cấu hình `run_worker_first = ["/api/*"]`.

---

## 1. Yêu Cầu Môi Trường
- **Node.js**: Phiên bản 18 trở lên và npm.
- **Tài khoản Cloudflare**: Có quyền quản lý Workers, D1 và KV.
- **Đăng nhập Wrangler một lần**:
  ```bash
  npx wrangler login
  npx wrangler whoami
  ```

---

## 2. Cài Đặt Dependencies
Chạy tại thư mục gốc repository:
```bash
npm install
```

---

## 3. Tạo Tài Nguyên D1 và KV
Ở bước này sẽ tạo tài nguyên thật trên tài khoản Cloudflare của bạn:
```bash
npx wrangler d1 create store-db
npx wrangler kv namespace create CART
```

Mỗi lệnh sẽ in ra một UUID. Cập nhật các ID này vào file [`apps/api/wrangler.toml`](apps/api/wrangler.toml):
```toml
name = "webtmdt-store"
main = "src/index.ts"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "../web/dist"
binding = "ASSETS"
run_worker_first = ["/api/*"]

[[d1_databases]]
binding = "DB"
database_name = "store-db"
database_id = "<ID trả về từ lệnh d1 create>"

[[kv_namespaces]]
binding = "CART"
id = "<ID trả về từ lệnh kv namespace create>"
```

> **Lưu ý quan trọng**: File `wrangler.toml` ban đầu có thể chứa ID của account khác hoặc mẫu. Bắt buộc phải thay bằng ID thực tế của bạn trước khi deploy.

Kiểm tra lại danh sách tài nguyên trên Cloudflare:
```bash
npx wrangler d1 list
npx wrangler kv namespace list
```

---

## 4. Khởi Tạo Schema và Dữ Liệu Mẫu Trên Remote (Cloudflare D1)
Chạy lệnh khởi tạo cơ sở dữ liệu trên D1 đám mây:
```bash
npm run db:init:remote -w apps/api
```
Lệnh này tự động thực thi file `schema.sql` (tạo các bảng `products`, `users`, `orders`) rồi thực thi `seed.sql` (nạp 13 sản phẩm mẫu, tài khoản quản trị Admin `Hoang` / `123456`, và đơn hàng mẫu) lên D1 remote.

Kiểm tra số lượng sản phẩm trên D1 Remote:
```bash
npx wrangler d1 execute store-db --remote --command "SELECT COUNT(*) AS total_products FROM products;"
```

> **Cảnh báo**: File `schema.sql` có chứa lệnh `DROP TABLE IF EXISTS`. Chạy lại lệnh này sẽ xóa toàn bộ dữ liệu đang có trên remote.

---

## 5. Kiểm Tra Code & Build Trước Khi Deploy
Chạy kiểm tra tại thư mục gốc để đảm bảo 0 lỗi TypeScript và bundle thành công:
```bash
npm run typecheck
npm run build
npm run deploy -w apps/api -- --dry-run
```
Lệnh `--dry-run` chỉ bundle và xác nhận cấu hình bindings (D1, KV, Assets), không upload lên internet.

---

## 6. Deploy Lên Cloudflare Production
Triển khai toàn bộ ứng dụng (frontend + backend) chỉ với 1 lệnh duy nhất:
```bash
npm run deploy
```
Lệnh này sẽ tự động:
1. Chạy `npm run build` (biên dịch React 19 + Tailwind CSS + Assets sang `apps/web/dist`).
2. Chạy `wrangler deploy` trong thư mục `apps/api` để đẩy cả Static Assets và Worker API lên mạng lưới biên toàn cầu của Cloudflare.

Khi hoàn tất, Wrangler sẽ in ra đường dẫn URL chính thức, ví dụ:
```
https://webtmdt-store.dtc235200304.workers.dev
```

Kiểm tra nhanh API hoạt động:
```bash
curl https://webtmdt-store.dtc235200304.workers.dev/api/products
```
Mở URL gốc trên trình duyệt để trải nghiệm website bán hàng thực tế.

---

## 7. Cập Nhật Ứng Dụng Sau Này
- **Khi thay đổi Frontend hoặc Backend**: Chỉ cần chạy lại `npm run deploy`.
- **Khi thay đổi dữ liệu sản phẩm**: Chỉnh sửa file `seed.sql` hoặc chạy câu lệnh SQL trực tiếp:
  ```bash
  npx wrangler d1 execute store-db --remote --command "UPDATE products SET price = 25000000 WHERE id = 'lap-01';"
  ```
  *(Không chạy lại `db:init:remote` trừ khi bạn muốn reset trắng dữ liệu)*.

---

## 8. Chạy Môi Trường Local Development (Tùy Chọn)
Dành cho lập trình viên phát triển tính năng trên máy tính:
```bash
npm run db:init -w apps/api   # Tạo cơ sở dữ liệu D1 SQLite local
npm run dev                    # Khởi động web tại :5173 và API Worker tại :8788
```
Vite dev server sẽ tự động proxy toàn bộ request `/api/*` sang `http://127.0.0.1:8788`.

---

## 9. Kết Quả Deploy Thực Tế Của Dự Án

- **Ngày triển khai thành công**: 2026-10-30
- **URL chính thức**: [https://webtmdt-store.dtc235200304.workers.dev](https://webtmdt-store.dtc235200304.workers.dev)

### Bảng Thông Tin Tài Nguyên Thực Tế:
| Tài nguyên | Giá trị thực tế |
| :--- | :--- |
| **Worker Domain** | `webtmdt-store.dtc235200304.workers.dev` |
| **D1 Database (`store-db`)** | `b9934635-e390-4687-a213-6648552e3b9d` |
| **KV Namespace (`CART`)** | `026af6f9044046ebbfd7f8ee9a2e88ea` |
| **Số lượng sản phẩm sau khi seed** | **13** sản phẩm chính hãng (Laptop, PC, Linh kiện, Bàn phím, Chuột) |
| **Số đơn hàng đã ghi nhận trong D1** | **5** đơn hàng |
| **Tài khoản Quản trị viên (Admin)** | Tên đăng nhập: `Hoang` (hoặc `hoang@techstore.vn`) \| Mật khẩu: `123456` |
| **Version Worker mới nhất** | `4342523e-7307-410b-a3f0-5ad413be32bf` |
| **Cold Start Time** | **1 ms** |

### Các Bước Kỹ Thuật Đã Hoàn Thành:
1. Đã cấu hình và ánh xạ chính xác D1 `store-db` và KV `CART` vào `wrangler.toml`.
2. Khởi tạo schema đầy đủ với 3 bảng quan trọng: `products` (danh mục), `users` (tài khoản & phân quyền), `orders` (quản lý đơn hàng).
3. Đã cài đặt **30 kỹ năng BMad Method** hỗ trợ phát triển chuyên nghiệp.
4. Triển khai phương thức thanh toán **Quét mã VietQR tự động** (MB Bank - `CONG TY TECHSTORE VN`) đồng bộ trực tiếp với bảng `orders` của D1.
5. Tích hợp xác thực tài khoản Google qua **Google Identity Services SDK** và tài khoản nội bộ (Admin/Customer).
6. Tích hợp Trợ lý ảo AI 3D (Three.js VRM Companion) hỗ trợ tư vấn cấu hình sản phẩm trực quan.
7. Đã chạy Smoke Test tự động trên production: `GET /api/products` (200 OK), `POST /api/auth/login` (200 OK - Admin xác thực), `POST /api/orders` (200 OK - Lưu đơn hàng), `GET /api/admin/orders` (200 OK).

---

## 10. Bảng Xử Lý Các Lỗi Thường Gặp (Troubleshooting)

| Tên lỗi | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| **`code: 7404 database could not be found`** | `database_id` trong `wrangler.toml` không thuộc tài khoản Cloudflare hiện tại. | Tạo lại D1 bằng lệnh `npx wrangler d1 create store-db` và cập nhật ID mới vào `wrangler.toml`. |
| **`Invalid uuid [code: 7400]`** | `database_id` bị copy sai hoặc thiếu/thừa ký tự trắng. | Kiểm tra và copy lại chính xác mã UUID từ lệnh `npx wrangler d1 list`. |
| **`no such table: products` / `users`** | Chưa thực thi schema/seed trên Cloudflare D1 Remote. | Chạy lệnh `npm run db:init:remote -w apps/api` (xem Bước 4). |
| **`KV namespace not found`** | ID của KV Namespace trong `wrangler.toml` không đúng. | Tạo lại KV bằng lệnh `npx wrangler kv namespace create CART` và cập nhật ID mới. |
| **`Could not resolve assets directory`** | Thư mục `apps/web/dist` chưa được biên dịch. | Chạy `npm run build` trước khi deploy. |
| **Trang trắng hoặc `/api/*` trả về 404** | Worker chưa ưu tiên xử lý route API trước Static Assets. | Thêm dòng `run_worker_first = ["/api/*"]` vào cấu hình `[assets]` trong `apps/api/wrangler.toml`. |
| **Lỗi Google `401: invalid_client`** | Google chưa tìm thấy Client ID hoặc chưa cập nhật domain web. | Thêm domain `https://webtmdt-store.dtc235200304.workers.dev` vào **Nguồn gốc JavaScript được phép** của Client ID loại **Web application** trên Google Cloud Console. |
| **Lỗi Google `403: org_internal`** | Màn hình đồng ý OAuth đang để chế độ **Nội bộ (Internal)** nên chặn tài khoản `@gmail.com` ngoài tổ chức. | Chuyển User Type sang **Bên ngoài (External)** và bấm **Xuất bản ứng dụng (Publish App)** trên Google Cloud Console. |
| **Ảnh sản phẩm không hiển thị** | Link ảnh trong `seed.sql` bị chặn bảo mật hoặc không truy cập được. | Cập nhật lại URL ảnh bằng link Unsplash/CDN có hỗ trợ HTTPS công khai. |

