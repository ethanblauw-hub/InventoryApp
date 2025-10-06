export type Item = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  category: string;
  locationId: string;
  imageId: string;
};

export type Bom = {
  id: string;
  name: string;
  type: 'Order BOM' | 'Design BOM';
  dateUploaded: string;
  items: { itemId: string; quantity: number }[];
};

export type Location = {
  id:string;
  name: string;
  items: string[]; // array of item IDs
};

export type Category = {
  id: string;
  name: string;
  description: string;
};

export const items: Item[] = [
  { id: 'item-1', name: 'Steel Beam 24ft', sku: 'STL-BM-24', quantity: 150, category: 'Structural Steel', locationId: 'loc-1', imageId: 'steel_beam' },
  { id: 'item-2', name: 'Anchor Bolt 3/4"', sku: 'ANC-BLT-75', quantity: 2500, category: 'Fasteners', locationId: 'loc-2', imageId: 'anchor_bolt' },
  { id: 'item-3', name: 'Gusset Plate Large', sku: 'GUS-PLT-LG', quantity: 400, category: 'Plates', locationId: 'loc-1', imageId: 'gusset_plate' },
  { id: 'item-4', name: 'Shear Stud 1/2"', sku: 'SHR-STD-50', quantity: 10000, category: 'Fasteners', locationId: 'loc-2', imageId: 'shear_stud' },
  { id: 'item-5', name: 'Decking Panel 12x4', sku: 'DECK-PNL-12-4', quantity: 200, category: 'Decking', locationId: 'loc-3', imageId: 'decking_panel' },
];

export const boms: Bom[] = [
  { id: 'bom-1', name: 'Job 1234 - Phase 1', type: 'Order BOM', dateUploaded: '2023-10-01', items: [{ itemId: 'item-1', quantity: 50 }, { itemId: 'item-2', quantity: 1000 }] },
  { id: 'bom-2', name: 'Job 1234 - Phase 1', type: 'Design BOM', dateUploaded: '2023-10-15', items: [{ itemId: 'item-1', quantity: 52 }, { itemId: 'item-2', quantity: 1050 }, { itemId: 'item-3', quantity: 100 }] },
  { id: 'bom-3', name: 'Job 5678 - Initial', type: 'Order BOM', dateUploaded: '2023-11-05', items: [{ itemId: 'item-4', quantity: 8000 }, { itemId: 'item-5', quantity: 150 }] },
];

export const locations: Location[] = [
    { id: 'loc-1', name: 'Aisle A, Shelf 1', items: ['item-1', 'item-3'] },
    { id: 'loc-2', name: 'Aisle B, Bin 4', items: ['item-2', 'item-4'] },
    { id: 'loc-3', name: 'Yard - Section 2', items: ['item-5'] },
    { id: 'loc-4', name: 'Receiving Dock', items: [] },
];

export const categories: Category[] = [
    { id: 'cat-1', name: 'Structural Steel', description: 'Beams, columns, and other structural elements.' },
    { id: 'cat-2', name: 'Fasteners', description: 'Bolts, nuts, screws, and studs.' },
    { id: 'cat-3', name: 'Plates', description: 'Gusset plates, base plates, etc.' },
    { id: 'cat-4', name: 'Decking', description: 'Metal decking panels.' },
];
