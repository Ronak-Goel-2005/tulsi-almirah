export function matchesFilter(categories, filter) {
  return filter === 'all' || categories.split(' ').includes(filter);
}

export function buildEnquiry(model) {
  const subject = model || 'your steel almirahs';
  return `Hi! I’m interested in ${subject}. Could you share the available sizes, colours, prices and delivery options?`;
}

function showIntroOnce() {
  try {
    if (sessionStorage.getItem('tulsi-intro-seen')) return false;
    sessionStorage.setItem('tulsi-intro-seen', '1');
  } catch {
    // Keep the intro optional when browser storage is unavailable.
    return false;
  }
  return true;
}

function preparePhoto(image) {
  const figure = image.closest('figure');
  const fallback = figure.querySelector('.model-photo-error');
  const retry = fallback.querySelector('button');
  let source;

  function load(url) {
    image.hidden = false;
    fallback.hidden = true;
    image.src = url;
  }

  image.addEventListener('error', () => {
    image.hidden = true;
    fallback.hidden = false;
  });
  retry.addEventListener('click', () => {
    const url = new URL(source);
    url.searchParams.set('retry', Date.now());
    figure.querySelector('figcaption').focus({ preventScroll: true });
    load(url);
  });

  return (url, alt) => {
    source = url;
    image.alt = alt;
    if (image.src === url && image.complete && image.naturalWidth) return;
    // Remove a previous request so reopening the same failed photo starts fresh.
    image.removeAttribute('src');
    load(url);
  };
}

function enableCardPreview(product) {
  const button = product.querySelector('[data-preview-photo]');
  const stage = button.closest('.product-image');
  const front = stage.querySelector('img');
  const model = product.querySelector('h3').textContent;
  const interiorUrl = product.querySelector('[data-view-model]').href;
  let interior;

  button.addEventListener('click', async () => {
    if (button.getAttribute('aria-busy') === 'true') return;
    if (!interior) {
      const photo = new Image();
      photo.alt = `Tulsi ${model} almirah with doors open`;
      photo.className = 'product-interior';
      photo.setAttribute('aria-hidden', 'true');
      button.setAttribute('aria-busy', 'true');
      button.textContent = 'Loading…';
      try {
        photo.src = interiorUrl;
        await photo.decode();
      } catch {
        button.textContent = 'Retry inside view';
        return;
      } finally {
        button.removeAttribute('aria-busy');
      }
      interior = photo;
      front.after(photo);
      button.textContent = 'Inside view';
    }

    const showInterior = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(showInterior));
    front.setAttribute('aria-hidden', String(showInterior));
    interior.setAttribute('aria-hidden', String(!showInterior));
    stage.classList.toggle('show-interior', showInterior);
  });
  button.hidden = false;
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
  motionPreference.addEventListener('change', () => {
    if (!motionPreference.matches) finishIntro();
  });
  skipIntro.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') finishIntro();
  });
  if (motionPreference.matches && !location.hash && !new URLSearchParams(location.search).has('model') && showIntroOnce()) {
    document.body.classList.add('has-opening-intro');
    intro.hidden = false;
  }

  const filters = [...document.querySelectorAll('[data-filter]')];
  const products = [...document.querySelectorAll('[data-categories]')];
  const catalogue = document.querySelector('.catalogue');
  const filterStatus = document.querySelector('#filter-status');
  let filterAnimation;
  for (const filter of filters) {
    const count = document.createElement('span');
    count.className = 'filter-count';
    count.setAttribute('aria-hidden', 'true');
    count.textContent = products.filter((product) => matchesFilter(product.dataset.categories, filter.dataset.filter)).length;
    filter.append(count);
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
  document.querySelector('.filter-bar').hidden = false;
  products.forEach(enableCardPreview);

  const dialog = document.querySelector('#model-dialog');
  if (typeof dialog.showModal === 'function') {
    enableModelDetails(dialog, products);
  }
}

function enableModelDetails(dialog, products) {
  const modelTitle = dialog.querySelector('#model-title');
  const modelDescription = dialog.querySelector('#model-description');
  const showFront = preparePhoto(dialog.querySelector('#model-front'));
  const showInside = preparePhoto(dialog.querySelector('#model-inside'));
  const whatsappLink = dialog.querySelector('#ask-whatsapp');
  const whatsappUrl = new URL(whatsappLink.href);
  const models = new Map();
  let activeModel;

  for (const product of products) {
    const link = product.querySelector('[data-view-model]');
    models.set(product.id, { product, link, interior: link.href });
    const shareUrl = modelUrl(product.id);
    shareUrl.hash = product.id;
    link.href = shareUrl;
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      history.pushState({ catalogueModel: product.id }, '', modelUrl(product.id));
      syncModel();
    });
  }

  function modelUrl(id) {
    const url = new URL(location.href);
    url.searchParams.set('model', id);
    return url;
  }

  function syncModel() {
    const id = new URLSearchParams(location.search).get('model');
    const details = models.get(id);
    if (!details) {
      if (dialog.open) dialog.close();
      const link = models.get(activeModel)?.link;
      activeModel = undefined;
      if (link) {
        requestAnimationFrame(() => {
          if (!dialog.open && document.activeElement === document.body) link.focus();
        });
      }
      return;
    }
    const { product, interior } = details;
    const model = product.querySelector('h3').textContent;
    const thumbnail = product.querySelector('img');
    activeModel = id;
    modelTitle.textContent = model;
    modelDescription.textContent = product.querySelector('.product-description').textContent;
    showFront(thumbnail.src, thumbnail.alt);
    showInside(interior, `Tulsi ${model} almirah with doors open`);
    whatsappUrl.searchParams.set('text', buildEnquiry(`the Tulsi ${model} almirah`));
    whatsappLink.href = whatsappUrl.href;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    const url = new URL(location.href);
    if (document.activeElement === document.body || dialog.contains(document.activeElement)) {
      models.get(activeModel)?.link.focus();
    }
    if (url.searchParams.get('model') !== activeModel) return;
    if (history.state?.catalogueModel === activeModel) {
      history.back();
    } else {
      url.searchParams.delete('model');
      history.replaceState(history.state, '', url);
    }
  });
  window.addEventListener('popstate', syncModel);
  // On shared links, let the browser finish navigating to the card before the dialog takes focus.
  window.addEventListener('load', () => {
    if (!dialog.open) requestAnimationFrame(syncModel);
  }, { once: true });
}
