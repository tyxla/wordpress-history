// Chapter 7 — a post made of blocks that can be rearranged,
// with buttons (always) and by dragging (when that is comfortable).

export default function blocks(el) {
  const list = el.querySelector('.play-list');
  const code = el.querySelector('.play-code');
  const status = el.querySelector('.play-status');
  const reset = el.querySelector('.play-reset');
  const items = () => [...list.children];

  function serialise() {
    code.textContent = items()
      .map((item) => `<!-- wp:${item.dataset.type} -->\n${item.dataset.saved}\n<!-- /wp:${item.dataset.type} -->`)
      .join('\n\n');
  }

  function paint() {
    const all = items();
    all.forEach((item, i) => {
      const [up, down] = item.querySelectorAll('.play-move');
      up.disabled = i === 0;
      down.disabled = i === all.length - 1;
    });
    serialise();
  }

  function announce(item) {
    const all = items();
    status.textContent = `${item.dataset.name} is now block ${all.indexOf(item) + 1} of ${all.length}.`;
  }

  function flash(item) {
    item.classList.remove('is-moved');
    void item.offsetWidth; // restart the highlight
    item.classList.add('is-moved');
  }

  function move(item, direction, focusButton) {
    const all = items();
    const to = all.indexOf(item) + direction;
    if (to < 0 || to >= all.length) return;
    if (direction < 0) list.insertBefore(item, all[to]);
    else list.insertBefore(all[to], item);
    paint();
    flash(item);
    announce(item);
    // Keep the keyboard where it was; fall back to the other arrow at an edge.
    if (focusButton) {
      const target = focusButton.disabled ? item.querySelector('.play-move:not(:disabled)') : focusButton;
      target?.focus();
    }
  }

  list.addEventListener('click', (event) => {
    const button = event.target.closest('.play-move');
    if (!button) return;
    move(button.closest('.play-block'), Number(button.dataset.move), button);
  });

  reset.addEventListener('click', () => {
    items()
      .sort((a, b) => Number(a.dataset.id) - Number(b.dataset.id))
      .forEach((item) => list.appendChild(item));
    paint();
    status.textContent = 'Back to the original order.';
  });

  /* Dragging. The dragged block never leaves the document (its neighbours are
     moved around it), so it keeps the pointer for the whole gesture. */
  let drag = null;

  list.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;
    const item = event.target.closest('.play-block');
    if (!item) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    // Touch scrolls the page unless it starts on the grip.
    if (event.pointerType !== 'mouse' && !event.target.closest('.play-grip')) return;
    drag = { item, id: event.pointerId, startY: event.clientY, active: false, changed: false };
  });

  list.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const { item } = drag;
    if (!drag.active) {
      if (Math.abs(event.clientY - drag.startY) < 6) return;
      drag.active = true;
      item.classList.add('is-dragging');
      item.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    item.style.transform = `translateY(${event.clientY - drag.startY}px)`;

    const rect = item.getBoundingClientRect();
    const middle = rect.top + rect.height / 2;
    const next = item.nextElementSibling;
    const previous = item.previousElementSibling;
    const before = item.offsetTop;
    if (next && middle > next.getBoundingClientRect().top + next.offsetHeight / 2) {
      list.insertBefore(next, item);
    } else if (previous && middle < previous.getBoundingClientRect().top + previous.offsetHeight / 2) {
      list.insertBefore(previous, item.nextElementSibling);
    } else {
      return;
    }
    drag.changed = true;
    drag.startY += item.offsetTop - before;
    item.style.transform = `translateY(${event.clientY - drag.startY}px)`;
  });

  function drop(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const { item, active, changed } = drag;
    drag = null;
    if (!active) return;
    item.classList.remove('is-dragging');
    item.style.transform = '';
    paint();
    if (changed) {
      flash(item);
      announce(item);
    }
  }
  list.addEventListener('pointerup', drop);
  list.addEventListener('pointercancel', drop);

  paint();
}
