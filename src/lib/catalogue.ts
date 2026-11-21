export function matchesFilter(categories: string, filter: string): boolean {
  return filter === 'all' || categories.split(' ').includes(filter);
}

export function buildEnquiry(model?: string): string {
  const subject = model || 'your steel almirahs';
  return `Hi! I’m interested in ${subject}. Could you share the available sizes, colours, prices and delivery options?`;
}
