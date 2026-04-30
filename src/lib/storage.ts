import type { LocalStorageState } from './types';

const STORAGE_KEY = 'foodres_state';

const getInitialState = (): LocalStorageState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
  }
  return { foodTypes: [], items: [], priceLogs: [] };
};

export const saveState = (state: LocalStorageState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const getState = (): LocalStorageState => {
  return getInitialState();
};

export const exportData = (): string => {
  return localStorage.getItem(STORAGE_KEY) || JSON.stringify({ foodTypes: [], items: [], priceLogs: [] });
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData) as LocalStorageState;
    if (Array.isArray(data.foodTypes) && Array.isArray(data.items)) {
      if (!data.priceLogs) data.priceLogs = [];
      saveState(data);
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

  // If quantity reaches 0, delete the item
  if (consumedItem.quantity <= 0) {
    newState.items = newState.items.filter(item => item.id !== consumedItem.id);
  } else {
    // Update the item in the array
    const index = newState.items.findIndex(item => item.id === consumedItem.id);
    if (index !== -1) {
      newState.items[index] = consumedItem;
    }
  }

  return newState;
};
