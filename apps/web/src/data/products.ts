import type { Product, CategoryItem } from '../types';

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'laptop',
    title: 'Laptop',
    description: 'Văn phòng · Gaming · Đồ họa & workstation',
    iconName: 'Laptop',
    link: '#laptops'
  },
  {
    id: 'components',
    title: 'Linh kiện PC',
    description: 'CPU · GPU · Mainboard · RAM · SSD & HDD',
    iconName: 'Cpu',
    link: '#components'
  },
  {
    id: 'cases-cooling',
    title: 'Vỏ máy & tản nhiệt',
    description: 'PC case · PSU · Tản khí & tản nước',
    iconName: 'HardDrive',
    link: '#components'
  },
  {
    id: 'peripherals',
    title: 'Màn hình & phụ kiện',
    description: 'Màn hình · Bàn phím · Chuột · Phụ kiện gaming',
    iconName: 'Monitor',
    link: '#accessories'
  },
  {
    id: 'audio',
    title: 'Âm thanh & kết nối',
    description: 'Tai nghe · Microphone · Loa · Hub & dock',
    iconName: 'Headphones',
    link: '#accessories'
  },
  {
    id: 'networking',
    title: 'Mạng & mở rộng',
    description: 'Router · Wi-Fi · Adapter & cáp',
    iconName: 'Wifi',
    link: '#accessories'
  }
];

export const HERO_PRODUCT: Product = {
  id: 'hero-yoga-pro-7',
  brand: 'LENOVO',
  name: 'Lenovo Yoga Pro 7 14AHP9',
  category: 'laptop',
  subCategory: 'design',
  specs: [
    'Ryzen 7 8845HS · RTX 4050',
    '32GB / 1TB · 14,5" 3K 120Hz'
  ],
  price: 34990000,
  image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=85',
  badge: 'ĐƯỢC CHỌN CHO HIỆU NĂNG / 2026',
  tag: 'YOGA PRO 7',
  inStock: true,
  description: 'Lenovo Yoga Pro 7. Sức mạnh cho từng dòng code, từng khung hình và mọi ý tưởng tiếp theo.'
};

export const FEATURED_LAPTOPS: Product[] = [
  {
    id: 'lap-1',
    brand: 'LENOVO',
    name: 'Yoga Pro 7 14AHP9',
    category: 'laptop',
    subCategory: 'design',
    specs: [
      'Ryzen 7 8845HS · RTX 4050',
      '32GB / 1TB · 14,5" 3K 120Hz'
    ],
    price: 34990000,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Cỗ máy đồ họa mỏng nhẹ với màn hình 3K PureSight Pro và GPU NVIDIA RTX chuyên dụng.'
  },
  {
    id: 'lap-2',
    brand: 'ASUS',
    name: 'Vivobook 14',
    category: 'laptop',
    subCategory: 'office',
    specs: [
      'Core i5-13500H · Iris Xe',
      '16GB / 512GB · 14" FHD'
    ],
    price: 15990000,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Laptop văn phòng thanh lịch, thời lượng pin cả ngày và bàn phím ErgoSense êm ái.'
  },
  {
    id: 'lap-3',
    brand: 'LENOVO',
    name: 'Legion Slim 5',
    category: 'laptop',
    subCategory: 'gaming',
    specs: [
      'Ryzen 7 7840HS · RTX 4060',
      '16GB / 1TB · 16" 165Hz'
    ],
    price: 32990000,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Laptop gaming thế hệ mới với tản nhiệt Legion ColdFront 5.0 và chip AI Lenovo LA1.'
  },
  {
    id: 'lap-4',
    brand: 'ASUS',
    name: 'Zenbook 14 OLED',
    category: 'laptop',
    subCategory: 'design',
    specs: [
      'Core Ultra 5 125H · Intel Arc',
      '16GB / 512GB · 14" 3K OLED'
    ],
    price: 26990000,
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Kiệt tác siêu di động với màn hình Lumina OLED rực rỡ và bộ xử lý Intel Core Ultra tích hợp AI.'
  }
];

export const FEATURED_COMPONENTS: Product[] = [
  {
    id: 'comp-1',
    brand: 'NVIDIA',
    name: 'GeForce RTX 4060',
    category: 'component',
    subCategory: 'gpu',
    tag: 'GPU / CARD ĐỒ HỌA',
    specs: [
      '8GB GDDR6 · 115W · PCIe 4.0'
    ],
    price: 8490000,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Kiến trúc Ada Lovelace hiệu quả đột phá, hỗ trợ DLSS 3 và dò tia Ray Tracing thời gian thực.'
  },
  {
    id: 'comp-2',
    brand: 'AMD',
    name: 'AMD Ryzen 5 7600',
    category: 'component',
    subCategory: 'cpu',
    tag: 'CPU / AM5',
    specs: [
      '6 nhân · 12 luồng · Tối đa 5,1GHz'
    ],
    price: 4990000,
    image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Bộ vi xử lý tiến trình 5nm Zen 4 cực mát, socket AM5 hỗ trợ nâng cấp lâu dài.'
  },
  {
    id: 'comp-3',
    brand: 'SAMSUNG',
    name: 'Samsung 990 EVO 1TB',
    category: 'component',
    subCategory: 'ssd',
    tag: 'SSD / NVMe',
    specs: [
      'M.2 2280 · Đọc tối đa 5.000MB/s'
    ],
    price: 2190000,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Ổ cứng SSD PCIe 4.0 x4 & PCIe 5.0 x2 tối ưu nhiệt độ và tốc độ phản hồi cho game và đồ họa.'
  },
  {
    id: 'comp-4',
    brand: 'ASUS',
    name: 'ROG Strix B650-A Gaming WiFi',
    category: 'component',
    subCategory: 'mainboard',
    tag: 'MAINBOARD / AM5',
    specs: [
      'ATX · DDR5 · PCIe 5.0 · Wi-Fi 6E'
    ],
    price: 6490000,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Bo mạch chủ gaming cao cấp với dàn phase nguồn 12+2, tản nhiệt VRM dày dặn và âm thanh SupremeFX.'
  },
  {
    id: 'comp-5',
    brand: 'CORSAIR',
    name: 'Vengeance RGB 32GB (2x16GB)',
    category: 'component',
    subCategory: 'ram',
    tag: 'RAM / DDR5',
    specs: [
      'DDR5 6000MHz · CL36 · Intel XMP / EXPO'
    ],
    price: 3290000,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Bộ nhớ DDR5 tốc độ cao với dải LED RGB 10 vùng độc lập và hỗ trợ ép xung một chạm iCUE.'
  }
];

export const FEATURED_ACCESSORIES: Product[] = [
  {
    id: 'acc-1',
    brand: 'KEYCHRON',
    name: 'Keychron K2 V2',
    category: 'accessory',
    subCategory: 'keyboard',
    specs: [
      '75% · Gateron Brown · Bluetooth'
    ],
    price: 1890000,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Bàn phím cơ không dây layout 75% hoàn hảo cho Mac & Windows với switch Gateron êm ái.'
  },
  {
    id: 'acc-2',
    brand: 'LOGITECH',
    name: 'Logitech MX Master 3S',
    category: 'accessory',
    subCategory: 'mouse',
    specs: [
      '8.000 DPI · USB-C · Không dây'
    ],
    price: 2290000,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Chuột công thái học cao cấp với con lăn điện từ MagSpeed và cảm biến quang học Darkfield 8K.'
  },
  {
    id: 'acc-3',
    brand: 'DELL',
    name: 'Dell UltraSharp U2724D',
    category: 'accessory',
    subCategory: 'monitor',
    specs: [
      '27" QHD · IPS Black · 120Hz'
    ],
    price: 9490000,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Màn hình đồ họa đỉnh cao với tấm nền IPS Black độ tương phản 2000:1 và tần số quét 120Hz mượt mà.'
  }
];

export const ADDITIONAL_PRODUCTS: Product[] = [
  {
    id: 'lap-5',
    brand: 'ACER',
    name: 'Aspire 5 A515',
    category: 'laptop',
    subCategory: 'office',
    specs: ['Core i5-12450H · Iris Xe', '16GB / 512GB · 15,6" FHD'],
    price: 13990000,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Laptop học tập và văn phòng cân bằng giữa hiệu năng, độ bền và khả năng nâng cấp.'
  },
  {
    id: 'lap-6',
    brand: 'HP',
    name: 'Pavilion Aero 13',
    category: 'laptop',
    subCategory: 'office',
    specs: ['Ryzen 5 7535U · Radeon 660M', '16GB / 512GB · 13,3" WUXGA'],
    price: 17990000,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Thiết kế siêu nhẹ, pin lâu và màn hình 16:10 cho ngày làm việc linh hoạt.'
  },
  {
    id: 'lap-7',
    brand: 'MSI',
    name: 'Katana 15 B13V',
    category: 'laptop',
    subCategory: 'gaming',
    specs: ['Core i7-13620H · RTX 4060', '16GB / 1TB · 15,6" 144Hz'],
    price: 27990000,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Laptop gaming mạnh mẽ với màn hình 144Hz và hệ thống tản nhiệt Cooler Boost 5.'
  },
  {
    id: 'lap-8',
    brand: 'DELL',
    name: 'XPS 13 Plus',
    category: 'laptop',
    subCategory: 'design',
    specs: ['Core Ultra 7 155H · Intel Arc', '32GB / 1TB · 13,4" 3.5K OLED'],
    price: 39990000,
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Ultrabook cao cấp với thiết kế tối giản, màn hình OLED sắc nét và hiệu năng AI.'
  },
  {
    id: 'lap-9',
    brand: 'APPLE',
    name: 'MacBook Air M3 13',
    category: 'laptop',
    subCategory: 'design',
    specs: ['Apple M3 · 8 nhân GPU', '16GB / 512GB · 13,6" Liquid Retina'],
    price: 28990000,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'MacBook Air mỏng nhẹ, vận hành êm và đủ mạnh cho sáng tạo nội dung mỗi ngày.'
  },
  {
    id: 'comp-6',
    brand: 'AMD',
    name: 'Ryzen 7 7800X3D',
    category: 'component',
    subCategory: 'cpu',
    specs: ['8 nhân · 16 luồng · 3D V-Cache', 'Tối đa 5,0GHz · Socket AM5'],
    price: 9990000,
    image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'CPU gaming hàng đầu với bộ nhớ đệm 3D V-Cache cho tốc độ khung hình vượt trội.'
  },
  {
    id: 'comp-7',
    brand: 'NVIDIA',
    name: 'GeForce RTX 4070 Super',
    category: 'component',
    subCategory: 'gpu',
    specs: ['12GB GDDR6X · 220W · PCIe 4.0', 'DLSS 3 · Ray Tracing'],
    price: 17990000,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Card đồ họa 1440p mạnh mẽ cho gaming, dựng phim và các tác vụ AI.'
  },
  {
    id: 'comp-8',
    brand: 'SAMSUNG',
    name: '990 PRO 2TB',
    category: 'component',
    subCategory: 'ssd',
    specs: ['M.2 NVMe PCIe 4.0 · Đọc 7.450MB/s', 'Tản nhiệt tích hợp · 2TB'],
    price: 4490000,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'SSD NVMe dung lượng lớn với tốc độ đọc ghi cao cho game và workstation.'
  },
  {
    id: 'comp-9',
    brand: 'GIGABYTE',
    name: 'B650 AORUS Elite AX',
    category: 'component',
    subCategory: 'mainboard',
    specs: ['ATX · DDR5 · PCIe 5.0', 'Wi-Fi 6E · 14+2+1 phase'],
    price: 5790000,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Mainboard AM5 ổn định với Wi-Fi 6E, tản nhiệt VRM lớn và nhiều khe mở rộng.'
  },
  {
    id: 'comp-10',
    brand: 'KINGSTON',
    name: 'Fury Beast RGB 32GB',
    category: 'component',
    subCategory: 'ram',
    specs: ['DDR5 5600MHz · CL36', '2x16GB · XMP 3.0 / EXPO'],
    price: 2990000,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Kit RAM DDR5 RGB hiệu năng cao, tương thích tốt với hệ thống Intel và AMD.'
  },
  {
    id: 'comp-11',
    brand: 'CORSAIR',
    name: 'RM850e 850W',
    category: 'component',
    subCategory: 'psu',
    specs: ['850W · 80 Plus Gold · ATX 3.0', 'Modular · PCIe 5.0'],
    price: 3290000,
    image: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Nguồn máy tính chuẩn ATX 3.0, cấp điện ổn định cho card đồ họa thế hệ mới.'
  },
  {
    id: 'comp-12',
    brand: 'DEEPCOOL',
    name: 'AK620 Digital',
    category: 'component',
    subCategory: 'cooling',
    specs: ['Tản khí dual-tower · 6 heatpipe', 'TDP 260W · Màn hình nhiệt độ'],
    price: 1690000,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Tản nhiệt khí hiệu suất cao, vận hành êm và hiển thị nhiệt độ CPU trực quan.'
  },
  {
    id: 'acc-4',
    brand: 'LG',
    name: 'UltraGear 27GR83Q',
    category: 'accessory',
    subCategory: 'monitor',
    specs: ['27" QHD · IPS · 240Hz', '1ms · G-SYNC Compatible'],
    price: 10990000,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Màn hình gaming QHD 240Hz cho chuyển động mượt và phản hồi nhanh.'
  },
  {
    id: 'acc-5',
    brand: 'RAZER',
    name: 'BlackWidow V4',
    category: 'accessory',
    subCategory: 'keyboard',
    specs: ['Full-size · Green Switch · RGB', 'USB-C · Macro keys'],
    price: 3490000,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Bàn phím cơ gaming full-size với switch tactile và hệ thống đèn Chroma RGB.'
  },
  {
    id: 'acc-6',
    brand: 'LOGITECH',
    name: 'G Pro X Superlight 2',
    category: 'accessory',
    subCategory: 'mouse',
    specs: ['32.000 DPI · 60g · LIGHTSPEED', 'USB-C · HERO 2 sensor'],
    price: 2990000,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Chuột gaming siêu nhẹ với cảm biến HERO 2 chính xác và kết nối không dây ổn định.'
  },
  {
    id: 'acc-7',
    brand: 'SONY',
    name: 'WH-1000XM5',
    category: 'accessory',
    subCategory: 'headphone',
    specs: ['Chống ồn chủ động · Bluetooth 5.2', 'Pin 30 giờ · Hi-Res Audio'],
    price: 6990000,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Tai nghe không dây cao cấp với chống ồn chủ động và âm thanh chi tiết.'
  },
  {
    id: 'acc-8',
    brand: 'ANKER',
    name: 'PowerExpand 8-in-1',
    category: 'accessory',
    subCategory: 'hub',
    specs: ['USB-C · HDMI 4K · 100W PD', '2x USB-A · Ethernet · SD'],
    price: 1590000,
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Hub USB-C đa năng cho laptop với HDMI 4K, sạc nhanh và đầu đọc thẻ.'
  },
  {
    id: 'acc-9',
    brand: 'JBL',
    name: 'Charge 5',
    category: 'accessory',
    subCategory: 'speaker',
    specs: ['Bluetooth 5.1 · Công suất 40W', 'IP67 · Pin 20 giờ'],
    price: 3190000,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Loa Bluetooth di động chống nước với âm trầm mạnh và thời lượng pin dài.'
  },
  {
    id: 'acc-10',
    brand: 'TP-LINK',
    name: 'Archer AX73',
    category: 'accessory',
    subCategory: 'router',
    specs: ['Wi-Fi 6 AX5400 · 6 anten', 'OFDMA · WPA3 · 1Gbps'],
    price: 2490000,
    image: 'https://images.unsplash.com/photo-1647427060118-4911c9821b82?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Router Wi-Fi 6 phủ sóng rộng, phù hợp gia đình nhiều thiết bị và gaming online.'
  },
  {
    id: 'acc-11',
    brand: 'ELGATO',
    name: 'Facecam Neo',
    category: 'accessory',
    subCategory: 'webcam',
    specs: ['1080p 60fps · Auto Focus', 'USB-C · Privacy shutter'],
    price: 2490000,
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    description: 'Webcam Full HD cho học tập, họp trực tuyến và livestream với hình ảnh rõ nét.'
  }
];

export const USE_CASES = [
  {
    id: 'study-work',
    badge: '16GB RAM / SSD 512GB',
    title: 'Học tập & làm việc',
    description: 'Gọn nhẹ. Đủ mạnh. Đi cùng mỗi ngày.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
    tags: ['Sinh viên', 'Văn phòng', 'Kinh doanh']
  },
  {
    id: 'dev-multitask',
    badge: '8 NHÂN / 32GB RAM',
    title: 'Lập trình & đa nhiệm',
    description: 'Nhiều tác vụ. Một nhịp làm việc.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
    tags: ['Developer', 'Data Science', 'Docker / VM']
  },
  {
    id: 'gaming-creative',
    badge: 'RTX 4060 / 165Hz',
    title: 'Gaming & sáng tạo',
    description: 'Khung hình mượt. Ý tưởng liền mạch.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80',
    tags: ['Game AAA', 'Render 3D', 'Video 4K']
  }
];
