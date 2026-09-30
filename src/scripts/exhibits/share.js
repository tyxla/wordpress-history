// Chapter 10 — the market-share chart's hover and keyboard layer.
// Every value it shows is also in the table beneath the chart.

export default function share(el) {
  const root = el.querySelector('.share');
  const plot = el.querySelector('.share-plot');
  const cross = el.querySelector('.share-cross');
  const tip = el.querySelector('.share-tip');
  const points = JSON.parse(root.dataset.points);
  let index = -1;

  function row(colour, value, text) {
    const p = document.createElement('p');
    const key = document.createElement('i');
    key.style.background = colour;
    const strong = document.createElement('b');
    strong.textContent = `${value.toFixed(1)}%`;
    p.append(key, strong, document.createTextNode(text));
    return p;
  }

  function show(i) {
    index = Math.max(0, Math.min(points.length - 1, i));
    const point = points[index];
    const styles = getComputedStyle(root);
    const head = document.createElement('p');
    head.textContent = point.label;
    tip.replaceChildren(
      head,
      row(styles.getPropertyValue('--c-cms'), point.cms, 'of sites with a known CMS'),
      row(styles.getPropertyValue('--c-all'), point.all, 'of all websites'),
    );
    cross.style.left = `${point.x}%`;
    cross.hidden = false;
    tip.hidden = false;
    // Keep the readout inside the plot: flip it to the left of the line past the middle.
    tip.style.left = point.x > 55 ? '' : `calc(${point.x}% + .8rem)`;
    tip.style.right = point.x > 55 ? `calc(${100 - point.x}% + .8rem)` : '';
  }

  function hide() {
    index = -1;
    cross.hidden = true;
    tip.hidden = true;
  }

  function nearest(clientX) {
    const rect = plot.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    let best = 0;
    points.forEach((p, i) => {
      if (Math.abs(p.x - x) < Math.abs(points[best].x - x)) best = i;
    });
    return best;
  }

  plot.addEventListener('pointermove', (event) => show(nearest(event.clientX)));
  plot.addEventListener('pointerdown', (event) => show(nearest(event.clientX)));
  plot.addEventListener('pointerleave', (event) => { if (event.pointerType === 'mouse') hide(); });

  // Keyboard: focus the chart, then step through the dates with the arrow keys.
  plot.tabIndex = 0;
  plot.setAttribute('aria-describedby', 'share-keys');
  const hint = document.createElement('p');
  hint.id = 'share-keys';
  hint.className = 'vh';
  hint.textContent = 'Use the left and right arrow keys to read the values for each date.';
  const live = document.createElement('p');
  live.className = 'vh';
  live.setAttribute('role', 'status');
  root.append(hint, live);

  plot.addEventListener('focus', () => { if (index < 0) show(points.length - 1); });
  plot.addEventListener('blur', hide);
  plot.addEventListener('keydown', (event) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (event.key === 'Escape') { hide(); return; }
    if (!step) return;
    event.preventDefault();
    show(index + step);
    const p = points[index];
    live.textContent = `${p.label}: ${p.all}% of all websites, ${p.cms}% of sites with a known CMS.`;
  });
}
