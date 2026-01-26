/**
 * Sistema de cola offline para sincronización de datos
 * Almacena requests fallidos y los reintenta cuando hay conexión
 */

export interface QueuedRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: number; // Mayor número = mayor prioridad
}

interface QueueConfig {
  storageKey: string;
  maxRetries: number;
  batchSize: number;
  retryDelay: number;
}

const DEFAULT_CONFIG: QueueConfig = {
  storageKey: 'offline_queue',
  maxRetries: 5,
  batchSize: 5,
  retryDelay: 1000
};

class OfflineQueue {
  private config: QueueConfig;
  private isProcessing: boolean = false;
  private listeners: Set<(queue: QueuedRequest[]) => void> = new Set();

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupNetworkListeners();
  }

  // Configurar listeners de red
  private setupNetworkListeners(): void {
    window.addEventListener('network-online', () => {
      this.processQueue();
    });
  }

  // Obtener la cola del localStorage
  getQueue(): QueuedRequest[] {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Guardar la cola en localStorage
  private saveQueue(queue: QueuedRequest[]): void {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(queue));
      this.notifyListeners(queue);
    } catch (error) {
      console.error('Error guardando cola offline:', error);
    }
  }

  // Generar ID único
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Agregar request a la cola
  addToQueue(
    method: QueuedRequest['method'],
    url: string,
    data?: any,
    priority: number = 1
  ): string {
    const queue = this.getQueue();

    // Evitar duplicados para el mismo recurso/método
    const isDuplicate = queue.some(
      item => item.url === url && item.method === method && JSON.stringify(item.data) === JSON.stringify(data)
    );

    if (isDuplicate) {
      return queue.find(
        item => item.url === url && item.method === method
      )!.id;
    }

    const newRequest: QueuedRequest = {
      id: this.generateId(),
      method,
      url,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      priority
    };

    // Ordenar por prioridad (mayor primero)
    queue.push(newRequest);
    queue.sort((a, b) => b.priority - a.priority);

    this.saveQueue(queue);
    return newRequest.id;
  }

  // Remover request de la cola
  removeFromQueue(id: string): void {
    const queue = this.getQueue().filter(item => item.id !== id);
    this.saveQueue(queue);
  }

  // Limpiar toda la cola
  clearQueue(): void {
    this.saveQueue([]);
  }

  // Obtener cantidad de items pendientes
  getPendingCount(): number {
    return this.getQueue().length;
  }

  // Procesar la cola
  async processQueue(): Promise<{ success: number; failed: number }> {
    if (this.isProcessing) {
      return { success: 0, failed: 0 };
    }

    this.isProcessing = true;
    let successCount = 0;
    let failedCount = 0;

    try {
      const queue = this.getQueue();

      if (queue.length === 0) {
        this.isProcessing = false;
        return { success: 0, failed: 0 };
      }

      // Procesar en lotes
      const batch = queue.slice(0, this.config.batchSize);

      for (const request of batch) {
        try {
          const response = await this.executeRequest(request);

          if (response.ok) {
            this.removeFromQueue(request.id);
            successCount++;
          } else {
            await this.handleFailedRequest(request);
            failedCount++;
          }
        } catch {
          await this.handleFailedRequest(request);
          failedCount++;
        }

        // Pequeño delay entre requests
        await this.delay(this.config.retryDelay);
      }

      // Si hay más items, continuar procesando
      const remainingQueue = this.getQueue();
      if (remainingQueue.length > 0 && successCount > 0) {
        // Esperar un poco antes de continuar
        await this.delay(this.config.retryDelay * 2);
        const moreResults = await this.processQueue();
        successCount += moreResults.success;
        failedCount += moreResults.failed;
      }
    } finally {
      this.isProcessing = false;
    }

    // Notificar resultado
    if (successCount > 0) {
      window.dispatchEvent(new CustomEvent('offline-sync-complete', {
        detail: { success: successCount, failed: failedCount }
      }));
    }

    return { success: successCount, failed: failedCount };
  }

  // Ejecutar un request
  private async executeRequest(request: QueuedRequest): Promise<Response> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method: request.method,
      headers,
      credentials: 'include'
    };

    if (request.data && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      options.body = JSON.stringify(request.data);
    }

    return fetch(request.url, options);
  }

  // Manejar request fallido
  private async handleFailedRequest(request: QueuedRequest): Promise<void> {
    const queue = this.getQueue();
    const index = queue.findIndex(item => item.id === request.id);

    if (index === -1) return;

    queue[index].retryCount++;

    if (queue[index].retryCount >= queue[index].maxRetries) {
      // Remover después de máximo de reintentos
      queue.splice(index, 1);
      window.dispatchEvent(new CustomEvent('offline-sync-failed', {
        detail: { request }
      }));
    }

    this.saveQueue(queue);
  }

  // Helper para delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Suscribirse a cambios en la cola
  subscribe(listener: (queue: QueuedRequest[]) => void): () => void {
    this.listeners.add(listener);
    // Notificar estado inicial
    listener(this.getQueue());
    // Retornar función para desuscribirse
    return () => this.listeners.delete(listener);
  }

  // Notificar a todos los listeners
  private notifyListeners(queue: QueuedRequest[]): void {
    this.listeners.forEach(listener => listener(queue));
  }
}

// Instancia singleton
export const offlineQueue = new OfflineQueue();

// Hook para usar en componentes
export const useOfflineQueue = () => {
  return offlineQueue;
};
