import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@offline_queue';

export interface QueueItem {
  id: string;
  type: 'CREATE_REPORT' | 'UPDATE_REPORT' | 'DELETE_REPORT' | 'OTHER';
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineQueue {
  // Obtener toda la cola
  async getQueue(): Promise<QueueItem[]> {
    try {
      const queueString = await AsyncStorage.getItem(QUEUE_KEY);
      return queueString ? JSON.parse(queueString) : [];
    } catch (error) {
      console.error('Error getting queue:', error);
      return [];
    }
  }

  // Agregar item a la cola
  async addToQueue(item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const queue = await this.getQueue();
      const newItem: QueueItem = {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
      };
      queue.push(newItem);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      console.log('✅ Item agregado a la cola offline:', newItem.type);
    } catch (error) {
      console.error('Error adding to queue:', error);
      throw error;
    }
  }

  // Eliminar item de la cola
  async removeFromQueue(id: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const updatedQueue = queue.filter((item) => item.id !== id);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
      console.log('✅ Item eliminado de la cola:', id);
    } catch (error) {
      console.error('Error removing from queue:', error);
      throw error;
    }
  }

  // Incrementar contador de reintentos
  async incrementRetry(id: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const updatedQueue = queue.map((item) =>
        item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
      );
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Error incrementing retry:', error);
      throw error;
    }
  }

  // Limpiar toda la cola
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUEUE_KEY);
      console.log('✅ Cola offline limpiada');
    } catch (error) {
      console.error('Error clearing queue:', error);
      throw error;
    }
  }

  // Obtener cantidad de items pendientes
  async getQueueSize(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  // Obtener items pendientes por tipo
  async getItemsByType(type: QueueItem['type']): Promise<QueueItem[]> {
    const queue = await this.getQueue();
    return queue.filter((item) => item.type === type);
  }
}

export default new OfflineQueue();
