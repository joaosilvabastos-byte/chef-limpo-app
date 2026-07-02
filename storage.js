import AsyncStorage from '@react-native-async-storage/async-storage';

// Memória cache para não precisarmos de 'await' em todo o lado
let memoryCache = {};

export const localStorage = {
  // Carrega tudo do telemóvel para a memória ao iniciar
  init: async () => {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    memoryCache = Object.fromEntries(items.map(([k, v]) => [k, JSON.parse(v)]));
  },

  getItem: (key) => memoryCache[key] || null,

  setItem: async (key, value) => {
    memoryCache[key] = value;
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  
  removeItem: async (key) => {
    delete memoryCache[key];
    await AsyncStorage.removeItem(key);
  }
};