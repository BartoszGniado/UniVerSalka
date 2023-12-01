const fs = require('fs');
const config = require('../public/layers.json');
const filesInPublic = fs.readdirSync('./public');

for (const file of filesInPublic) {
  if (config.layers.map((c) => c.fileName).includes(file)) continue;
  console.log(file);
}
