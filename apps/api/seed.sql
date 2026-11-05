-- Seed data for TechStore / webTMDT
INSERT INTO products (id, brand, name, category, sub_category, tag, badge, price, original_price, image, in_stock, specs, description) VALUES
-- Hero Product
('hero-yoga-pro-7', 'LENOVO', 'Lenovo Yoga Pro 7 14AHP9', 'laptop', 'design', 'YOGA PRO 7', 'ĐƯỢC CHỌN CHO HIỆU NĂNG / 2026', 34990000, 37990000, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=85', 1, '["Ryzen 7 8845HS · RTX 4050", "32GB / 1TB · 14,5\" 3K 120Hz"]', 'Lenovo Yoga Pro 7. Sức mạnh cho từng dòng code, từng khung hình và mọi ý tưởng tiếp theo.'),

-- Featured Laptops
('lap-1', 'LENOVO', 'Yoga Pro 7 14AHP9', 'laptop', 'design', 'ĐỒ HỌA', '', 34990000, 36990000, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80', 1, '["Ryzen 7 8845HS · RTX 4050", "32GB / 1TB · 14,5\" 3K 120Hz"]', 'Cỗ máy đồ họa mỏng nhẹ với màn hình 3K PureSight Pro và GPU NVIDIA RTX chuyên dụng.'),
('lap-2', 'ASUS', 'Vivobook 14', 'laptop', 'office', 'VĂN PHÒNG', '', 15990000, 17500000, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80', 1, '["Core i5-13500H · Iris Xe", "16GB / 512GB · 14\" FHD"]', 'Laptop văn phòng thanh lịch, thời lượng pin cả ngày và bàn phím ErgoSense êm ái.'),
('lap-3', 'LENOVO', 'Legion Slim 5', 'laptop', 'gaming', 'GAMING', '', 32990000, 35990000, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80', 1, '["Ryzen 7 7840HS · RTX 4060", "16GB / 1TB · 16\" 165Hz"]', 'Laptop gaming thế hệ mới với tản nhiệt Legion ColdFront 5.0 và chip AI Lenovo LA1.'),
('lap-4', 'ASUS', 'Zenbook 14 OLED', 'laptop', 'design', 'OLED CAO CẤP', '', 26990000, 28990000, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80', 1, '["Core Ultra 5 125H · Intel Arc", "16GB / 512GB · 14\" 3K OLED"]', 'Kiệt tác siêu di động với màn hình Lumina OLED rực rỡ và bộ xử lý Intel Core Ultra tích hợp AI.'),

-- Featured Components
('comp-1', 'NVIDIA', 'GeForce RTX 4060', 'component', 'gpu', 'GPU / CARD ĐỒ HỌA', '', 8490000, 9200000, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80', 1, '["8GB GDDR6 · 115W · PCIe 4.0"]', 'Kiến trúc Ada Lovelace hiệu quả đột phá, hỗ trợ DLSS 3 và dò tia Ray Tracing thời gian thực.'),
('comp-2', 'AMD', 'AMD Ryzen 5 7600', 'component', 'cpu', 'CPU / AM5', '', 4990000, 5490000, 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80', 1, '["6 nhân · 12 luồng · Tối đa 5,1GHz"]', 'Bộ vi xử lý tiến trình 5nm Zen 4 cực mát, socket AM5 hỗ trợ nâng cấp lâu dài.'),
('comp-3', 'SAMSUNG', 'Samsung 990 EVO 1TB', 'component', 'ssd', 'SSD / NVMe', '', 2190000, 2490000, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80', 1, '["M.2 2280 · Đọc tối đa 5.000MB/s"]', 'Ổ cứng SSD PCIe 4.0 x4 & PCIe 5.0 x2 tối ưu nhiệt độ và tốc độ phản hồi cho game và đồ họa.'),
('comp-4', 'ASUS', 'ROG Strix B650-A Gaming WiFi', 'component', 'mainboard', 'MAINBOARD / AM5', '', 6490000, 6990000, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', 1, '["ATX · DDR5 · PCIe 5.0 · Wi-Fi 6E"]', 'Bo mạch chủ gaming cao cấp với dàn phase nguồn 12+2, tản nhiệt VRM dày dặn và âm thanh SupremeFX.'),
('comp-5', 'CORSAIR', 'Vengeance RGB 32GB (2x16GB)', 'component', 'ram', 'RAM / DDR5', '', 3290000, 3690000, 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80', 1, '["DDR5 6000MHz · CL36 · Intel XMP / EXPO"]', 'Bộ nhớ DDR5 tốc độ cao với dải LED RGB 10 vùng độc lập và hỗ trợ ép xung một chạm iCUE.'),

-- Featured Accessories
('acc-1', 'KEYCHRON', 'Keychron K2 V2', 'accessory', 'keyboard', 'BÀN PHÍM CƠ', '', 1890000, 2100000, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', 1, '["75% · Gateron Brown · Bluetooth"]', 'Bàn phím cơ không dây layout 75% hoàn hảo cho Mac & Windows với switch Gateron êm ái.'),
('acc-2', 'LOGITECH', 'Logitech MX Master 3S', 'accessory', 'mouse', 'CHUỘT KHÔNG DÂY', '', 2290000, 2590000, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', 1, '["8.000 DPI · USB-C · Không dây"]', 'Chuột công thái học cao cấp với con lăn điện từ MagSpeed và cảm biến quang học Darkfield 8K.'),
('acc-3', 'DELL', 'Dell UltraSharp U2724D', 'accessory', 'monitor', 'MÀN HÌNH ĐỒ HỌA', '', 9490000, 10200000, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', 1, '["27\" QHD · IPS Black · 120Hz"]', 'Màn hình đồ họa đỉnh cao với tấm nền IPS Black độ tương phản 2000:1 và tần số quét 120Hz mượt mà.');

-- Seed Users (Admin & Customer)
INSERT INTO users (id, email, name, password_hash, avatar, provider, role) VALUES
('usr_admin_hoang', 'hoang@techstore.vn', 'Hoang', '123456', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'local', 'admin'),
('usr_admin_01', 'admin@techstore.vn', 'Quản Trị Viên', 'admin123', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'local', 'admin'),
('usr_cust_01', 'user@gmail.com', 'Nguyễn Văn Minh', 'user123', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80', 'google', 'customer');

-- Seed Mock Orders
INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, shipping_address, total_amount, status, items) VALUES
('ORD-2026-001', 'usr_cust_01', 'Nguyễn Văn Minh', 'user@gmail.com', '0988123456', '123 Cầu Giấy, Hà Nội', 34990000, 'completed', '[{"productId": "lap-1", "name": "Yoga Pro 7 14AHP9", "price": 34990000, "qty": 1}]'),
('ORD-2026-002', NULL, 'Trần Thị Thu', 'thutran@gmail.com', '0912345678', '45 Lê Duẩn, Đà Nẵng', 10780000, 'shipping', '[{"productId": "comp-1", "name": "GeForce RTX 4060", "price": 8490000, "qty": 1}, {"productId": "acc-2", "name": "Logitech MX Master 3S", "price": 2290000, "qty": 1}]'),
('ORD-2026-003', NULL, 'Lê Hoàng Nam', 'namle@yahoo.com', '0977889900', '78 Nguyễn Trãi, Q.1, TP.HCM', 1890000, 'pending', '[{"productId": "acc-1", "name": "Keychron K2 V2", "price": 1890000, "qty": 1}]');
