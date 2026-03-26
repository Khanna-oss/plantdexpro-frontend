const HISTORY_KEY = 'plant_hist_v1';

export const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch (error) {
    console.error('History read error:', error);
    return [];
  }
};

export const saveToHistory = (item) => {
  try {
    const history = getHistory();
    const updated = [item, ...history].filter((value, index, array) => (
      array.findIndex((entry) => entry.name === value.name) === index
    ));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated.slice(0, 10)));
  } catch (error) {
    console.error('History write error:', error);
  }
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};

export const identificationHistoryService = {
  getHistory,
  saveToHistory,
  clearHistory,
};
