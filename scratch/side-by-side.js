const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function makeSideBySide() {
  const ref = 'docs/reference/ref-3-screens.png';
  const capturedDir = 'docs/reference/captured';
  const outDir = 'docs/reference/comparison';

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Extract phone screens from ref-3-screens.png (1280x853)
  // Phone 1 (Welcome): x: 38, y: 15, w: 360, h: 810
  // Phone 2 (Home): x: 460, y: 15, w: 360, h: 810
  // Phone 3 (Match Review): x: 880, y: 15, w: 360, h: 810

  const screens = [
    {
      name: 'screen1-A1-welcome',
      refBox: { left: 38, top: 15, width: 360, height: 810 },
      actualFile: path.join(capturedDir, 'actual-A1-welcome.png'),
    },
    {
      name: 'screen2-SU1-home',
      refBox: { left: 460, top: 15, width: 360, height: 810 },
      actualFile: path.join(capturedDir, 'actual-SU1-home.png'),
    },
    {
      name: 'screen3-PL3-match-review',
      refBox: { left: 880, top: 15, width: 360, height: 810 },
      actualFile: path.join(capturedDir, 'actual-PL3-match-review.png'),
    },
  ];

  for (const s of screens) {
    const targetH = 844;
    const targetW = 390;

    // Crop reference screen
    const refBuffer = await sharp(ref)
      .extract(s.refBox)
      .resize(targetW, targetH, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();

    // Actual screenshot resized to target
    const actualBuffer = await sharp(s.actualFile)
      .resize(targetW, targetH, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();

    // Combine side-by-side (780 x 844) with 20px middle divider = 800 x 844
    const compositeWidth = targetW * 2 + 20;
    await sharp({
      create: {
        width: compositeWidth,
        height: targetH,
        channels: 4,
        background: { r: 240, g: 242, b: 245, alpha: 1 },
      },
    })
      .composite([
        { input: refBuffer, top: 0, left: 0 },
        { input: actualBuffer, top: 0, left: targetW + 20 },
      ])
      .png()
      .toFile(path.join(outDir, `${s.name}-side-by-side.png`));

    console.log(`Created side-by-side comparison for ${s.name}`);
  }

  console.log('All side-by-side comparisons generated successfully!');
}

makeSideBySide().catch(console.error);
