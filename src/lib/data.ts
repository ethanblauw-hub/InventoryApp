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
  jobNumber: string;
  jobName: string;
  projectManager: string;
  primaryFieldLeader: string;
  items: BomItem[];
};

export type BomItem = {
  id: string;
  category: string;
  description: string; // Part Number
  orderBomQuantity: number;
  designBomQuantity: number;
  onHandQuantity: number;
  shippedQuantity: number;
  shelfLocations: string[];
  lastUpdated: string;
  imageId: string;
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
  { 
    id: 'bom-1', 
    jobNumber: 'J1234',
    jobName: 'Job 1234 - Phase 1', 
    projectManager: 'Alice Johnson',
    primaryFieldLeader: 'Bob Williams',
    items: [
      { id: 'bom-item-1', category: 'Structural Steel', description: 'STL-BM-24', orderBomQuantity: 50, designBomQuantity: 52, onHandQuantity: 150, shippedQuantity: 40, shelfLocations: ['Aisle A, Shelf 1'], lastUpdated: '2023-10-20', imageId: 'steel_beam' },
      { id: 'bom-item-2', category: 'Fasteners', description: 'ANC-BLT-75', orderBomQuantity: 1000, designBomQuantity: 1050, onHandQuantity: 2500, shippedQuantity: 800, shelfLocations: ['Aisle B, Bin 4'], lastUpdated: '2023-10-22', imageId: 'anchor_bolt' },
      { id: 'bom-item-3', category: 'Plates', description: 'GUS-PLT-LG', orderBomQuantity: 0, designBomQuantity: 100, onHandQuantity: 400, shippedQuantity: 50, shelfLocations: ['Aisle A, Shelf 1'], lastUpdated: '2023-10-21', imageId: 'gusset_plate' }
    ]
  },
  { 
    id: 'bom-2', 
    jobNumber: 'J5678',
    jobName: 'Job 5678 - Initial', 
    projectManager: 'Charlie Brown',
    primaryFieldLeader: 'Diana Prince',
    items: [
      { id: 'bom-item-4', category: 'Fasteners', description: 'SHR-STD-50', orderBomQuantity: 8000, designBomQuantity: 8000, onHandQuantity: 10000, shippedQuantity: 0, shelfLocations: ['Aisle B, Bin 4'], lastUpdated: '2023-11-05', imageId: 'shear_stud' },
      { id: 'bom-item-5', category: 'Decking', description: 'DECK-PNL-12-4', orderBomQuantity: 150, designBomQuantity: 150, onHandQuantity: 200, shippedQuantity: 100, shelfLocations: ['Yard - Section 2'], lastUpdated: '2023-11-10', imageId: 'decking_panel' }
    ]
  },
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
