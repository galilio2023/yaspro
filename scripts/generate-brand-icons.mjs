import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const YAS_O_RING_PATH =
  "M 326,349 L 88,448 L 92,453 L 118,472 L 135,482 L 166,496 L 184,502 L 216,509 L 231,511 L 260,510 L 264,498 L 270,486 L 276,469 L 282,457 L 293,428 L 306,399 Z M 372,273 L 367,283 L 349,329 L 331,370 L 313,416 L 273,511 L 288,510 L 311,506 L 327,502 L 362,489 L 378,480 L 380,480 L 405,464 L 424,449 L 439,434 L 431,417 L 425,400 L 408,359 L 402,347 Z M 0,272 L 5,309 L 11,332 L 22,361 L 31,379 L 46,403 L 65,427 L 77,436 L 84,434 L 89,431 L 237,371 L 203,356 L 98,313 L 79,304 L 55,295 L 36,286 L 2,272 Z M 350,187 L 376,248 L 392,289 L 398,301 L 421,359 L 427,371 L 446,419 L 449,424 L 466,402 L 478,383 L 488,364 L 497,342 L 503,323 L 509,294 L 511,278 L 511,253 L 449,228 L 420,215 L 374,197 L 357,189 Z M 64,87 L 54,98 L 36,124 L 21,153 L 15,168 L 8,190 L 4,207 L 0,237 L 1,258 L 161,325 L 126,238 L 120,226 L 119,221 L 102,182 L 69,99 L 64,89 Z M 239,1 L 222,2 L 195,7 L 174,13 L 151,22 L 133,31 L 109,46 L 86,64 L 74,76 L 74,79 L 140,238 Z M 186,162 L 300,116 L 317,108 L 405,72 L 422,66 L 425,64 L 404,47 L 382,33 L 369,26 L 343,15 L 324,9 L 303,4 L 270,0 L 253,1 Z";

const YAS_YELLOW_BLADE_PATH =
  "M 274,141 L 511,239 L 509,218 L 505,197 L 497,170 L 489,150 L 477,127 L 464,107 L 449,88 L 438,76 L 435,74 Z";

function createFaviconSvg({ scale = 0.985 } = {}) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <defs>
    <!-- Crisp Studio White Blade Gradient matching authentic media group logo -->
    <linearGradient id="fav-white" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="60%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>

    <!-- Official Brand Yellow Accent Blade (#FFE900) -->
    <linearGradient id="fav-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="25%" stop-color="#fff04d" />
      <stop offset="60%" stop-color="#ffe900" />
      <stop offset="100%" stop-color="#eab308" />
    </linearGradient>

    <!-- Studio Mauve & Violet Halo for Aperture Base -->
    <radialGradient id="fav-base" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e1038" />
      <stop offset="60%" stop-color="#0a0514" />
      <stop offset="100%" stop-color="#070709" />
    </radialGradient>
  </defs>

  <!-- Full-bleed Aperture Container (100% Transparent outside circular perimeter) -->
  <g transform="translate(256, 256) scale(${scale}) translate(-256, -256)">
    <!-- Outer Radiant Violet Accent Ring -->
    <circle cx="256" cy="256" r="253" fill="none" stroke="#765086" stroke-width="10" stroke-opacity="0.85" />
    
    <!-- Outer circular aperture base with Studio Mauve perimeter ring -->
    <circle cx="256" cy="256" r="252" fill="url(#fav-base)" stroke="#987ba5" stroke-width="6" />
    <circle cx="256" cy="256" r="248" fill="none" stroke="rgba(221, 211, 225, 0.6)" stroke-width="1.8" />

    <!-- 7 Crisp White Blades with dark seam dividers matching authentic logo -->
    <path
      d="${YAS_O_RING_PATH}"
      fill="url(#fav-white)"
      stroke="#070709"
      stroke-width="5"
      stroke-linejoin="round"
      fill-rule="evenodd"
    />

    <!-- Signature #FFE900 Yellow Blade -->
    <path
      d="${YAS_YELLOW_BLADE_PATH}"
      fill="url(#fav-yellow)"
      stroke="#070709"
      stroke-width="5"
      stroke-linejoin="round"
    />

    <!-- Center dark iris pupil matching ApertureO in Studio Mauve -->
    <circle cx="256" cy="256" r="112" fill="#070709" stroke="#987ba5" stroke-width="2.8" />
    <circle cx="256" cy="256" r="64" fill="rgba(152,123,165,0.3)" stroke="rgba(221, 211, 225, 0.45)" stroke-width="1.5" />
  </g>
</svg>
`;
}

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const header = Buffer.alloc(headerSize);

  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(count, 4); // number of images

  for (let i = 0; i < count; i++) {
    const { width, height, buffer } = pngBuffers[i];
    const entryOffset = 6 + i * 16;
    header.writeUInt8(width >= 256 ? 0 : width, entryOffset);
    header.writeUInt8(height >= 256 ? 0 : height, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2); // color count
    header.writeUInt8(0, entryOffset + 3); // reserved
    header.writeUInt16LE(1, entryOffset + 4); // planes
    header.writeUInt16LE(32, entryOffset + 6); // bit count
    header.writeUInt32LE(buffer.length, entryOffset + 8);
    header.writeUInt32LE(offset, entryOffset + 12);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...pngBuffers.map((p) => p.buffer)]);
}

async function main() {
  const root = process.cwd();
  console.log('Generating authentic brand aperture suite (crisp white blades + #FFE900 yellow blade)...');

  // 1. Vector SVG (100% transparent background outside perimeter)
  const fullBleedSvg = createFaviconSvg({ scale: 0.985 });
  fs.writeFileSync(path.join(root, 'public/favicon.svg'), fullBleedSvg.trim());
  console.log('✓ Written transparent public/favicon.svg');

  // Master render with transparent background
  const masterBuf = await sharp(Buffer.from(fullBleedSvg)).png().toBuffer();

  // 2. Favicons: 16x16 and 32x32 (transparent background)
  const png16 = await sharp(masterBuf).resize(16, 16).png().toBuffer();
  fs.writeFileSync(path.join(root, 'public/favicon-16x16.png'), png16);
  console.log('✓ Written transparent public/favicon-16x16.png');

  const png32 = await sharp(masterBuf).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(root, 'public/favicon-32x32.png'), png32);
  console.log('✓ Written transparent public/favicon-32x32.png');

  const png48 = await sharp(masterBuf).resize(48, 48).png().toBuffer();

  // Multi-size ICO (16x16, 32x32, 48x48) with transparent background
  const icoBuf = createIco([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ]);
  fs.writeFileSync(path.join(root, 'public/favicon.ico'), icoBuf);
  console.log('✓ Written transparent public/favicon.ico');

  // 3. PWA launcher icons: 192x192 and 512x512 (100% transparent background)
  const png192 = await sharp(masterBuf).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(root, 'public/icon-192.png'), png192);
  console.log('✓ Written transparent public/icon-192.png');

  const png512 = await sharp(masterBuf).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(root, 'public/icon-512.png'), png512);
  console.log('✓ Written transparent public/icon-512.png');

  // 4. Apple Touch Icon: 180x180 (100% transparent background)
  const png180 = await sharp(masterBuf).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(root, 'public/apple-touch-icon.png'), png180);
  console.log('✓ Written transparent public/apple-touch-icon.png');

  console.log('🎉 Full authentic [O] icon suite generated successfully!');
}

main().catch((err) => {
  console.error('Generation failed:', err);
  process.exit(1);
});
