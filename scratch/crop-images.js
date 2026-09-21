const sharp = require('sharp');
const path = require('path');

async function run() {
  const ref = 'docs/reference/ref-3-screens.png';
  const outDir = 'public/images';

  // 1. Hero worker (Phone 1 top photo)
  await sharp(ref)
    .extract({ left: 42, top: 38, width: 350, height: 420 })
    .resize(700, 840, { fit: 'cover' })
    .jpeg({ quality: 95 })
    .toFile(path.join(outDir, 'hero-worker.jpg'));

  // 2. Avatar Rahul (Phone 2 top left)
  await sharp(ref)
    .extract({ left: 476, top: 80, width: 46, height: 52 })
    .resize(120, 120, { fit: 'cover' })
    .jpeg({ quality: 95 })
    .toFile(path.join(outDir, 'avatar-rahul.jpg'));

  // 3. Pipeline Trench (Phone 2 project card - pure photo before white card)
  await sharp(ref)
    .extract({ left: 466, top: 405, width: 348, height: 68 })
    .resize(700, 272, { fit: 'cover' })
    .jpeg({ quality: 95 })
    .toFile(path.join(outDir, 'pipeline-trench.jpg'));

  // 4. Refinery Pipes (Phone 3 hero - pure photo before white card at 222)
  await sharp(ref)
    .extract({ left: 885, top: 122, width: 350, height: 98 })
    .resize(700, 320, { fit: 'cover' })
    .jpeg({ quality: 95 })
    .toFile(path.join(outDir, 'refinery-pipes.jpg'));

  // 5. Thumb Welding (Phone 2 Today's Events row 1)
  await sharp(ref)
    .extract({ left: 474, top: 733, width: 58, height: 46 })
    .resize(120, 120, { fit: 'cover' })
    .jpeg({ quality: 95 })
    .toFile(path.join(outDir, 'thumb-welding.jpg'));

  // 6. Thumb Trenching (Phone 2 Today's Events row 2)
  await sharp(ref)
    .extract({ left: 474, top: 806, width: 58, height: 42 })
    .resize(120, 120, { fit: 'cover' })
    .jpeg({ quality: 95 })
    .toFile(path.join(outDir, 'thumb-trenching.jpg'));

  console.log('Successfully cropped pure photo assets!');
}

run().catch(console.error);
