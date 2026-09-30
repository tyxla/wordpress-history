// Chapter 5 — a drawing of a shop. Nothing is sold; a basket is counted.

export default function shop(el) {
  const basket = el.querySelector('.basket');
  const count = el.querySelector('.basket-count');
  const unit = el.querySelector('.basket-unit');
  const buttons = [...el.querySelectorAll('.shop-add')];

  const paint = () => {
    const n = buttons.filter((b) => b.getAttribute('aria-pressed') === 'true').length;
    count.textContent = String(n);
    unit.textContent = n === 1 ? 'item' : 'items';
    basket.classList.toggle('has-items', n > 0);
  };

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const on = button.getAttribute('aria-pressed') === 'true';
      button.setAttribute('aria-pressed', String(!on));
      paint();
    });
  }
  paint();
}
