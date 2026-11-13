// Works shown in the grid. `img` is the image for the grid, `full` an optional
// larger file for the lightbox; `w`/`h` are the image's pixel size (for its shape).
// Demo pieces: public-domain works from The Met's Open Access collection.
const met = (path, w, h) => ({
  img: `https://images.metmuseum.org/CRDImages/${path.replace('/', '/web-large/')}.jpg`,
  full: `https://images.metmuseum.org/CRDImages/${path.replace('/', '/original/')}.jpg`,
  w, h,
});

const works = [
  { title: 'Moonlight, Strandgade 30', artist: 'Vilhelm Hammershøi', year: '1900–06', medium: 'Oil on canvas', size: '41 × 51 cm', cat: 'painting', ...met('ep/DP273105', 600, 479) },
  { title: 'Vase of Flowers (Pink Background)', artist: 'Odilon Redon', year: 'c. 1906', medium: 'Oil on canvas', size: '73 × 54 cm', cat: 'painting', ...met('ep/DT2159', 465, 624) },
  { title: 'Embroidery; The Artist’s Mother', artist: 'Georges Seurat', year: '1882–83', medium: 'Conté crayon', size: '31 × 24 cm', cat: 'drawing', ...met('dp/DP808124', 483, 624) },
  { title: 'Water Lilies', artist: 'Helena de Kay', year: 'c. 1870–77', medium: 'Oil on canvas', size: '25 × 38 cm', cat: 'painting', ...met('ad/DP-31861-001', 600, 393) },
  { title: 'Wild Geese Flying under the Full Moon', artist: 'Utagawa Hiroshige', year: 'c. 1833', medium: 'Woodblock print', size: '38 × 12.5 cm', cat: 'print', ...met('as/DP121523', 216, 622) },
  { title: 'Haystacks, Morning, Eragny', artist: 'Camille Pissarro', year: '1899', medium: 'Oil on canvas', size: '64 × 80 cm', cat: 'painting', ...met('ep/DP-20613-001', 599, 479) },
  { title: 'Figure Reading at a Table at Night', artist: 'Vilhelm Hammershøi', year: 'c. 1891', medium: 'Black and red chalk', size: '25 × 19 cm', cat: 'drawing', ...met('dp/DP827280', 478, 624) },
  { title: 'Nocturne: The Thames at Battersea', artist: 'James McNeill Whistler', year: '1878', medium: 'Lithotint on chine', size: '17 × 26 cm', cat: 'print', ...met('dp/DP813769', 599, 400) },
  { title: 'Bouquet of Flowers', artist: 'Odilon Redon', year: 'c. 1900–05', medium: 'Pastel on paper', size: '80 × 64 cm', cat: 'drawing', ...met('ep/DT245117', 495, 625) },
  { title: 'Landscape with Houses', artist: 'Georges Seurat', year: '1881–82', medium: 'Conté crayon', size: '25 × 32 cm', cat: 'drawing', ...met('dp/1972.118.234', 600, 466) },
  { title: 'Self-Portrait at Spurveskjul', artist: 'Vilhelm Hammershøi', year: '1911', medium: 'Oil on canvas', size: '90 × 100 cm', cat: 'painting', ...met('ep/DP-19037-001', 599, 544) },
  { title: 'Nocturne: Palaces', artist: 'James McNeill Whistler', year: '1879–80', medium: 'Etching and drypoint', size: '29 × 20 cm', cat: 'print', ...met('dp/DP813628', 429, 624) },
];

const renderArt = (work, extra = '') =>
  `<img src="${work.img}" width="${work.w}" height="${work.h}" alt="${work.title}${work.artist ? `, ${work.artist}` : ''}" ${extra}>`;

/* ---------- Hero ---------- */

// Which works (by position in `works`) appear in the hero, left to right
const heroPicks = [0, 1, 2];

document.getElementById('hero-art').innerHTML = heroPicks.map((i, n) => `
  <figure class="hero-pic">
    <button data-index="${i}" aria-label="View ${works[i].title}">${renderArt(works[i])}</button>
    <figcaption>${String(n + 1).padStart(2, '0')} — ${works[i].title}</figcaption>
  </figure>`).join('');

/* ---------- Grid ---------- */

const grid = document.getElementById('grid');
const count = document.getElementById('count');

grid.innerHTML = works.map((work, i) => `
  <li class="item" data-cat="${work.cat}">
    <button class="art-btn" data-index="${i}" aria-label="View ${work.title}">
      <div class="frame">${renderArt(work, 'loading="lazy"')}</div>
      <div class="cap">
        <span class="cap-title">${work.title}${work.artist ? `<small>${work.artist}</small>` : ''}</span>
        <span class="cap-meta">${work.year}</span>
      </div>
    </button>
  </li>`).join('');

const items = [...grid.children];

// Fade works in as they scroll into view
const io = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }
}, { rootMargin: '0px 0px -8% 0px' });
items.forEach(item => io.observe(item));

/* ---------- Filters ---------- */

const chips = document.querySelectorAll('.chip');

function applyFilter(filter) {
  let shown = 0;
  items.forEach(item => {
    const match = filter === 'all' || item.dataset.cat === filter;
    item.hidden = !match;
    if (match) shown++;
  });
  chips.forEach(chip => chip.setAttribute('aria-selected', chip.dataset.filter === filter));
  count.textContent = String(shown).padStart(2, '0');
}

chips.forEach(chip => chip.addEventListener('click', () => applyFilter(chip.dataset.filter)));
applyFilter('all');

/* ---------- Lightbox ---------- */

const lightbox = document.getElementById('lightbox');
const lbArt = document.getElementById('lb-art');
const lbTitle = document.getElementById('lb-title');
const lbMeta = document.getElementById('lb-meta');
const lbIndex = document.getElementById('lb-index');
let current = 0;

// Only step through the works the current filter shows
const visibleIndexes = () =>
  items.filter(item => !item.hidden).map(item => Number(item.querySelector('.art-btn').dataset.index));

function show(index) {
  const work = works[index];
  const visible = visibleIndexes();
  current = index;
  lbArt.innerHTML = renderArt(work);
  lbTitle.textContent = work.title;
  lbMeta.textContent = [work.artist, work.medium, work.size, work.year].filter(Boolean).join(' · ');

  // Show the grid image at once, then swap in the large file when it has loaded
  if (work.full) {
    const full = new Image();
    full.onload = () => {
      const img = lbArt.querySelector('img');
      if (current === index && img) img.src = work.full;
    };
    full.src = work.full;
  }
  lbIndex.textContent = `${visible.indexOf(index) + 1} / ${visible.length}`;
}

function step(direction) {
  const visible = visibleIndexes();
  const pos = visible.indexOf(current);
  show(visible[(pos + direction + visible.length) % visible.length]);
}

grid.addEventListener('click', e => {
  const btn = e.target.closest('.art-btn');
  if (!btn) return;
  show(Number(btn.dataset.index));
  lightbox.showModal();
});

// Hero works open in the lightbox too, stepping through the full set
document.getElementById('hero-art').addEventListener('click', e => {
  const btn = e.target.closest('[data-index]');
  if (!btn) return;
  applyFilter('all');
  show(Number(btn.dataset.index));
  lightbox.showModal();
});

lightbox.addEventListener('click', e => {
  if (e.target.closest('[data-close]') || e.target === lightbox) lightbox.close();
  const stepBtn = e.target.closest('[data-step]');
  if (stepBtn) step(Number(stepBtn.dataset.step));
});

lightbox.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
});

/* ---------- Mood ---------- */

const moods = document.querySelectorAll('.mood');

function setMood(mood) {
  document.documentElement.dataset.mood = mood;
  moods.forEach(btn => btn.setAttribute('aria-checked', btn.dataset.mood === mood));
  try { localStorage.setItem('mood', mood); } catch (e) {}
}

moods.forEach(btn => btn.addEventListener('click', () => setMood(btn.dataset.mood)));
moods.forEach(btn => btn.setAttribute('aria-checked', btn.dataset.mood === document.documentElement.dataset.mood));
