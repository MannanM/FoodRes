export type MedBaseUnit = 'mg' | 'g' | 'ml' | 'unit/tablet';

export interface MedicationSchedule {
  wakeup?: number;
  morning?: number;
  midday?: number;
  afternoon?: number;
  night?: number;
  beforeBed?: number;
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
