import type { LocalStorageState } from './types';

const FOOD_STORAGE_KEY = 'foodres_state';
const MEDS_STORAGE_KEY = 'foodres_meds_state';

export const saveState = (state: LocalStorageState) => {
  localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(state));
};

export const getState = (): LocalStorageState => {
  const stored = localStorage.getItem(FOOD_STORAGE_KEY);
  return stored ? JSON.parse(stored) : { foodTypes: [], items: [], priceLogs: [] };
};

export const exportData = (): string => {
  const foodData = localStorage.getItem(FOOD_STORAGE_KEY);
  const medsData = localStorage.getItem(MEDS_STORAGE_KEY);
  
  const combined = {
    foodData: foodData ? JSON.parse(foodData) : { foodTypes: [], items: [], priceLogs: [] },
    medsData: medsData ? JSON.parse(medsData) : { medications: [], batches: [] }
  };
  
  return JSON.stringify(combined, null, 2);
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    if (data.foodData && data.medsData) {
      localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(data.foodData));
      localStorage.setItem(MEDS_STORAGE_KEY, JSON.stringify(data.medsData));
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

export const consumeItemLogic = (foodTypeId: string, state: LocalStorageState): LocalStorageState => {
  const newState = { 
    ...state,
    items: [...state.items] 
  };
  
  // Find all items for this food type
  const itemsOfFoodType = newState.items.filter(item => item.foodTypeId === foodTypeId && item.quantity > 0);
  
  if (itemsOfFoodType.length === 0) return state;

  // Sorting logic for deduction:
  // First check useByDate (soonest first). 
  // If null, check bestBeforeDate (soonest first). 
  // If null, check purchaseDate (oldest first).
  itemsOfFoodType.sort((a, b) => {
    if (a.useByDate && b.useByDate) {
      return new Date(a.useByDate).getTime() - new Date(b.useByDate).getTime();
    } else if (a.useByDate) return -1;
    else if (b.useByDate) return 1;

    if (a.bestBeforeDate && b.bestBeforeDate) {
      return new Date(a.bestBeforeDate).getTime() - new Date(b.bestBeforeDate).getTime();
    } else if (a.bestBeforeDate) return -1;
    else if (b.bestBeforeDate) return 1;

    return new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
  });

  const itemToConsume = itemsOfFoodType[0];
  
  // Clone the object before mutating
  const consumedItem = { ...itemToConsume, quantity: itemToConsume.quantity - 1 };

  // Update the item in the array (set quantity to 0 instead of deleting)
  const index = newState.items.findIndex(item => item.id === consumedItem.id);
  if (index !== -1) {
    newState.items[index] = consumedItem;
  }

  return newState;
};
