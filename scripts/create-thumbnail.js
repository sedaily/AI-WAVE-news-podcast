const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// 프로젝트 루트 기준 경로
const projectRoot = path.join(__dirname, '..');
const outputPath = path.join(projectRoot, 'frontend/src/assets/image.png');

const canvas = createCanvas(512, 512);
const ctx = canvas.getContext('2d');

// Create diagonal gradient (top-left to bottom-right)
const gradient = ctx.createLinearGradient(0, 0, 512, 512);
gradient.addColorStop(0, '#ff6b35'); // Red-orange
gradient.addColorStop(1, '#4ecdc4'); // Teal

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 512, 512);

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outputPath, buffer);

console.log('✅ Gradient thumbnail created:', outputPath);
