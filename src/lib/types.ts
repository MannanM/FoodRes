export type UnitType = 'g' | 'ml' | 'unit';

export interface PriceLog {
  id: string;
  upc: string;
  price: number;
  baseAmount: number;
  unitType?: UnitType;
  dateLogged: string;
}

export interface FoodType {
  id: string;
  name: string;
  tags: string[];
  weeklyConsumptionRate: number; // Stored in base unit per week
}

export interface Item {
  id: string;
  foodTypeId: string;
  name: string;
  baseAmount: number; // in g, ml, or units
  unitType: UnitType;
  quantity: number; // >= 1
  purchaseDate: string; // ISO string
  bestBeforeDate?: string | null;
  useByDate?: string | null;
  price?: number | null;
  batchNumber?: string | null;
  upc?: string | null;
  imageUrl?: string | null;
}

export interface LocalStorageState {
  foodTypes: FoodType[];
  items: Item[];
  priceLogs?: PriceLog[];
}
