import type { ProductCategory } from './products';

interface Collection {
  id: string;
  category: ProductCategory;
  name: string;
  label: string;
  hindiLabel: string;
  description: string;
  detail: string;
}

export const collections: readonly Collection[] = [
  {
    id: 'two-door-steel-almirahs',
    category: 'two-door',
    name: 'Two-door steel almirahs',
    label: 'Two-door almirahs',
    hindiLabel: 'दो दरवाज़ों वाली अलमारियाँ',
    description: 'Compare 36- and 42-inch two-door steel almirahs from Tulsi in Shamli, including Hero, King and mirrored models.',
    detail: 'Start with the 36-inch models if wall space is tight. Compare the Hero’s hanging bay and shelves with the King’s separate upper compartment, or choose the 42 Hero Mirror for a door mirror and exterior drawers.',
  },
  {
    id: 'three-door-steel-almirahs',
    category: 'three-door',
    name: 'Three-door steel almirahs',
    label: 'Three-door almirahs',
    hindiLabel: 'तीन दरवाज़ों वाली अलमारियाँ',
    description: 'Compare Tulsi’s 48-inch three-door steel almirahs in Shamli, with Hero and King interiors and optional mirrors.',
    detail: 'The 48 Hero pairs a hanging bay with side shelves. The 48 King adds a separately opening upper compartment. Both have mirrored versions with exterior drawers. Check the individual model heights before choosing a spot.',
  },
  {
    id: 'mirrored-steel-almirahs',
    category: 'mirror',
    name: 'Steel almirahs with mirrors',
    label: 'Mirrored almirahs',
    hindiLabel: 'शीशे वाली अलमारियाँ',
    description: 'Browse Tulsi’s mirrored steel almirahs and dressing cupboards in Shamli. Compare mirror positions, drawer layouts and model sizes.',
    detail: 'Choose a mirrored Hero or King for a wardrobe with exterior drawers. If you use the almirah as your main dressing area, compare the 42 Dressing and 48 Classic and check where the mirror and drawers sit in the photos.',
  },
  {
    id: 'steel-trunks-and-storage',
    category: 'storage',
    name: 'Steel trunks and storage furniture',
    label: 'Trunks and storage catalogue',
    hindiLabel: 'बक्सों और स्टोरेज का कैटलॉग',
    description: 'Browse Tulsi’s steel trunks, lockers, drawer units, display cabinets and shelving. Ask the showroom in Hind, Shamli for sizes and prices.',
    detail: 'Compare the two steel trunks for covered storage. For items you reach for regularly, look at the open shelving rack, drawer cabinet and lockers. The glass-front cabinet lets you see the contents while keeping them behind doors.',
  },
];

export function collectionPath(id: string): string {
  return `/collections/${id}/`;
}
