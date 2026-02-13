const fs = require('fs');
const { createCanvas } = require('canvas');

const canvas = createCanvas(512, 512);
const ctx = canvas.getContext('2d');

// Create diagonal gradient (top-left to bottom-right)
const gradient = ctx.createLinearGradient(0, 0, 512, 512);
gradient.addColorStop(0, '#ff6b35'); // Red-orange
gradient.addColorStop(1, '#4ecdc4'); // Teal

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 512, 512);

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./react-app/src/assets/image.png', buffer);

console.log('✅ Gradient thumbnail created: react-app/src/assets/image.png');
