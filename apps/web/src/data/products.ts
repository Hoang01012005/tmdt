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
