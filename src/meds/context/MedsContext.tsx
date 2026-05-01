import { createContext, useContext, useState, useEffect, type FC, type ReactNode } from 'react';
import type { MedicationProfile, MedInventoryBatch, MedsData } from '../lib/types';
import { getInitialMedsState, saveMedsState } from '../lib/medStorage';

interface MedsContextType {
  state: MedsData;
  addMedication: (med: MedicationProfile) => void;
  updateMedication: (med: MedicationProfile) => void;
  deleteMedication: (id: string) => void;
  addBatch: (batch: MedInventoryBatch) => void;
  deleteBatch: (id: string) => void;
  overwriteMedsState: (newState: MedsData) => void;
}

const MedsContext = createContext<MedsContextType | undefined>(undefined);

export const MedsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MedsData>({ medications: [], batches: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setState(getInitialMedsState());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveMedsState(state);
    }
  }, [state, isLoaded]);

  const addMedication = (med: MedicationProfile) => {
    setState(prev => ({
      ...prev,
      medications: [...prev.medications, med]
    }));
  };

  const updateMedication = (med: MedicationProfile) => {
    setState(prev => ({
      ...prev,
      medications: prev.medications.map(m => m.id === med.id ? med : m)
    }));
  };

  const deleteMedication = (id: string) => {
    setState(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== id),
      batches: prev.batches.filter(b => b.medicationId !== id)
    }));
  };

  const addBatch = (batch: MedInventoryBatch) => {
    setState(prev => ({
      ...prev,
      batches: [...prev.batches, batch]
    }));
  };

  const deleteBatch = (id: string) => {
    setState(prev => ({
      ...prev,
      batches: prev.batches.filter(b => b.id !== id)
    }));
  };

  const overwriteMedsState = (newState: MedsData) => {
    setState(newState);
  };

  return (
    <MedsContext.Provider value={{ 
      state, 
      addMedication, 
      updateMedication, 
      deleteMedication, 
      addBatch, 
      deleteBatch,
      overwriteMedsState
    }}>
      {children}
    </MedsContext.Provider>
  );
};

export const useMedsContext = () => {
  const context = useContext(MedsContext);
  if (!context) {
    throw new Error('useMedsContext must be used within a MedsProvider');
  }
  return context;
};
