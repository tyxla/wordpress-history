// Interlude — searching the release collection.

export default function releases(el) {
  const form = el.querySelector('.crate-search');
  const input = el.querySelector('#crate-q');
  const count = el.querySelector('.crate-count');
  const empty = el.querySelector('.crate-empty');
  const chips = [...el.querySelectorAll('.chip')];
  const records = [...el.querySelectorAll('.record')];
  let decade = '';

  function apply() {
    const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    // A small nod: nearly every one of these is named for a jazz musician.
    const everything = terms.length === 1 && terms[0] === 'jazz';
    let shown = 0;
    for (const record of records) {
      const matches = (everything || terms.every((t) => record.dataset.q.includes(t)))
        && (!decade || record.dataset.decade === decade);
      record.hidden = !matches;
      if (matches) shown += 1;
    }
    empty.hidden = shown > 0;
    if (everything) count.textContent = 'Jazz? That would be nearly all of them.';
    else if (terms.length || decade) count.textContent = `${shown} of ${records.length} records`;
    else count.textContent = '';
  }

  form.hidden = false;
  form.addEventListener('submit', (event) => event.preventDefault());
  input.addEventListener('input', apply);
  for (const chip of chips) {
    chip.addEventListener('click', () => {
      decade = decade === chip.dataset.decade ? '' : chip.dataset.decade;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.decade === decade)));
      apply();
    });
  }
}
