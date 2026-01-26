/**
 * Script para generar iconos PWA
 * Ejecutar: node scripts/generate-icons.js
 *
 * Requiere: npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Si tienes sharp instalado, puedes descomentar esto:
// const sharp = require('sharp');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// SVG base para generar iconos
const svgTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#1e3a5f"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="#f97316" text-anchor="middle">JF</text>
</svg>`;

// Crear directorio si no existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Guardar SVG base
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgTemplate);

console.log('SVG base creado en public/icons/icon.svg');
console.log('');
console.log('Para generar los iconos PNG, tienes estas opciones:');
console.log('');
console.log('OPCION 1: Usar una herramienta online');
console.log('  - Ve a https://realfavicongenerator.net');
console.log('  - Sube el archivo icon.svg');
console.log('  - Descarga el paquete de iconos');
console.log('');
console.log('OPCION 2: Usar sharp (Node.js)');
console.log('  npm install sharp');
console.log('  Luego descomenta el codigo de sharp en este script');
console.log('');
console.log('OPCION 3: Usar ImageMagick');
console.log('  Los siguientes comandos generaran los iconos:');
sizes.forEach(size => {
  console.log(`  magick convert -background none -resize ${size}x${size} icon.svg icon-${size}x${size}.png`);
});

/*
// Descomentar si tienes sharp instalado:
async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(Buffer.from(svgTemplate))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generado: icon-${size}x${size}.png`);
  }
}

generateIcons().then(() => {
  console.log('Todos los iconos generados!');
}).catch(console.error);
*/
