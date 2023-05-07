import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Projection from 'ol/proj/Projection.js';
import Static from 'ol/source/ImageStatic.js';
import ImageLayer from 'ol/layer/Image.js';
import { getCenter } from 'ol/extent.js';

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

  const map = new Map({
    target: 'map',
    layers: config.layers.map(
      (l) =>
        new ImageLayer({
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
      // center: getCenter(extent),
      center: [0, 0],
      zoom: 4,
      maxZoom: 8,
      minZoom: 1,
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
        fileName: `./${fileName}`,
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
