# 📡 Modo Offline - Guía Completa

## 📅 Fecha de implementación
Diciembre 15, 2025

## ✅ Implementación Completa

El **Modo Offline** ha sido completamente implementado permitiendo que los usuarios trabajen sin conexión y sincronicen automáticamente cuando recuperen la red.

---

## 🚀 **Características Implementadas**

### **1. Detección de Estado de Red**
- ✅ Monitoreo en tiempo real de conectividad
- ✅ Detección de tipo de conexión (WiFi, Celular, etc.)
- ✅ Verificación de internet accesible
- ✅ Context API para acceso global

### **2. Queue de Acciones Offline**
- ✅ Almacenamiento persistente en AsyncStorage
- ✅ Cola FIFO (First In, First Out)
- ✅ Soporte para múltiples tipos de acciones
- ✅ Sistema de reintentos automáticos
- ✅ Límite de reintentos (3 intentos)

### **3. Sincronización Automática**
- ✅ Sincronización al recuperar conexión
- ✅ Procesamiento secuencial de la cola
- ✅ Feedback visual del progreso
- ✅ Alertas de éxito/error
- ✅ Botón manual de sincronización

### **4. Indicador Visual**
- ✅ Banner en la parte superior
- ✅ Animación de slide down/up
- ✅ Iconos dinámicos (cloud-offline/cloud-upload)
- ✅ Contador de acciones pendientes
- ✅ Botón de sincronización manual
- ✅ Responsive al Dark Mode

---

## 📦 **Componentes y Archivos Creados**

### **1. NetworkContext**
📁 `src/contexts/NetworkContext.tsx`

**Características:**
- Monitoreo de estado de red con NetInfo
- Hook `useNetwork()` personalizado
- Proporciona estado global de conectividad

**API:**
```typescript
const { isConnected, isInternetReachable, connectionType, isOnline } = useNetwork();

// isConnected: boolean - Si hay conexión de red
// isInternetReachable: boolean - Si internet es accesible
// connectionType: string - Tipo de conexión (wifi, cellular, etc.)
// isOnline: boolean - Combinación de ambos (true si realmente online)
```

### **2. Offline Queue System**
📁 `src/utils/offlineQueue.ts`

**Características:**
- Gestión de cola persistente
- CRUD completo de items
- Sistema de reintentos
- Queries por tipo

**Métodos:**
```typescript
// Agregar item a la cola
await offlineQueue.addToQueue({
  type: 'CREATE_REPORT',
  endpoint: '/reportes',
  method: 'POST',
  data: reportData,
});

// Obtener cola completa
const queue = await offlineQueue.getQueue();

// Eliminar item
await offlineQueue.removeFromQueue(itemId);

// Limpiar toda la cola
await offlineQueue.clearQueue();

// Obtener cantidad
const count = await offlineQueue.getQueueSize();
```

**Tipos de Items:**
```typescript
interface QueueItem {
  id: string;                    // ID único
  type: 'CREATE_REPORT' | 'UPDATE_REPORT' | 'DELETE_REPORT' | 'OTHER';
  endpoint: string;              // Endpoint de la API
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data: any;                     // Datos a enviar
  timestamp: number;             // Timestamp de creación
  retryCount: number;            // Número de reintentos
}
```

### **3. Sync Hook**
📁 `src/hooks/useSyncQueue.ts`

**Características:**
- Hook personalizado para sincronización
- Procesamiento automático de cola
- Gestión de estado de sincronización
- Contador de items pendientes

**API:**
```typescript
const { syncQueue, isSyncing, pendingCount, updatePendingCount } = useSyncQueue();

// syncQueue() - Función para sincronizar manualmente
// isSyncing - boolean - Si está sincronizando
// pendingCount - number - Cantidad de items pendientes
// updatePendingCount() - Actualizar contador
```

### **4. Network Status Banner**
📁 `src/components/NetworkStatus.tsx`

**Características:**
- Banner animado en la parte superior
- Se muestra solo cuando está offline o hay items pendientes
- Botón de sincronización manual
- Iconos dinámicos
- Responsive al tema

---

## 🔧 **Cómo Usar**

### **Detectar Estado de Red**

```typescript
import { useNetwork } from '../contexts/NetworkContext';

const MyComponent = () => {
  const { isOnline, connectionType } = useNetwork();

  return (
    <View>
      {isOnline ? (
        <Text>✅ Conectado ({connectionType})</Text>
      ) : (
        <Text>❌ Sin conexión</Text>
      )}
    </View>
  );
};
```

### **Agregar Acción a la Cola (Cuando está Offline)**

```typescript
import { useNetwork } from '../contexts/NetworkContext';
import offlineQueue from '../utils/offlineQueue';

const handleCreateReport = async (reportData) => {
  const { isOnline } = useNetwork();

  if (!isOnline) {
    // Agregar a la cola offline
    await offlineQueue.addToQueue({
      type: 'CREATE_REPORT',
      endpoint: '/reportes',
      method: 'POST',
      data: reportData,
    });

    Alert.alert(
      'Guardado Offline',
      'El reporte se sincronizará cuando tengas conexión.'
    );
    return;
  }

  // Si hay conexión, enviar directamente
  try {
    await api.createReporte(reportData);
    Alert.alert('Éxito', 'Reporte guardado');
  } catch (error) {
    Alert.alert('Error', 'No se pudo guardar el reporte');
  }
};
```

### **Sincronización Manual**

```typescript
import { useSyncQueue } from '../hooks/useSyncQueue';

const SettingsScreen = () => {
  const { syncQueue, isSyncing, pendingCount } = useSyncQueue();

  return (
    <View>
      <Text>Acciones pendientes: {pendingCount}</Text>
      <Button
        title="Sincronizar Ahora"
        onPress={syncQueue}
        loading={isSyncing}
        disabled={isSyncing || pendingCount === 0}
      />
    </View>
  );
};
```

---

## 🎯 **Flujo de Trabajo**

### **Escenario 1: Usuario Crea Reporte SIN Conexión**

1. Usuario completa el formulario de reporte
2. Presiona "Guardar"
3. App detecta que no hay conexión (`isOnline === false`)
4. Reporte se guarda en la cola offline (`offlineQueue.addToQueue()`)
5. Se muestra alerta: "Guardado offline, se sincronizará automáticamente"
6. Banner aparece arriba: "Sin conexión a internet"

### **Escenario 2: Usuario Recupera Conexión**

1. Dispositivo se conecta a WiFi/Datos
2. `NetworkContext` detecta el cambio (`isOnline === true`)
3. `useSyncQueue` hook detecta la conexión
4. Se inicia sincronización automática (`syncQueue()`)
5. Se procesan items de la cola uno por uno
6. Al terminar, se muestra alerta: "3 acción(es) sincronizada(s) exitosamente"
7. Cola se limpia
8. Banner desaparece

### **Escenario 3: Error en Sincronización**

1. Intento de sincronizar falla (ej: servidor caído)
2. Se incrementa `retryCount` del item
3. Si `retryCount < 3`, item permanece en cola
4. Si `retryCount >= 3`, item se elimina de la cola
5. Se muestra alerta con count de éxitos y fallos

---

## 📱 **Integración en Formularios**

### **Ejemplo Completo: ReportForm con Modo Offline**

```typescript
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useNetwork } from '../contexts/NetworkContext';
import offlineQueue from '../utils/offlineQueue';
import api from '../services/api';
import Button from '../components/Button';

const ReportForm = () => {
  const { isOnline } = useNetwork();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (!isOnline) {
        // Modo Offline: Agregar a la cola
        await offlineQueue.addToQueue({
          type: 'CREATE_REPORT',
          endpoint: '/reportes',
          method: 'POST',
          data: formData,
        });

        Alert.alert(
          'Guardado Offline',
          'El reporte se guardó localmente y se sincronizará automáticamente cuando tengas conexión.'
        );

        // Limpiar formulario
        setFormData({});
        return;
      }

      // Modo Online: Enviar directamente
      await api.createReporte(formData);

      Alert.alert('Éxito', 'Reporte guardado exitosamente');
      setFormData({});
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* Formulario aquí */}

      <Button
        title={isOnline ? 'Guardar' : 'Guardar Offline'}
        onPress={handleSubmit}
        loading={loading}
        icon={isOnline ? 'save' : 'cloud-upload-outline'}
      />

      {!isOnline && (
        <Text style={styles.warning}>
          ⚠️ Sin conexión. Los datos se guardarán localmente.
        </Text>
      )}
    </View>
  );
};
```

---

## ⚙️ **Configuración**

### **Permisos Necesarios**

**Android (app.json):**
```json
{
  "android": {
    "permissions": [
      "ACCESS_NETWORK_STATE",
      "INTERNET"
    ]
  }
}
```

**iOS (app.json):**
No requiere permisos adicionales, NetInfo funciona automáticamente.

### **Configurar Reintentos**

Editar en `src/hooks/useSyncQueue.ts`:

```typescript
// Cambiar límite de reintentos
if (item.retryCount >= 5) {  // De 3 a 5 reintentos
  await offlineQueue.removeFromQueue(item.id);
}
```

### **Configurar Timeout**

Editar en `src/services/api.ts`:

```typescript
this.api = axios.create({
  baseURL: API_URL,
  timeout: 30000,  // Aumentar si es necesario
  // ...
});
```

---

## 🎨 **Personalización**

### **Cambiar Colores del Banner**

```typescript
// En NetworkStatus.tsx
const backgroundColor = isOnline
  ? theme.info      // Cambia theme.warning a theme.info
  : theme.danger;
```

### **Cambiar Posición del Banner**

```typescript
// En NetworkStatus.tsx styles
container: {
  position: 'absolute',
  bottom: 0,        // Cambiar de top: 0 a bottom: 0
  // ...
}
```

### **Personalizar Mensajes**

```typescript
const message = isOnline
  ? `Tienes ${pendingCount} cambios sin sincronizar`
  : 'Trabajando offline - Los cambios se guardarán localmente';
```

---

## 🐛 **Troubleshooting**

### **Problema: Banner no aparece**
**Solución:**
- Verificar que `NetworkProvider` envuelve la app
- Verificar que `NetworkStatus` está renderizado
- Revisar logs de consola para errores

### **Problema: No sincroniza automáticamente**
**Solución:**
- Verificar que `useSyncQueue` se está usando
- Revisar que `isOnline` cambia correctamente
- Verificar logs de `processQueueItem()`

### **Problema: Items duplicados en la cola**
**Solución:**
- No llamar `addToQueue()` múltiples veces
- Implementar debounce en formularios
- Verificar que se elimina después de éxito

### **Problema: Sincronización falla siempre**
**Solución:**
- Verificar que el backend está funcionando
- Revisar estructura de datos en cola
- Verificar endpoints y métodos HTTP
- Revisar logs de error en consola

---

## 💡 **Best Practices**

1. **Siempre verificar `isOnline`** antes de operaciones de red
2. **Dar feedback claro** al usuario (offline/online)
3. **Guardar en cola** solo acciones críticas
4. **Limpiar cola** después de sincronización exitosa
5. **Implementar límite de reintentos** para evitar loops infinitos
6. **Mostrar contador** de items pendientes
7. **Permitir sincronización manual** para casos urgentes
8. **Log detallado** en desarrollo para debugging
9. **Validar datos** antes de agregar a la cola
10. **Considerar compresión** para datos grandes

---

## 📊 **Ejemplo Avanzado: Reportes Offline**

```typescript
// Service mejorado con soporte offline
class ReportService {
  async createReport(data: ReporteActividades, { isOnline }: { isOnline: boolean }) {
    if (!isOnline) {
      // Generar ID temporal
      const tempId = `temp_${Date.now()}`;

      // Guardar localmente
      await AsyncStorage.setItem(`report_${tempId}`, JSON.stringify(data));

      // Agregar a cola
      await offlineQueue.addToQueue({
        type: 'CREATE_REPORT',
        endpoint: '/reportes',
        method: 'POST',
        data: { ...data, tempId },
      });

      return { id: tempId, ...data, offline: true };
    }

    // Online: enviar directamente
    const response = await api.createReporte(data);
    return response;
  }

  async getReports({ isOnline }: { isOnline: boolean }) {
    if (!isOnline) {
      // Obtener reportes locales
      const keys = await AsyncStorage.getAllKeys();
      const reportKeys = keys.filter(k => k.startsWith('report_'));
      const reports = await AsyncStorage.multiGet(reportKeys);
      return reports.map(([_, value]) => JSON.parse(value!));
    }

    // Online: obtener del servidor
    return await api.getReportes();
  }
}
```

---

## 🚀 **Próximos Pasos (Opcionales)**

### **Mejoras Avanzadas:**

1. **React Query Integration** ✨
   - Caché automático
   - Revalidación en foco
   - Optimistic updates

2. **Persistencia de Formularios** 💾
   - Auto-guardar cada X segundos
   - Recuperar al reabrir app
   - Borrador de reportes

3. **Compresión de Datos** 📦
   - Comprimir antes de guardar en cola
   - Reducir uso de storage
   - Optimizar transferencia

4. **Sincronización Inteligente** 🧠
   - Solo al conectar a WiFi
   - Programar para horarios específicos
   - Priorizar items críticos

5. **Métricas y Analytics** 📈
   - Tracking de uso offline
   - Tasa de éxito de sincronización
   - Tiempo promedio offline

---

## 📚 **Dependencias Utilizadas**

```json
{
  "@react-native-community/netinfo": "^11.0.0",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@tanstack/react-query": "^5.0.0"
}
```

**Instalación:**
```bash
npm install @react-native-community/netinfo @tanstack/react-query
```

---

## 🎉 **Resumen**

El Modo Offline está **completamente funcional** con:
- ✅ Detección automática de conectividad
- ✅ Queue persistente de acciones
- ✅ Sincronización automática
- ✅ Sincronización manual
- ✅ Feedback visual (banner)
- ✅ Sistema de reintentos
- ✅ Contador de items pendientes
- ✅ Responsive al Dark Mode
- ✅ TypeScript types completos
- ✅ Documentación completa

**Siguiente paso:** Integrar en los formularios de reportes y otras pantallas que requieran funcionalidad offline.

---

**¡El modo offline está listo para trabajar sin conexión! 📡✨**
