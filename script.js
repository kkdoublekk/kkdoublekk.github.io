// --- DOM HELPERS & COLOR PALETTE ---
const $ = (id) => document.getElementById(id);

const PALETTE = {
  a: '#5b3a99',
  b: '#b995f5',
  c: '#ff9fd0',
  d: '#ffe36e',
  e: '#7bd88f',
  f: '#fff',
  g: '#ff5fa8',
  k: '#2b1a4d',
  v: '#8a5fd6',
  w: '#6b44b0',
  p: '#f5e6c8',
  q: '#d9c49a'
};

// --- PIXEL ART MAPS ---
const PIXEL_MAPS = {
  flower: [
    '..c.c..',
    '.ccdcc.',
    '..cdc..',
    '.c.e.c.',
    '...e...',
    '..ee...',
    '...e...'
  ],
  heart: [
    '.gg.gg.',
    'ggggggg',
    'ggggggg',
    '.ggggg.',
    '..ggg..',
    '...g...'
  ],
  phone: [
    '.aaaaa.',
    '.afffa.',
    '.afffa.',
    '.afffa.',
    '.afffa.',
    '.aaaaa.',
    '.a.b.a.'
  ],
  book: [
    'kkkkkkkkkkkkkk',
    'kwwvvvvvvvvvvk',
    'kwwvdvvvvvvdvk',
    'kwwvvvvvvvvvvk',
    'kwwvvggvggvvvk',
    'kwwvgggggggvvk',
    'kwwvgggggggvvk',
    'kwwvvgggggvvvk',
    'kwwvvvgggvvvvk',
    'kwwvvvvgvvvvvk',
    'kwwvvvvvvvvvvk',
    'kwwvdvvvvvvdvk',
    'kwwvvvvvvvvvvk',
    'kppppppppppppk',
    'kqqqqqqqqqqqqk',
    'kkkkkkkkkkkkkk'
  ]
};

// Generates an SVG string for a given pixel art key
function pix(name, scale) {
  const map = PIXEL_MAPS[name];
  let rects = '';

  map.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (char !== '.') {
        rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${PALETTE[char]}"/>`;
      }
    });
  });

  const width = map[0].length;
  const height = map.length;

  return `<svg class="px" viewBox="0 0 ${width} ${height}" width="${width * scale}" height="${height * scale}">${rects}</svg>`;
}

// --- INITIALIZE PIXEL ART ELEMENTS ---
$('book').innerHTML = pix('book', 9);

document.querySelectorAll('.ic').forEach((el) => {
  el.innerHTML = pix(el.dataset.i, 3);
});

// Floating background flowers
for (let i = 0; i < 9; i++) {
  const flower = document.createElement('div');
  flower.className = 'fl';
  flower.style.left = `${i * 11 + Math.random() * 4}%`;
  flower.innerHTML = pix('flower', 4 + (i % 3) * 2);
  document.body.appendChild(flower);
}

// --- PAGE NAVIGATION ---
function show(pageId) {
  document.querySelectorAll('.pg').forEach((page) => {
    page.classList.toggle('on', page.id === pageId);
  });
  scrollTo(0, 0);
}

// --- PIN CODE LOCK SCREEN ---
let code = '';

// Create indicator dots
for (let i = 0; i < 4; i++) {
  $('dots').innerHTML += '<div class="dot"></div>';
}

// Create keypad buttons
const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

keypadKeys.forEach((key) => {
  const btn = document.createElement('button');
  if (key) {
    btn.textContent = key;
    btn.onclick = () => keyInput(key);
  } else {
    btn.style.visibility = 'hidden';
  }
  $('pad').appendChild(btn);
});

function keyInput(k) {
  if (k === '⌫') {
    code = code.slice(0, -1);
  } else if (code.length < 4) {
    code += k;
  }

  // Update dots UI
  [...$('dots').children].forEach((dot, idx) => {
    dot.classList.toggle('f', idx < code.length);
  });

  $('err').textContent = '';

  if (code.length === 4) {
    setTimeout(() => {
      if (code === '0409') {
        show('stats');
      } else {
        $('err').textContent = 'Riprova ♥';
        $('dots').classList.add('shake');
        setTimeout(() => $('dots').classList.remove('shake'), 400);

        code = '';
        [...$('dots').children].forEach((dot) => dot.classList.remove('f'));
      }
    }, 200);
  }
}

$('hint').onclick = () => {$('hint').textContent = 'indizio: IL giorno ♥';
};

// Physical keyboard listeners for PIN entry
document.addEventListener('keydown', (e) => {
  if ($('lock').classList.contains('on')) {
    if (/^\d$/.test(e.key)) keyInput(e.key);
    if (e.key === 'Backspace') keyInput('⌫');
  }
});

// --- COUNTDOWNS & TIMERS ---
const startDate = new Date(2026, 8, 4, 0, 0, 0);
const meetDate = new Date(2026, 9, 31, 0, 0, 0);

function parseTimeParts(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(totalSeconds / 86400),
    h: Math.floor((totalSeconds % 86400) / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60
  };
}

function formatTimeHTML(parts) {
  const fields = [
    ['giorni', parts.d],
    ['ore', parts.h],
    ['min', parts.m],
    ['sec', parts.s]
  ];

  return fields
    .map(([label, val]) => `<b>${String(val).padStart(2, '0')}</b><small>${label}</small>`)
    .join(' ');
}

function tick() {
  const now = new Date();
  $('since').innerHTML = formatTimeHTML(parseTimeParts(now - startDate));$('until').innerHTML = formatTimeHTML(parseTimeParts(meetDate - now));
}

tick();
setInterval(tick, 1000);

// Total calls time calculation
const totalSeconds = 2383 * 60 + 14;
const hours = Math.floor(totalSeconds / 3600);
const minutes = Math.floor((totalSeconds % 3600) / 60);
const seconds = totalSeconds % 60;

$('calls').innerHTML = `<b>${hours}</b> ore <b>${minutes}</b> min <b>${seconds}</b> sec`;

// Section navigation buttons
$('open').onclick = () => show('alb');$('back').onclick = () => show('stats');

// --- GEOGRAPHIC DISTANCE & MAP CANVAS ---
const GIJON = { lon: -5.6611, lat: 43.5322 };
const ROME = { lon: 12.4964, lat: 41.9028 };

const toRad = (deg) => (deg * Math.PI) / 180;

// Haversine distance calculation in kilometers
const distanceKm = Math.round(
  2 * 6371 * Math.asin(
    Math.sqrt(
      Math.sin(toRad(ROME.lat - GIJON.lat) / 2) ** 2 +
      Math.cos(toRad(GIJON.lat)) * Math.cos(toRad(ROME.lat)) * Math.sin(toRad(ROME.lon - GIJON.lon) / 2) ** 2
    )
  )
);

$('km').innerHTML = `${distanceKm.toLocaleString('it-IT')} km di distanza<small>ma più vicini che mai ♥</small>`;

// Map projection setup
const ctx = $('map').getContext('2d');
const MAP_WIDTH = 140;
const MAP_HEIGHT = 100;

const projectCoords = (lon, lat) => [
  ((lon + 12) / 38) * MAP_WIDTH,
  ((62 - lat) / 28) * MAP_HEIGHT
];

const landPolygons = [
  [
    [-9, 43], [-8, 37], [-5.5, 36], [-1, 37.5], [0, 39], [3, 42], [6, 43],
    [8, 44], [10, 44], [12.5, 42], [16, 38], [18, 40], [14, 42.5], [12.5, 44.5],
    [13.5, 45.5], [16, 43], [19, 41], [21, 38], [23, 36.5], [26, 40], [28, 41],
    [26, 45], [26, 55], [20, 55], [14, 54], [10, 55], [8, 54], [4, 52], [2, 51],
    [-2, 48.5], [-4.5, 48.5], [-1.5, 46], [-1.5, 43.5], [-9, 43.5]
  ],
  [[-5, 50], [1.5, 51], [1.5, 53], [-1, 55], [-2, 57.5], [-5, 58], [-6, 56], [-3, 54.5], [-5, 52]],
  [[-10, 52], [-6, 52], [-6, 55], [-10, 54]],
  [[5, 59], [11, 59], [12, 56], [18, 57], [19, 60], [18, 62], [5, 62]],
  [[8.5, 39], [9.5, 39], [9.5, 41], [8.5, 41]]
];

const posA = projectCoords(GIJON.lon, GIJON.lat);
const posB = projectCoords(ROME.lon, ROME.lat);
const posControl = [(posA[0] + posB[0]) / 2, Math.min(posA[1], posB[1]) - 32];

// Quadratic Bezier curve point interpolation
const getBezierPoint = (t) => [
  (1 - t) ** 2 * posA[0] + 2 * (1 - t) * t * posControl[0] + t ** 2 * posB[0],
  (1 - t) ** 2 * posA[1] + 2 * (1 - t) * t * posControl[1] + t ** 2 * posB[1]
];

function drawMap(progress) {
  // Clear map background
  ctx.fillStyle = '#d8f0ff';
  ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // Render landmasses
  landPolygons.forEach((polygon) => {
    ctx.beginPath();
    polygon.forEach((vertex, index) => {
      const [x, y] = projectCoords(vertex[0], vertex[1]);
      index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = '#cbb3f7';
    ctx.fill();
    ctx.strokeStyle = '#5b3a99';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Render dotted connection line
  ctx.fillStyle = '#ff5fa8';
  for (let i = 0; i <= 40; i += 2) {
    const [x, y] = getBezierPoint(i / 40);
    ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
  }

  // Render city pin markers
  [posA, posB].forEach((point) => {
    ctx.fillStyle = '#5b3a99';
    ctx.fillRect(Math.round(point[0]) - 2, Math.round(point[1]) - 2, 5, 5);
  });

  // Render moving heart along the arc
  const [hx, hy] = getBezierPoint(progress);
  const px = Math.round(hx);
  const py = Math.round(hy);

  ctx.fillStyle = '#ff5fa8';
  ctx.fillRect(px - 3, py - 4, 3, 2);
  ctx.fillRect(px + 1, py - 4, 3, 2);
  ctx.fillRect(px - 3, py - 2, 7, 2);
  ctx.fillRect(px - 1, py, 3, 2);
  ctx.fillRect(px, py + 2, 1, 1);

  // Render city labels
  ctx.fillStyle = '#3d2670';
  ctx.font = '7px monospace';
  ctx.fillText('Gijón', posA[0] - 8, posA[1] + 11);
  ctx.fillText('Roma', posB[0] - 8, posB[1] + 11);
}

// Animation loop
(function renderLoop(timestamp) {
  drawMap((timestamp / 4000) % 1);
  requestAnimationFrame(renderLoop);
})(0);

// --- PHOTO ALBUM INITIALIZATION ---
const PHOTOS = [
  { src: 'images/foto1.jpg', cap: 'il nostro inizio' },
  { src: 'images/foto2.jpg', cap: '4 settembre' },
  { src: 'images/foto3.jpg', cap: 'prima chiamata' },
  { src: 'images/foto4.jpg', cap: 'tu e io' },
  { src: 'images/foto5.jpg', cap: 'pixel love' },
  { src: 'images/foto6.jpg', cap: 'mi manchi' },
  { src: 'images/foto7.jpg', cap: '31 ottobre!' },
  { src: 'images/foto8.jpg', cap: 'a presto ♥' }
];

PHOTOS.forEach((photo) => {
  const polaroid = document.createElement('div');
  polaroid.className = 'pol';
  polaroid.innerHTML = `<div class="im">${pix('heart', 8)}</div><p>${photo.cap}</p>`;

  const imgContainer = polaroid.querySelector('.im');
  const imgLoader = new Image();

  imgLoader.onload = () => {
    imgContainer.innerHTML = '';
    imgContainer.style.backgroundImage = `url("${photo.src}")`;
  };
  imgLoader.src = photo.src;

  $('track').appendChild(polaroid);
});

// --- HORIZONTAL SCROLL / DRAG FUNCTIONALITY ---
const ropeContainer = $('rope');
let isMouseDown = false;
let startX = 0;
let scrollLeftPos = 0;

ropeContainer.onpointerdown = (e) => {
  isMouseDown = true;
  startX = e.clientX;
  scrollLeftPos = ropeContainer.scrollLeft;
  ropeContainer.style.cursor = 'grabbing';
};

addEventListener('pointerup', () => {
  isMouseDown = false;
  ropeContainer.style.cursor = 'grab';
});

addEventListener('pointermove', (e) => {
  if (isMouseDown) {
    ropeContainer.scrollLeft = scrollLeftPos - (e.clientX - startX);
  }
});
