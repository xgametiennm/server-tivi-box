// File: discover_cast_devices.js
// Mục tiêu: Quét và in ra danh sách thiết bị hỗ trợ Google Cast trong mạng LAN

// 👉 Dùng gói dnssd (thay vì mdns) để tránh lỗi build native
// Cài bằng: npm install dnssd

const dnssd = require('dnssd');

console.log('🔍 Đang dò thiết bị hỗ trợ Cast trong mạng LAN...');

const browser = dnssd.Browser(dnssd.tcp('googlecast'));

browser.on('serviceUp', service => {
  const ip = service.addresses.find(ip => ip.includes('.')) || 'Không xác định';

  console.log(`📺 Thiết bị: ${service.name}`);
  console.log(`   ↳ IP: ${ip}`);
  console.log(`   ↳ Model: ${service.txt.md}`);
  console.log(`   ↳ Friendly Name: ${service.txt.fn}`);
  console.log('');
});

browser.on('error', err => {
  console.error('❌ Lỗi dò thiết bị:', err.message);
});

browser.start();
