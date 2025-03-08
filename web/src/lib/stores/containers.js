import { writable } from 'svelte/store';

export const containers = writable([]);

export const fetchContainers = async () => {
  try {
    // Backend API'nizden container verilerini çekin
    const response = await fetch('/api/containers');
    const data = await response.json();
    containers.set(data);
  } catch (error) {
    console.error('Error fetching containers:', error);
    throw error;
  }
};

// export const startContainer = async (id) => {
//   // Container başlatma API çağrısı
// };

// export const stopContainer = async (id) => {
//   // Container durdurma API çağrısı
// };

// export const restartContainer = async (id) => {
//   // Container yeniden başlatma API çağrısı
// };

// export const getLogs = async (id) => {
//   // Container loglarını getirme API çağrısı
// }; 