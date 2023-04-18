import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Projection from 'ol/proj/Projection.js';
import Static from 'ol/source/ImageStatic.js';
import ImageLayer from 'ol/layer/Image.js';
import { getCenter } from 'ol/extent.js';

const extent = [-4000 / 2, -2252 / 2, 4000 / 2, 2252 / 2];
const projection = new Projection({
  code: 'yep',
  units: 'pixels',
  extent: extent,
});

const map = new Map({
  target: 'map',
  layers: [
    // new TileLayer({
    //   source: new OSM(),
    // }),
    new ImageLayer({
      source: new Static({
        url: './IMG_20230226_110038.jpg',
        projection: projection,
        imageExtent: [-4000 / 2, -2252 / 2, 4000 / 2, 2252 / 2],
        wrapX: true,
      }),
    }),
    new ImageLayer({
      source: new Static({
        url: './IMG_20230225_191223.jpg',
        projection: projection,
        imageExtent: [-4000 / 2, 2252 / 2, 4000 / 2, 6252 / 2],
        wrapX: true,
      }),
    }),
    new ImageLayer({
      source: new Static({
        url: './IMG_20230226_110202.jpg',
        projection: projection,
        imageExtent: [4252 / 2, -4000 / 2, 8252 / 2, 4000 / 2],
        wrapX: true,
      }),
    }),
  ],
  view: new View({
    projection: projection,
    // center: getCenter(extent),
    center: [0, 0],
    zoom: 4,
    maxZoom: 8,
    minZoom: 1,
  }),
});

map.on('click', function (evt) {
  // Get the pointer coordinate
  console.log(evt.coordinate);
});
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
const saveFile = async (blob, name) => {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: name,
      types: [
        {
          accept: {
            // Omitted
          },
        },
      ],
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
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
    await saveFile(blob, blob.name);
  }
});
