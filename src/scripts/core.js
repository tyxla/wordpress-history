// Hello, World. — page behaviour.
// Everything here is an enhancement: the story is complete without it.

const root = document.documentElement;
const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
const wideQuery = matchMedia('(min-width: 60em)');

/* ── Motion preference ─────────────────────────────────────── */

const motionToggle = document.querySelector('.motion-toggle');

function motionIsReduced() {
  const chosen = root.dataset.motion;
  return chosen ? chosen === 'reduced' : reduceQuery.matches;
}

function paintMotionToggle() {
  if (!motionToggle) return;
  const on = !motionIsReduced();
  motionToggle.setAttribute('aria-checked', String(on));
  motionToggle.querySelector('.motion-state').textContent = on ? 'on' : 'off';
}

if (motionToggle) {
  motionToggle.hidden = false;
  paintMotionToggle();
  motionToggle.addEventListener('click', () => {
    const next = motionIsReduced() ? 'full' : 'reduced';
    root.dataset.motion = next;
    try { localStorage.setItem('hw-motion', next); } catch { /* private mode: the choice lasts for this visit */ }
    paintMotionToggle();
    document.dispatchEvent(new CustomEvent('hw:motion'));
    update();
  });
  reduceQuery.addEventListener('change', () => { paintMotionToggle(); update(); });
}

/* ── Chapter index ─────────────────────────────────────────── */

const index = document.querySelector('.index');
if (index) {
  const summary = index.querySelector('summary');
  index.addEventListener('click', (event) => {
    if (event.target.closest('a')) index.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && index.open) {
      index.open = false;
      summary.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (index.open && !index.contains(event.target)) index.open = false;
  });
}

/* ── Where am I? ───────────────────────────────────────────── */

const chapters = [...document.querySelectorAll('[data-chapter]')];
const whereLabel = document.querySelector('.whereami-label');
const whereTitle = document.querySelector('.whereami-title');
const indexNow = document.querySelector('.index-now');
const indexLinks = new Map([...document.querySelectorAll('.index-panel a')].map((a) => [a.hash.slice(1), a]));
const rulerLinks = new Map([...document.querySelectorAll('.ruler a')].map((a) => [a.dataset.for, a]));
let currentChapter = null;

function setChapter(section) {
  if (section === currentChapter) return;
  currentChapter = section;
  if (whereLabel) whereLabel.textContent = section.dataset.label || '';
  if (whereTitle) whereTitle.textContent = section.dataset.title || '';
  // On small screens the index button itself says where you are.
  if (indexNow) indexNow.textContent = (section.dataset.label || '').replace('Chapter ', 'Ch. ');
  for (const [id, link] of indexLinks) {
    if (id === section.id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
  for (const [id, link] of rulerLinks) link.classList.toggle('is-current', id === section.id);
}

/* ── Scroll-linked scenes ──────────────────────────────────── */

const progressScenes = [...document.querySelectorAll('[data-scene="progress"]')];
const stepScenes = [...document.querySelectorAll('[data-scene="steps"]')].map((scene) => ({
  scene,
  steps: [...scene.querySelectorAll('.step')],
}));

const clamp = (n) => Math.min(1, Math.max(0, n));

// State is always derived from the current scroll position, never from what
// happened before, so jumping, reversing or scrolling fast cannot break it.
function update() {
  ticking = false;
  const vh = window.innerHeight;
  const doc = root.scrollHeight - vh;
  root.style.setProperty('--progress', doc > 0 ? clamp(window.scrollY / doc).toFixed(4) : '0');

  let active = chapters[0];
  for (const section of chapters) {
    if (section.getBoundingClientRect().top <= vh * 0.42) active = section;
    else break;
  }
  if (active) setChapter(active);

  const still = motionIsReduced();
  for (const scene of progressScenes) {
    const rect = scene.getBoundingClientRect();
    const track = rect.height - vh;
    const p = still || !wideQuery.matches || track <= 0 ? 0 : clamp(-rect.top / track);
    scene.style.setProperty('--p', p.toFixed(4));
  }

  const line = vh * (wideQuery.matches ? 0.6 : 0.78);
  for (const { scene, steps } of stepScenes) {
    let step = 0;
    steps.forEach((el, i) => {
      if (el.getBoundingClientRect().top < line) step = i;
    });
    if (scene.dataset.step !== String(step)) scene.dataset.step = String(step);
    steps.forEach((el, i) => el.classList.toggle('is-active', i === step));
  }
}

let ticking = false;
function requestUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(update);
}
addEventListener('scroll', requestUpdate, { passive: true });
addEventListener('resize', requestUpdate);
update();

/* ── Diagrams that draw themselves when seen ───────────────── */

const reveals = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const seen = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      seen.unobserve(entry.target);
    }
  }, { threshold: 0.3 });
  reveals.forEach((el) => seen.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-in'));
}

/* ── The opening: someone is typing ────────────────────────── */

const typed = document.querySelector('.type[data-type]');
if (typed && !motionIsReduced() && window.scrollY < 40) {
  const text = typed.dataset.type;
  let i = 0;
  typed.textContent = '';
  const tick = () => {
    typed.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(tick, 70 + Math.random() * 60);
  };
  setTimeout(tick, 450);
}

/* ── Interactive exhibits, loaded only when they come near ─── */

const SCRIPTED = new Set(['shop', 'blocks', 'releases', 'publish', 'share']);
const exhibits = [...document.querySelectorAll('[data-exhibit]')].filter((el) => SCRIPTED.has(el.dataset.exhibit));

async function boot(el) {
  if (el.dataset.ready) return;
  el.dataset.ready = 'loading';
  try {
    const module = await import(`./exhibits/${el.dataset.exhibit}.js`);
    module.default(el, { motionIsReduced });
    el.dataset.ready = 'true';
  } catch (error) {
    el.dataset.ready = '';
    console.error(error);
  }
}

if ('IntersectionObserver' in window) {
  const near = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      near.unobserve(entry.target);
      boot(entry.target);
    }
  }, { rootMargin: '700px 0px' });
  exhibits.forEach((el) => near.observe(el));
} else {
  exhibits.forEach(boot);
}

/* ── For people who open the console ───────────────────────── */

console.log('%cHello, world.', 'font: 600 22px Georgia, serif; color: #1d3fc4');
console.log('An independent history of WordPress. View source in the chapter about blocks: its paragraphs are delimited the way WordPress stores them.');
