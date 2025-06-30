export function matchesFilter(categories, filter) {
  return filter === 'all' || categories.split(' ').includes(filter);
}

export function buildEnquiry(model) {
  const subject = model || 'your steel almirahs';
  return `Hi! I’m interested in ${subject}. Could you share the available sizes, colours, prices and delivery options?`;
}

if (typeof document !== 'undefined') {
  const filters = [...document.querySelectorAll('[data-filter]')];
  const products = [...document.querySelectorAll('[data-categories]')];
  const filterStatus = document.querySelector('#filter-status');
  const dialog = document.querySelector('#model-dialog');
  const modelTitle = document.querySelector('#model-title');
  const modelDescription = document.querySelector('#model-description');
  const frontImage = document.querySelector('#model-front');
  const insideImage = document.querySelector('#model-inside');
  const whatsappLink = document.querySelector('#ask-whatsapp');
  const whatsappUrl = new URL(whatsappLink.href);

  for (const filter of filters) {
    filter.addEventListener('click', () => {
      for (const button of filters) {
        button.setAttribute('aria-pressed', String(button === filter));
      }
      let visible = 0;
      for (const product of products) {
        product.hidden = !matchesFilter(product.dataset.categories, filter.dataset.filter);
        visible += Number(!product.hidden);
      }
      filterStatus.textContent = `${visible} ${visible === 1 ? 'model' : 'models'}`;
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
