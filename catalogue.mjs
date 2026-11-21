export function matchesFilter(categories, filter) {
  return filter === 'all' || categories.split(' ').includes(filter);
}

export function buildEnquiry(model) {
  const subject = model || 'your steel almirahs';
  return `Hi! I’m interested in ${subject}. Could you share the available sizes, colours, prices and delivery options?`;
}

function preparePhoto(image) {
  const figure = image.closest('figure');
  const caption = figure.querySelector('figcaption');
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
    caption.focus({ preventScroll: true });
    load(url);
  });

  return (url, alt, label) => {
    figure.hidden = !url;
    if (!url) return;
    source = new URL(url, document.baseURI).href;
    image.alt = alt;
    caption.textContent = label;
    if (image.src === source && image.complete && image.naturalWidth) return;
    // Remove a previous request so reopening the same failed photo starts fresh.
    image.removeAttribute('src');
    load(source);
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
      photo.alt = `Tulsi ${model} almirah, open view`;
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
  const motionPreference = matchMedia('(prefers-reduced-motion: no-preference)');

  function finishIntro() {
    if (intro.hidden) return;
    const restoreFocus = document.activeElement === intro;
    intro.hidden = true;
    document.body.classList.remove('has-opening-intro');
    if (restoreFocus) document.querySelector('#main').focus({ preventScroll: true });
    intro.dispatchEvent(new Event('introend'));
  }

  intro.addEventListener('click', finishIntro);
  intro.addEventListener('animationend', (event) => {
    if (event.target === intro) finishIntro();
  });
  motionPreference.addEventListener('change', () => {
    if (!motionPreference.matches) finishIntro();
  });
  document.addEventListener('keydown', (event) => {
    if (intro.hidden || event.key !== 'Escape') return;
    event.preventDefault();
    finishIntro();
  });
  intro.addEventListener('focusout', (event) => {
    if (event.relatedTarget) finishIntro();
  });
  if (motionPreference.matches) {
    document.body.classList.add('has-opening-intro');
    intro.hidden = false;
  }

  const filters = [...document.querySelectorAll('[data-filter]')];
  const catalogue = document.querySelector('#collection .catalogue');
  const almirahs = [...catalogue.querySelectorAll('.product')];
  const filterStatus = document.querySelector('#filter-status');
  let filterAnimation;
  for (const filter of filters) {
    const count = document.createElement('span');
    count.className = 'filter-count';
    count.setAttribute('aria-hidden', 'true');
    count.textContent = almirahs.filter((product) => matchesFilter(product.dataset.categories, filter.dataset.filter)).length;
    filter.append(count);
    filter.addEventListener('click', () => {
      if (filter.getAttribute('aria-pressed') === 'true') return;

      for (const button of filters) {
        button.setAttribute('aria-pressed', String(button === filter));
      }
      let visible = 0;
      for (const product of almirahs) {
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
  almirahs.forEach(enableCardPreview);

  const dialog = document.querySelector('#model-dialog');
  if (typeof dialog.showModal === 'function') {
    enableModelDetails(dialog, document.querySelectorAll('.product'), intro);
  }
}

function enableModelDetails(dialog, products, intro) {
  const modelTitle = dialog.querySelector('#model-title');
  const modelDescription = dialog.querySelector('#model-description');
  const specs = dialog.querySelector('.model-specs');
  const modelSizeLabel = dialog.querySelector('#model-size-label');
  const modelSize = dialog.querySelector('#model-size');
  const modelCode = dialog.querySelector('#model-code');
  const catalogueEntry = dialog.querySelector('.model-catalogue-entry');
  const catalogueSummary = dialog.querySelector('#model-catalogue-summary');
  const catalogueNote = dialog.querySelector('#model-catalogue-note');
  const catalogueSizeNote = dialog.querySelector('#model-catalogue-size-note');
  const catalogueSize = dialog.querySelector('#model-catalogue-size');
  const gallery = dialog.querySelector('.model-photos');
  const showFront = preparePhoto(dialog.querySelector('#model-front'));
  const showInside = preparePhoto(dialog.querySelector('#model-inside'));
  const showAlternate = preparePhoto(dialog.querySelector('#model-alternate'));
  const whatsappLink = dialog.querySelector('#ask-whatsapp');
  const whatsappUrl = new URL(whatsappLink.href);
  const models = new Map();
  let activeModel;

  for (const product of products) {
    const link = product.querySelector('[data-view-model]');
    const interior = product.querySelector('[data-preview-photo]') ? link.href : undefined;
    models.set(product.id, { product, link, interior });
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
    if (!intro.hidden) return;
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
    const model = product.querySelector('.product-copy :is(h3, h4)').textContent;
    const thumbnail = product.querySelector('img');
    const notes = product.querySelector('template[data-catalogue-page]');
    const { catalogueCode: code, catalogueSize: printedSize, alternatePhoto, alternateCaption } = product.dataset;
    const size = product.querySelector('.product-size')?.textContent;
    activeModel = id;
    modelTitle.textContent = model;
    modelDescription.textContent = product.querySelector('.product-description').textContent;
    specs.hidden = !size && !code;
    modelSize.parentElement.hidden = !size;
    modelSizeLabel.textContent = interior ? 'Width × depth × height' : 'Dimensions in catalogue order';
    modelSize.textContent = size ?? '';
    modelCode.parentElement.hidden = !code;
    modelCode.textContent = code ?? '';
    catalogueEntry.open = false;
    catalogueSummary.textContent = `Catalogue notes · page ${notes.dataset.cataloguePage}`;
    catalogueNote.textContent = notes.content.textContent.trim();
    catalogueSizeNote.hidden = !printedSize;
    catalogueSize.textContent = printedSize ?? '';

    showFront(thumbnail.src, thumbnail.alt, interior ? 'Front view' : 'Catalogue photo');
    showInside(interior, `Tulsi ${model} almirah, open view`, 'Inside view');
    showAlternate(alternatePhoto, `Tulsi ${model}: ${alternateCaption}`, alternateCaption);
    gallery.dataset.photoCount = 1 + Number(Boolean(interior)) + Number(Boolean(alternatePhoto));

    const subject = interior ? `${model} almirah` : model;
    const reference = code && !subject.endsWith(code) ? ` (catalogue code ${code})` : '';
    whatsappUrl.searchParams.set('text', buildEnquiry(`the Tulsi ${subject}${reference}`));
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

  function openLinkedModel() {
    // Finish the opening sequence and the browser's fragment navigation before moving focus.
    if (!intro.hidden || document.readyState !== 'complete') return;
    requestAnimationFrame(() => {
      if (!dialog.open) syncModel();
    });
  }
  window.addEventListener('load', openLinkedModel, { once: true });
  intro.addEventListener('introend', openLinkedModel, { once: true });
}
