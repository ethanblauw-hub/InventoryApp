

/**
 * Represents a single item in the inventory.
 * @property {string} id - Unique identifier for the inventory item.
 * @property {string} name - Name of the item.
 * @property {string} sku - Stock Keeping Unit or part number.
 * @property {number} quantity - Current quantity of the item in inventory.
 * @property {string} locationId - The ID of the shelf location where the item is stored.
 * @property {string} imageId - An ID for a placeholder image.
 */
export type Item = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  locationId: string;
  imageId: string;
};

/**
 * Represents a Bill of Materials (BOM), which is a list of parts for a particular job.
 * @property {string} id - Unique identifier for the BOM.
 * @property {string} jobNumber - The number of the associated job.
 * @property {string} jobName - The name of the associated job.
 * @property {string} projectManager - The name of the project manager.
 * @property {string} primaryFieldLeader - The name of the field leader.
 * @property {string} workCategoryId - The ID of the associated work category.
 * @property {string} type - The type of BOM ('order' or 'design').
 * @property {BomItem[]} items - An array of items included in this BOM.
 */
export type Bom = {
  id: string;
  jobNumber: string;
  jobName: string;
  projectManager: string;
  primaryFieldLeader: string;
  workCategoryId: string;
  type: 'order' | 'design';
  items: BomItem[];
};

/**
 * Represents a single line item within a Bill of Materials.
 * @property {string} id - Unique identifier for the BOM item.
 * @property {string} description - The description or part number of the item.
 * @property {number} orderBomQuantity - The quantity specified in the Order BOM (estimate).
 * @property {number} designBomQuantity - The quantity specified in the Design BOM (actual).
 * @property {number} onHandQuantity - The current quantity available in the shop.
 * @property {number} shippedQuantity - The quantity that has been shipped to the job site.
 * @property {string[]} shelfLocations - An array of shelf location names where the item is stored.
 * @property {string} lastUpdated - The date the item was last updated, in YYYY-MM-DD format.
 * @property {string} imageId - An ID for a placeholder image.
 */
export type BomItem = {
  id: string;
  description: string; // Part Number
  orderBomQuantity: number;
  designBomQuantity: number;
  onHandQuantity: number;
  shippedQuantity: number;
  shelfLocations: string[];
  lastUpdated: string;
  imageId: string;
};

/**
 * Represents a physical shelf location in the shop.
 * @property {string} id - Unique identifier for the shelf location.
 * @property {string} name - The code or name for the shelf location (e.g., 'A1', 'Shelf 2').
 * @property {string[]} items - An array of inventory item IDs stored at this location.
 */
export type Location = {
  id:string;
  name: string;
  items: string[]; // array of item IDs
};

/**
 * Represents a customizable work category for organizing BOMs by type of work (e.g., 'Lighting', 'Gear').
 * @property {string} id - Unique identifier for the category.
 * @property {string} name - The name of the work category.
 * @property {string} description - A brief description of the work category.
 */
export type Category = {
  id: string;
  name: string;
  description: string;
};

/**
 * Represents a physical container holding items for a job.
 */
export type Container = {
  id: string;
  jobNumber?: string;
  jobName?: string;
  workCategoryId?: string;
  containerType: string;
  shelfLocation?: string | null;
  receiptDate: string;
  items: {
    description: string;
    quantity: number;
  }[];
  notes?: string | null;
  imageUrl?: string | null;
};


// Mock data for inventory items.
export const items: Item[] = [
  { id: 'item-1', name: 'Steel Beam 24ft', sku: 'STL-BM-24', quantity: 150, locationId: 'loc-1', imageId: 'steel_beam' },
  { id: 'item-2', name: 'Anchor Bolt 3/4"', sku: 'ANC-BLT-75', quantity: 2500, locationId: 'loc-2', imageId: 'anchor_bolt' },
  { id: 'item-3', name: 'Gusset Plate Large', sku: 'GUS-PLT-LG', quantity: 400, locationId: 'loc-1', imageId: 'gusset_plate' },
  { id: 'item-4', name: 'Shear Stud 1/2"', sku: 'SHR-STD-50', quantity: 10000, locationId: 'loc-2', imageId: 'shear_stud' },
  { id: 'item-5', name: 'Decking Panel 12x4', sku: 'DECK-PNL-12-4', quantity: 200, locationId: 'loc-3', imageId: 'decking_panel' },
];

// Mock data for Bills of Materials.
export const boms: Bom[] = [
  { 
    id: 'bom-1', 
    jobNumber: 'J1234',
    jobName: 'Job 1234 - Phase 1', 
    projectManager: 'Alice Johnson',
    primaryFieldLeader: 'Bob Williams',
    workCategoryId: 'cat-1', // Lighting
    type: 'design',
    items: [
      { id: 'bom-item-1', description: 'LED Light Fixture 4ft', orderBomQuantity: 50, designBomQuantity: 52, onHandQuantity: 150, shippedQuantity: 40, shelfLocations: ['Aisle A, Shelf 1'], lastUpdated: '2023-10-20', imageId: 'steel_beam' },
      { id: 'bom-item-2', description: 'Conduit 3/4"', orderBomQuantity: 1000, designBomQuantity: 1050, onHandQuantity: 2500, shippedQuantity: 800, shelfLocations: ['Aisle B, Bin 4'], lastUpdated: '2023-10-22', imageId: 'anchor_bolt' },
      { id: 'bom-item-3', description: 'Junction Box', orderBomQuantity: 0, designBomQuantity: 100, onHandQuantity: 400, shippedQuantity: 50, shelfLocations: ['Aisle A, Shelf 1'], lastUpdated: '2023-10-21', imageId: 'gusset_plate' }
    ]
  },
  { 
    id: 'bom-2', 
    jobNumber: 'J5678',
    jobName: 'Job 5678 - Initial', 
    projectManager: 'Charlie Brown',
    primaryFieldLeader: 'Diana Prince',
    workCategoryId: 'cat-2', // Gear
    type: 'order',
    items: [
      { id: 'bom-item-4', description: 'Safety Harness', orderBomQuantity: 10, designBomQuantity: 10, onHandQuantity: 30, shippedQuantity: 0, shelfLocations: ['Safety Cabinet'], lastUpdated: '2023-11-05', imageId: 'shear_stud' },
      { id: 'bom-item-5', description: 'Hard Hat', orderBomQuantity: 10, designBomQuantity: 10, onHandQuantity: 50, shippedQuantity: 10, shelfLocations: ['Safety Cabinet'], lastUpdated: '2023-11-10', imageId: 'decking_panel' }
    ]
  },
];

// Mock data for shelf locations.
export const locations: Location[] = [
    { id: 'loc-1', name: 'Aisle A, Shelf 1', items: ['item-1', 'item-3'] },
    { id: 'loc-2', name: 'Aisle B, Bin 4', items: ['item-2', 'item-4'] },
    { id: 'loc-3', name: 'Yard - Section 2', items: ['item-5'] },
    { id: 'loc-4', name: 'Receiving Dock', items: [] },
    { id: 'loc-5', name: 'Safety Cabinet', items: [] },
];

// Mock data for work categories.
export const categories: Category[] = [
    { id: 'cat-1', name: 'Lighting', description: 'Work related to electrical lighting fixtures and installation.' },
    { id: 'cat-2', name: 'Gear', description: 'Tools, safety equipment, and other operational gear.' },
    { id: 'cat-3', name: 'Outdoor', description: 'Materials and equipment for outdoor or site work.' },
];
