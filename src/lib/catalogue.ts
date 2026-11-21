import { showroom } from '../data/showroom.ts';

export function matchesFilter(categories: string, filter: string): boolean {
  return filter === 'all' || categories.split(' ').includes(filter);
}

export function buildEnquiry(model?: string): string {
  const subject = model || 'your steel almirahs';
  return `Hi! I’m interested in ${subject}. Could you share the available sizes, colours, prices and delivery options?`;
}

export function productPath(id: string): string {
  return `/products/${id}/`;
}

export function productEnquiry(model: string, catalogueCode: string | undefined, isAlmirah: boolean): string {
  const subject = isAlmirah ? `${model} almirah` : model;
  const reference = catalogueCode && !subject.endsWith(catalogueCode) ? ` (catalogue code ${catalogueCode})` : '';
  const url = new URL(showroom.whatsapp);
  url.searchParams.set('text', buildEnquiry(`the Tulsi ${subject}${reference}`));
  return url.href;
}
