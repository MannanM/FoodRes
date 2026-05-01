import type { MedicationProfile, MedInventoryBatch, MedsData } from './types';
import { differenceInDays, addDays } from 'date-fns';

const MEDS_STORAGE_KEY = 'foodres_meds_state';

export const getInitialMedsState = (): MedsData => {
  const stored = localStorage.getItem(MEDS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse meds localStorage data', e);
    }
  }
  return { medications: [], batches: [] };
};

export const saveMedsState = (state: MedsData) => {
  localStorage.setItem(MEDS_STORAGE_KEY, JSON.stringify(state));
};

export const calculateMedsMetrics = (med: MedicationProfile, batches: MedInventoryBatch[]) => {
  const dailyNeed = (med.scheduleDose.wakeup || 0) + 
                    (med.scheduleDose.morning || 0) + 
                    (med.scheduleDose.midday || 0) + 
                    (med.scheduleDose.afternoon || 0) + 
                    (med.scheduleDose.night || 0) + 
                    (med.scheduleDose.beforeBed || 0);
  
  const totalPool = batches
    .filter(b => b.medicationId === med.id)
    .reduce((sum, b) => sum + (b.quantity * b.sizePerQuantity), 0);
    
  const daysPassed = differenceInDays(new Date(), new Date(med.lastStockTakeDate));
  const consumedSinceStockTake = daysPassed * dailyNeed;
  
  const currentEstimatedInventory = Math.max(0, totalPool - consumedSinceStockTake);
  const daysRemaining = dailyNeed > 0 ? currentEstimatedInventory / dailyNeed : Infinity;
  const runOutDate = dailyNeed > 0 ? addDays(new Date(), daysRemaining) : null;
  
  return {
    dailyNeed,
    totalPool,
    currentEstimatedInventory,
    daysRemaining,
    runOutDate
  };
};
