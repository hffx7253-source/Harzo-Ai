
import { HistoryItem } from "../types";

const STORAGE_KEY = 'harzo_history';

export const StorageService = {
  getHistory: (): HistoryItem[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveItem: (item: HistoryItem) => {
    const history = StorageService.getHistory();
    const newHistory = [item, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  },

  deleteItem: (id: string) => {
    const history = StorageService.getHistory();
    const newHistory = history.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
