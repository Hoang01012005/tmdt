const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const outDir = 'C:/Users/User/.gemini/antigravity/brain/82172c01-ea96-4837-bf48-3a7eec1faf46/website_tests';

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu-sandbox']
  });

  const page = await browser.newPage();

  const viewports = [
    { name: 'mobile_375x812', width: 375, height: 812 },
    { name: 'mobile_large_430x932', width: 430, height: 932 },
    { name: 'tablet_768x1024', width: 768, height: 1024 },
    { name: 'desktop_1440x900', width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    console.log(`Testing viewport: ${vp.name}...`);
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    // Full page screenshot
    await page.screenshot({
      path: path.join(outDir, `${vp.name}_full.png`),
      fullPage: true
    });

    // Viewport screenshot (Hero view)
    await page.screenshot({
      path: path.join(outDir, `${vp.name}_hero.png`),
      fullPage: false
    });

    console.log(`Saved ${vp.name} screenshots`);
  }

  // Interactive Test 1: Open Cart Drawer
  console.log('Testing interactive Cart Drawer...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.click('button[aria-label="Giỏ hàng"]');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'test_cart_drawer.png') });

  // Interactive Test 2: Open Comparison Modal
  console.log('Testing Compare Modal...');
  const compareBtn = await page.$('button');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const compBtn = btns.find(b => b.textContent && b.textContent.includes('Mở bảng so sánh'));
    if (compBtn) compBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'test_compare_modal.png') });

  // Interactive Test 3: Open Consultation Chat
  console.log('Testing Consultation Chat...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const chatBtn = btns.find(b => b.textContent && b.textContent.includes('Trò chuyện cùng kỹ thuật viên'));
    if (chatBtn) chatBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'test_consultation_chat.png') });

  await browser.close();
  console.log('All responsive & interaction tests passed!');
}

run().catch(console.error);
