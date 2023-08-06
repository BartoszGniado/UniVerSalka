import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Projection from 'ol/proj/Projection.js';
import Static from 'ol/source/ImageStatic.js';
import ImageLayer from 'ol/layer/Image.js';
import { getCenter } from 'ol/extent.js';
import XYZ from 'ol/source/XYZ.js';

const states = {
  idle: '¯_(ツ)_/¯',
  beforeDraw: '🚬',
  draw: '🚲',
};

let state;
let fileName;
let drawingExtent;
let config = {};
let coord = 0;
let workinLayer;
let fistPoint;

(async () => {
  const response = await fetch('./layers.json');
  config = await response.json();
  console.log(config);

  const extent = [-4000 / 2, -2252 / 2, 4000 / 2, 2252 / 2];
  const projection = new Projection({
    code: 'yep',
    units: 'pixels',
    extent: extent,
  });
  config.layers;
  const map = new Map({
    target: 'map',
    layers: config.layers.map((l) =>
      l.fileName === 'IMG_20230226_110038.jpg'
        ? new TileLayer({
            source: new XYZ({
              url: `./${l.fileName.split('.')[0]}/{z}/{y}/{x}.png`,
              projection: projection,
              maxZoom: l.maxZoom,
            }),
            extent: l.imageExtent,
          })
        : new ImageLayer({
            source: new Static({
              url: `./${l.fileName}`,
              projection: projection,
              imageExtent: l.imageExtent,
              wrapX: true,
            }),
          })
    ),
    view: new View({
      projection: projection,
      // center: [1041, 4386],
      // center: [2582.997897221219, 2403.636230850631],
      center: [0, 0],
      zoom: 4,
      maxZoom: 9,
      minZoom: 3,
    }),
  });
  window.map = map;
  map.on('pointermove', function (evt) {
    coord = evt.coordinate;
  });
  map.on('click', function (evt) {
    // Get the pointer coordinate
    console.log(evt.coordinate);
    if (state === states.draw) {
      state = states.idle;
      config.layers.push({
        fileName: `${fileName}`,
        imageExtent: workinLayer.getSource().imageExtent_,
      });
    }
    if (state === states.beforeDraw) {
      fistPoint = evt.coordinate;
      const ext = [...evt.coordinate, ...evt.coordinate];
      workinLayer = new ImageLayer({
        source: new Static({
          url: `./${fileName}`,
          projection: projection,
          imageExtent: ext,
          wrapX: true,
        }),
      });
      window.workinLayer = workinLayer;
      map.addLayer(workinLayer);
      state = states.draw;
    }
  });

  setInterval(() => {
    // drawing sketch
    if (state === states.draw) {
      map.removeLayer(workinLayer);
      const newExtent = [fistPoint[0], coord[1], coord[0], fistPoint[1]];

      workinLayer = new ImageLayer({
        source: new Static({
          url: `./${fileName}`,
          projection: projection,
          imageExtent: newExtent,
          wrapX: true,
        }),
      });
      map.addLayer(workinLayer);
      console.log(newExtent);
      map.changed();
    }
  }, 666);
})();

const openFile = async () => {
  try {
    // Always returns an array.
    const [handle] = await window.showOpenFilePicker();
    handle;
    return handle.getFile();
  } catch (err) {
    console.error(err.name, err.message);
  }
};

const saveFile = async (content, name) => {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: name,
    });
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    return handle;
  } catch (err) {
    console.error(err.name, err.message);
  }
};

document.addEventListener('keydown', async function (event) {
  if (event.key === 'o') {
    console.log('!!!');
    const blob = await openFile();
    console.log(blob.name);
    fileName = blob.name;
    state = states.beforeDraw;
  }
  if (event.key === 's') {
    const json = JSON.stringify(config, null, 2);
    await saveFile(json, 'layers.json');
  }
});
