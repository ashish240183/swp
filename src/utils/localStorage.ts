// LocalStorage utility functions for persisting SWP Calculator state

const STORAGE_KEY = 'swp-calculator-inputs';

export const saveInputsToStorage = (inputs: any): void => {
  try {
    const inputsToSave = {
      ...inputs,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputsToSave));
  } catch (error) {
    console.warn('Failed to save inputs to localStorage:', error);
  }
};

export const loadInputsFromStorage = (defaultInputs: any): any => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (!storedData) {
      return defaultInputs;
    }

    const parsedData = JSON.parse(storedData);
    
    // Check if stored data is recent (within 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (parsedData.timestamp && new Date(parsedData.timestamp) < thirtyDaysAgo) {
      // Data is too old, use default inputs
      return defaultInputs;
    }

    // Remove timestamp before returning
    const { timestamp, ...storedInputs } = parsedData;
    
    // Merge with default inputs to ensure all required fields exist
    return {
      ...defaultInputs,
      ...storedInputs
    };
  } catch (error) {
    console.warn('Failed to load inputs from localStorage:', error);
    return defaultInputs;
  }
};

export const clearStoredInputs = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear stored inputs:', error);
  }
};
