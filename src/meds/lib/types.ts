export type MedBaseUnit = 'mg' | 'g' | 'ml' | 'unit/tablet';

export interface MedicationSchedule {
  morning: number;
  midday: number;
  night: number;
}

export interface MedicationProfile {
  id: string;
  name: string;
  baseUnit: MedBaseUnit;
  scheduleDose: MedicationSchedule;
  scriptRepeatsRemaining?: number;
  scriptExpiryDate?: string; // ISO date
  lastStockTakeDate: string; // ISO date
}

export interface MedInventoryBatch {
  id: string;
  medicationId: string;
  quantity: number;
  sizePerQuantity: number;
  dateAdded: string; // ISO date
  price?: number;
}

export interface MedsData {
  medications: MedicationProfile[];
  batches: MedInventoryBatch[];
}
