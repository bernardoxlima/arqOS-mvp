import { useState, useEffect, useCallback } from 'react';
import { ClientData, FloorPlanLayoutData, ComplementaryItemsData, ImageData } from '@/types/presentation';

const STORAGE_KEY = 'arqexpress_presentation_data';

export interface StoredPresentationData {
  projectName: string;
  projectPhase: string;
  clientData: ClientData;
  floorPlanLayout: FloorPlanLayoutData;
  complementaryItems: ComplementaryItemsData;
  images: Record<string, ImageData[]>;
  lastSaved: string;
}

const defaultClientData: ClientData = {
  clientName: "",
  projectCode: "",
  phone: "",
  address: "",
  cepBairro: "",
  cpf: "",
  architect: "",
  startDate: "",
};

const createDefaultStoredData = (): StoredPresentationData => ({
  projectName: "",
  projectPhase: "Entrega Final",
  clientData: { ...defaultClientData },
  floorPlanLayout: { originalImage: null, items: [] },
  complementaryItems: { items: [] },
  images: {
    photosBefore: [],
    moodboard: [],
    references: [],
    floorPlan: [],
    renders: [],
  },
  lastSaved: "",
});

const defaultStoredData: StoredPresentationData = createDefaultStoredData();

export const usePresentationStorage = () => {
  const [data, setData] = useState<StoredPresentationData>(defaultStoredData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredPresentationData;
        setData(parsed);
      }
    } catch (error) {
      console.error('Error loading presentation data:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  const saveData = useCallback((newData: Partial<StoredPresentationData>) => {
    setData(prev => {
      const updated = {
        ...prev,
        ...newData,
        lastSaved: new Date().toISOString(),
      };
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving presentation data:', error);
      }
      
      return updated;
    });
  }, []);

  const clearData = useCallback(() => {
    try {
      // Remove all presentation data from localStorage
      localStorage.removeItem(STORAGE_KEY);
      
      // Create a completely fresh state (deep copy)
      const freshData = createDefaultStoredData();
      setData(freshData);
      
      console.log('Project data cleared completely');
    } catch (error) {
      console.error('Error clearing presentation data:', error);
    }
  }, []);

  // Convenience setters
  const setProjectName = useCallback((projectName: string) => {
    saveData({ projectName });
  }, [saveData]);

  const setProjectPhase = useCallback((projectPhase: string) => {
    saveData({ projectPhase });
  }, [saveData]);

  const setClientData = useCallback((clientData: ClientData) => {
    saveData({ clientData });
  }, [saveData]);

  const setFloorPlanLayout = useCallback((floorPlanLayout: FloorPlanLayoutData) => {
    saveData({ floorPlanLayout });
  }, [saveData]);

  const setComplementaryItems = useCallback((complementaryItems: ComplementaryItemsData) => {
    saveData({ complementaryItems });
  }, [saveData]);

  // Salva layout e complementares de uma vez (para evitar race condition)
  const setFloorPlanAndComplementary = useCallback((
    floorPlanLayout: FloorPlanLayoutData, 
    complementaryItems: ComplementaryItemsData
  ) => {
    saveData({ floorPlanLayout, complementaryItems });
  }, [saveData]);

  const setImages = useCallback((images: Record<string, ImageData[]>) => {
    saveData({ images });
  }, [saveData]);

  const updateImages = useCallback((sectionId: string, sectionImages: ImageData[]) => {
    setData(prev => {
      const updated = {
        ...prev,
        images: {
          ...prev.images,
          [sectionId]: sectionImages,
        },
        lastSaved: new Date().toISOString(),
      };
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving presentation data:', error);
      }
      
      return updated;
    });
  }, []);

  return {
    data,
    isLoaded,
    saveData,
    clearData,
    setProjectName,
    setProjectPhase,
    setClientData,
    setFloorPlanLayout,
    setComplementaryItems,
    setFloorPlanAndComplementary,
    setImages,
    updateImages,
  };
};

// Export helper to get stored data directly (for navigation)
export const getStoredPresentationData = (): StoredPresentationData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as StoredPresentationData;
    }
  } catch (error) {
    console.error('Error getting stored presentation data:', error);
  }
  return null;
};
