export function matchesFilter(categories, filter) {
  return filter === 'all' || categories.split(' ').includes(filter);
}

export function buildEnquiry(model) {
  const subject = model || 'your steel almirahs';
  return `Hi! I’m interested in ${subject}. Could you share the available sizes, colours, prices and delivery options?`;
}

if (typeof document !== 'undefined') {
  const intro = document.querySelector('.site-intro');
  const skipIntro = intro.querySelector('button');
  const motionPreference = matchMedia('(prefers-reduced-motion: no-preference)');

  function finishIntro() {
    const restoreFocus = document.activeElement === skipIntro;
    intro.hidden = true;
    if (restoreFocus) document.querySelector('#main').focus({ preventScroll: true });
  }

  skipIntro.addEventListener('click', () => {
    const [fade] = intro.getAnimations();
    if (fade) {
      // Advance past the hold while keeping any fade already in progress.
      fade.currentTime = Math.max(fade.currentTime ?? 0, fade.effect.getTiming().delay);
    } else {
      finishIntro();
    }
  });
  skipIntro.addEventListener('focusout', (event) => {
    if (event.relatedTarget) intro.hidden = true;
  });
  intro.addEventListener('animationend', (event) => {
    if (event.target === intro) finishIntro();
  });
  if (motionPreference.matches) intro.hidden = false;

  const filters = [...document.querySelectorAll('[data-filter]')];
  const products = [...document.querySelectorAll('[data-categories]')];
  const catalogue = document.querySelector('.catalogue');
  const filterStatus = document.querySelector('#filter-status');
  let filterAnimation;
  const dialog = document.querySelector('#model-dialog');
  const modelTitle = document.querySelector('#model-title');
  const modelDescription = document.querySelector('#model-description');
  const frontImage = document.querySelector('#model-front');
  const insideImage = document.querySelector('#model-inside');
  const whatsappLink = document.querySelector('#ask-whatsapp');
  const whatsappUrl = new URL(whatsappLink.href);

  for (const filter of filters) {
    filter.addEventListener('click', () => {
      if (filter.getAttribute('aria-pressed') === 'true') return;

      for (const button of filters) {
        button.setAttribute('aria-pressed', String(button === filter));
      }
      let visible = 0;
      for (const product of products) {
        product.hidden = !matchesFilter(product.dataset.categories, filter.dataset.filter);
        visible += Number(!product.hidden);
      }
      filterStatus.textContent = `${visible} ${visible === 1 ? 'model' : 'models'}`;

      filterAnimation?.cancel();
      if (motionPreference.matches) {
        filterAnimation = catalogue.animate(
          [{ opacity: 0.65, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        );
      }
    });
  }

  for (const product of products) {
    product.querySelector('[data-view-model]').addEventListener('click', () => {
      const model = product.querySelector('h3').textContent;
      const thumbnail = product.querySelector('img');
      modelTitle.textContent = model;
      modelDescription.textContent = product.querySelector('.product-description').textContent;
      frontImage.src = thumbnail.src;
      frontImage.alt = thumbnail.alt;
      insideImage.src = `assets/${product.id}-inside.webp`;
      insideImage.alt = `Tulsi ${model} almirah with doors open`;
      whatsappUrl.searchParams.set('text', buildEnquiry(`the Tulsi ${model} almirah`));
      whatsappLink.href = whatsappUrl.href;
      dialog.showModal();
    });
  }
}
