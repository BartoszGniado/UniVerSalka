const sharp = require('sharp');
const fs = require('fs');

console.log('Starting tile generation...');
const publicDir = '/app/tiles';
const filesInPublic = fs.readdirSync(publicDir);
console.log('Files in public: ', filesInPublic);
filesInPublic.forEach((file) => {
  if (file.endsWith('.jpg')) {
    const fileName = file.split('.')[0];
    const fileExtension = file.split('.')[1];
    const tileDir = '/app/tiles/new';
    if (!fs.existsSync(tileDir)) {
      fs.mkdirSync(tileDir);
    }
    const tilePath = tileDir + '/' + fileName;
    if (fs.existsSync(tilePath)) return;
    if (!fs.existsSync(tilePath)) {
      fs.mkdirSync(tilePath);
    }
    console.log('Generating tiles for ' + file);
    sharp(publicDir + '/' + file)
      .png()
      .ensureAlpha()
      .tile({
        layout: 'google',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      // .toFormat('png')
      .toFile(tilePath, (err, info) => {
        console.log(tilePath, err, info);
      });
  }
});
console.log('Finished tile generation.');
