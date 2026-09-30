// Ending — "What would you publish?"
// The sentence is placed into the illustration on this page and goes nowhere
// else: nothing is sent, stored or remembered.

export default function publish(el, { motionIsReduced }) {
  const form = document.querySelector('[data-publish]');
  if (!form) return;
  const input = form.querySelector('input');
  const status = form.querySelector('.publish-status');
  const post = el.querySelector('.post--yours');
  const text = el.querySelector('.yours-text');

  form.hidden = false;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const sentence = input.value.trim().replace(/\s+/g, ' ');
    if (!sentence) {
      status.textContent = 'Type a sentence first — anything you like.';
      input.focus();
      return;
    }
    text.textContent = sentence;
    post.hidden = false;
    post.classList.remove('is-new');
    void post.offsetWidth;
    post.classList.add('is-new');
    status.textContent = 'Published — on this page, in your browser, and nowhere else. Reload and it is gone.';
    post.scrollIntoView({ block: 'center', behavior: motionIsReduced() ? 'auto' : 'smooth' });
  });
}
