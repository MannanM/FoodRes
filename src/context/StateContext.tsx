import { createContext, useContext, useState, useEffect, type FC, type ReactNode } from 'react';
import type { LocalStorageState, FoodType, Item, PriceLog } from '../lib/types';
import { getState, saveState, consumeItemLogic } from '../lib/storage';

interface StateContextType {
  state: LocalStorageState;
  addFoodType: (foodType: FoodType) => void;
  updateFoodType: (foodType: FoodType) => void;
  deleteFoodType: (id: string) => void;
  addItem: (item: Item) => void;
  updateItem: (item: Item) => void;
  deleteItem: (id: string) => void;
  consumeItem: (foodTypeId: string) => void;
  addPriceLog: (log: PriceLog) => void;
  cleanStorage: () => void;
  overwriteState: (newState: LocalStorageState) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LocalStorageState>({ foodTypes: [], items: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = getState();
    if (!loaded.priceLogs) loaded.priceLogs = [];
    setState(loaded);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveState(state);
    }
  }, [state, isLoaded]);

  const addFoodType = (foodType: FoodType) => {
    setState(prev => ({ ...prev, foodTypes: [...prev.foodTypes, foodType] }));
  };

  const updateFoodType = (foodType: FoodType) => {
    setState(prev => ({
      ...prev,
      foodTypes: prev.foodTypes.map(ft => ft.id === foodType.id ? foodType : ft)
    }));
  };

  const deleteFoodType = (id: string) => {
    setState(prev => ({
      ...prev,
      foodTypes: prev.foodTypes.filter(ft => ft.id !== id),
      items: prev.items.filter(item => item.foodTypeId !== id) // Cascade delete
    }));
  };

  const addItem = (item: Item) => {
    setState(prev => ({ ...prev, items: [...prev.items, item] }));
  };

  const updateItem = (item: Item) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === item.id ? item : i)
    }));
  };

  const deleteItem = (id: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id)
    }));
  };

  const consumeItem = (foodTypeId: string) => {
    setState(prev => consumeItemLogic(foodTypeId, prev));
  };

  const addPriceLog = (log: PriceLog) => {
    setState(prev => ({
      ...prev,
      priceLogs: [...(prev.priceLogs || []), log]
    }));
  };

  const cleanStorage = () => {
    setState(prev => {
      const itemsWithQuantity = prev.items.filter(item => item.quantity > 0);
      const activeFoodTypeIds = new Set(itemsWithQuantity.map(item => item.foodTypeId));
      const activeFoodTypes = prev.foodTypes.filter(ft => activeFoodTypeIds.has(ft.id));

      const activeUpcs = new Set(itemsWithQuantity.map(i => i.upc).filter(Boolean));
      const activeNames = new Set(itemsWithQuantity.map(i => i.name));

      const activePriceLogs = (prev.priceLogs || []).filter(log =>
        (log.upc && activeUpcs.has(log.upc!)) || (log.name && activeNames.has(log.name))
      );

      return {
        ...prev,
        items: itemsWithQuantity,
        foodTypes: activeFoodTypes,
        priceLogs: activePriceLogs
      };
    });
  };

  const overwriteState = (newState: LocalStorageState) => {
    setState(newState);
  };

  return (
    <StateContext.Provider value={{
      state, addFoodType, updateFoodType, deleteFoodType,
      addItem, updateItem, deleteItem, consumeItem, addPriceLog, cleanStorage, overwriteState
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  return context;
};
