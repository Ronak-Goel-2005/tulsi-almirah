import { matchesFilter, productEnquiry } from '../lib/catalogue';

function preparePhoto(image: HTMLImageElement) {
  const figure = image.closest('figure')!;
  const caption = figure.querySelector('figcaption')!;
  const fallback = figure.querySelector<HTMLElement>('.model-photo-error')!;
  const retry = fallback.querySelector('button')!;
  let source: string | undefined;

  function load(url: string) {
    image.hidden = false;
    fallback.hidden = true;
    image.src = url;
  }

  image.addEventListener('error', () => {
    image.hidden = true;
    fallback.hidden = false;
  });
  retry.addEventListener('click', () => {
    if (!source) return;
    const url = new URL(source);
    url.searchParams.set('retry', String(Date.now()));
    caption.focus({ preventScroll: true });
    load(url.href);
  });

  return (url: string | undefined, alt: string, label: string) => {
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

function enableCardPreview(product: HTMLElement) {
  const button = product.querySelector<HTMLButtonElement>('[data-preview-photo]')!;
  const stage = button.closest('.product-image')!;
  const front = stage.querySelector('img')!;
  const model = product.querySelector('h3')!.textContent ?? '';
  const interiorUrl = product.dataset.interiorPhoto!;
  let interior: HTMLImageElement | undefined;

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

const intro = document.querySelector<HTMLButtonElement>('.site-intro')!;
const motionPreference = matchMedia('(prefers-reduced-motion: no-preference)');
const storefront = document.querySelectorAll<HTMLElement>('.skip, .site-header, main, .site-footer');
let introTimer: ReturnType<typeof setTimeout>;

function finishIntro() {
  if (intro.hidden) return;
  clearTimeout(introTimer);
  const restoreFocus = document.activeElement === intro;
  intro.hidden = true;
  document.body.classList.remove('has-opening-intro');
  storefront.forEach((element) => { element.inert = false; });
  if (restoreFocus) document.querySelector<HTMLElement>('#main')!.focus({ preventScroll: true });
  intro.dispatchEvent(new Event('introend'));
}

function fadeIntro() {
  if (intro.classList.contains('is-fading')) return;
  clearTimeout(introTimer);
  intro.classList.add('is-fading');
  introTimer = setTimeout(finishIntro, 600);
}

intro.addEventListener('click', fadeIntro);
intro.addEventListener('animationend', (event) => {
  if (event.target === intro) finishIntro();
});
motionPreference.addEventListener('change', () => {
  if (!motionPreference.matches) finishIntro();
});
document.addEventListener('keydown', (event) => {
  if (intro.hidden || event.key !== 'Escape') return;
  event.preventDefault();
  fadeIntro();
});
const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
const referrer = document.referrer ? new URL(document.referrer) : undefined;
const returningHome = navigation?.type === 'back_forward'
  || (navigation?.type === 'navigate' && referrer?.origin === location.origin);
const landingAtTop = !location.hash || location.hash === '#top';

if (motionPreference.matches && !returningHome && landingAtTop && !new URLSearchParams(location.search).has('model')) {
  const artwork = intro.querySelector<HTMLTemplateElement>('#intro-artwork')!;
  artwork.replaceWith(artwork.content);
  storefront.forEach((element) => { element.inert = true; });
  document.body.classList.add('has-opening-intro');
  intro.hidden = false;
  introTimer = setTimeout(fadeIntro, 2500);
}

const filterBar = document.querySelector<HTMLElement>('.filter-bar')!;
const styleFilters = filterBar.querySelectorAll<HTMLButtonElement>('[data-filter]');
const widthFilters = filterBar.querySelectorAll<HTMLButtonElement>('[data-width-filter]');
const catalogue = document.querySelector('#collection .catalogue')!;
const almirahs = catalogue.querySelectorAll<HTMLElement>('.product');
const filterStatus = document.querySelector('#filter-status')!;
const clearFilters = filterBar.querySelector<HTMLButtonElement>('.filter-clear')!;
const filterEmpty = document.querySelector<HTMLElement>('.filter-empty')!;
let selectedStyle = 'all';
let selectedWidth = 'all';
let filterAnimation: Animation | undefined;

function updateFilters() {
  const categoriesAtWidth: string[] = [];
  const widthsForStyle: (string | undefined)[] = [];
  let visible = 0;
  for (const product of almirahs) {
    const { categories = '', width } = product.dataset;
    const styleMatches = matchesFilter(categories, selectedStyle);
    const widthMatches = selectedWidth === 'all' || width === selectedWidth;
    if (widthMatches) categoriesAtWidth.push(categories);
    if (styleMatches) widthsForStyle.push(width);
    const hidden = !(styleMatches && widthMatches);
    if (product.hidden !== hidden) product.hidden = hidden;
    visible += Number(!hidden);
  }

  for (const button of styleFilters) {
    const style = button.dataset.filter!;
    button.setAttribute('aria-pressed', String(style === selectedStyle));
    button.querySelector('.filter-count')!.textContent = String(categoriesAtWidth.filter((categories) => matchesFilter(categories, style)).length);
  }
  for (const button of widthFilters) {
    const width = button.dataset.widthFilter!;
    button.setAttribute('aria-pressed', String(width === selectedWidth));
    const count = width === 'all' ? widthsForStyle.length : widthsForStyle.filter((value) => value === width).length;
    button.querySelector('.filter-count')!.textContent = String(count);
  }

  filterEmpty.hidden = visible > 0;
  clearFilters.hidden = selectedStyle === 'all' && selectedWidth === 'all';
  const status = `${visible} ${visible === 1 ? 'model' : 'models'}`;
  if (filterStatus.textContent !== status) {
    filterStatus.textContent = status;
    filterStatus.getAnimations().forEach((animation) => animation.cancel());
    if (motionPreference.matches) {
      filterStatus.animate(
        [{ opacity: .6, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 180, easing: 'ease-out' },
      );
    }
  }
  filterAnimation?.cancel();
  if (visible && motionPreference.matches) {
    filterAnimation = catalogue.animate(
      [{ opacity: 0.65, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  }
}

filterBar.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-filter], [data-width-filter]');
  if (!button || button.getAttribute('aria-pressed') === 'true') return;
  if (button.dataset.filter) selectedStyle = button.dataset.filter;
  else selectedWidth = button.dataset.widthFilter!;
  updateFilters();
});
clearFilters.addEventListener('click', () => {
  selectedStyle = 'all';
  selectedWidth = 'all';
  updateFilters();
  styleFilters[0].focus();
});

filterBar.hidden = false;
almirahs.forEach(enableCardPreview);

const dialog = document.querySelector<HTMLDialogElement>('#model-dialog')!;
if (typeof dialog.showModal === 'function') {
  enableModelDetails(dialog, document.querySelectorAll<HTMLElement>('.product'), intro);
}

function enableModelDetails(dialog: HTMLDialogElement, products: NodeListOf<HTMLElement>, intro: HTMLButtonElement) {
  const modelTitle = dialog.querySelector('#model-title')!;
  const modelDescription = dialog.querySelector('#model-description')!;
  const specs = dialog.querySelector<HTMLElement>('.model-specs')!;
  const modelSizeLabel = dialog.querySelector('#model-size-label')!;
  const modelSize = dialog.querySelector('#model-size')!;
  const modelCode = dialog.querySelector('#model-code')!;
  const catalogueEntry = dialog.querySelector<HTMLDetailsElement>('.model-catalogue-entry')!;
  const catalogueSummary = dialog.querySelector('#model-catalogue-summary')!;
  const catalogueNote = dialog.querySelector('#model-catalogue-note')!;
  const catalogueSizeNote = dialog.querySelector<HTMLElement>('#model-catalogue-size-note')!;
  const catalogueSize = dialog.querySelector('#model-catalogue-size')!;
  const gallery = dialog.querySelector<HTMLElement>('.model-photos')!;
  const showFront = preparePhoto(dialog.querySelector<HTMLImageElement>('#model-front')!);
  const showInside = preparePhoto(dialog.querySelector<HTMLImageElement>('#model-inside')!);
  const showAlternate = preparePhoto(dialog.querySelector<HTMLImageElement>('#model-alternate')!);
  const whatsappLink = dialog.querySelector<HTMLAnchorElement>('#ask-whatsapp')!;
  const modelPageLink = dialog.querySelector<HTMLAnchorElement>('#model-page-link')!;
  const models = new Map<string, { product: HTMLElement; link: HTMLAnchorElement }>();
  let activeModel: string | undefined;

  for (const product of products) {
    const link = product.querySelector<HTMLAnchorElement>('[data-view-model]')!;
    models.set(product.id, { product, link });
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      history.pushState({ catalogueModel: product.id }, '', modelUrl(product.id));
      syncModel();
    });
  }

  function modelUrl(id: string) {
    const url = new URL(location.href);
    url.searchParams.set('model', id);
    return url;
  }

  function syncModel() {
    if (!intro.hidden) return;
    const id = new URLSearchParams(location.search).get('model');
    const details = id ? models.get(id) : undefined;
    if (!id || !details) {
      if (dialog.open) dialog.close();
      const link = activeModel ? models.get(activeModel)?.link : undefined;
      activeModel = undefined;
      if (link) {
        requestAnimationFrame(() => {
          if (!dialog.open && document.activeElement === document.body) link.focus();
        });
      }
      return;
    }
    const { product, link } = details;
    const model = product.querySelector('.product-copy :is(h3, h4)')!.textContent ?? '';
    const thumbnail = product.querySelector('img')!;
    const notes = product.querySelector<HTMLTemplateElement>('template[data-catalogue-page]')!;
    const { catalogueCode: code, catalogueSize: printedSize, interiorPhoto: interior, alternatePhoto, alternateCaption } = product.dataset;
    const size = product.querySelector('.product-size')?.textContent;
    activeModel = id;
    modelTitle.textContent = model;
    modelDescription.textContent = product.querySelector('.product-description')!.textContent;
    specs.hidden = !size && !code;
    modelSize.parentElement!.hidden = !size;
    modelSizeLabel.textContent = interior ? 'Width × depth × height' : 'Dimensions in catalogue order';
    modelSize.textContent = size ?? '';
    modelCode.parentElement!.hidden = !code;
    modelCode.textContent = code ?? '';
    catalogueEntry.open = false;
    catalogueSummary.textContent = `Catalogue notes · page ${notes.dataset.cataloguePage}`;
    catalogueNote.textContent = notes.content.textContent?.trim() ?? '';
    catalogueSizeNote.hidden = !printedSize;
    catalogueSize.textContent = printedSize ?? '';

    showFront(thumbnail.src, thumbnail.alt, interior ? 'Front view' : 'Catalogue photo');
    showInside(interior, `Tulsi ${model} almirah, open view`, 'Inside view');
    showAlternate(alternatePhoto, `Tulsi ${model}: ${alternateCaption}`, alternateCaption ?? '');
    gallery.dataset.photoCount = String(1 + Number(Boolean(interior)) + Number(Boolean(alternatePhoto)));

    whatsappLink.href = productEnquiry(model, code, Boolean(interior));
    modelPageLink.href = link.href;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  dialog.addEventListener('close', () => {
    if (dialog.open || !activeModel) return;
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
    // Leave time for the browser to position a section fragment before moving focus.
    if (!intro.hidden || (location.hash && document.readyState !== 'complete')) return;
    requestAnimationFrame(() => {
      if (!dialog.open) syncModel();
    });
  }
  window.addEventListener('load', openLinkedModel, { once: true });
  intro.addEventListener('introend', openLinkedModel, { once: true });
  if (new URLSearchParams(location.search).has('model')) openLinkedModel();
}
