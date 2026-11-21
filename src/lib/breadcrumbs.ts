export interface Breadcrumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: readonly Breadcrumb[], site: URL) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: new URL(path, site).href,
    })),
  };
}
