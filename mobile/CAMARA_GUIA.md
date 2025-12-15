# 📸 Funcionalidad de Cámara - Guía Completa

## 📅 Fecha de implementación
Diciembre 15, 2025

## ✅ Componentes Implementados

La funcionalidad de cámara ha sido implementada con componentes profesionales y reutilizables.

---

## 📦 **Componentes Creados**

### 1. **ImagePicker Component**
📁 `src/components/ImagePicker.tsx`

**Características:**
- ✅ Tomar fotos con la cámara
- ✅ Seleccionar imágenes de la galería
- ✅ Compresión automática de imágenes
- ✅ Conversión a Base64
- ✅ Límite configurable de imágenes (default: 10)
- ✅ Preview de imágenes en horizontal scroll
- ✅ Eliminar imágenes con confirmación
- ✅ Permisos automáticos de cámara y galería
- ✅ Feedback visual de carga
- ✅ Responsive al Dark Mode

**Props:**
```typescript
interface ImagePickerProps {
  images: ImageItem[];              // Array de imágenes
  onImagesChange: (images: ImageItem[]) => void;  // Callback
  maxImages?: number;               // Límite (default: 10)
  compressionQuality?: number;      // Calidad 0-1 (default: 0.7)
}

interface ImageItem {
  uri: string;          // URI local de la imagen
  name?: string;        // Nombre del archivo
  type?: string;        // MIME type (image/jpeg)
  base64?: string;      // Imagen en base64
}
```

**Funcionalidades:**
- Solicitud automática de permisos (cámara y galería)
- Edición básica (crop con aspect ratio 4:3)
- Nombres automáticos con timestamp
- Validación de límite de imágenes
- Alertas informativas
- Loading state

### 2. **ImageViewer Component**
📁 `src/components/ImageViewer.tsx`

**Características:**
- ✅ Visor de imágenes en pantalla completa
- ✅ Navegación entre imágenes (anterior/siguiente)
- ✅ Contador de imágenes (1/5)
- ✅ Thumbnails horizontales
- ✅ Modal con overlay oscuro
- ✅ Zoom con resizeMode contain
- ✅ Botón de cerrar
- ✅ Responsive al Dark Mode

**Props:**
```typescript
interface ImageViewerProps {
  images: string[];       // Array de URIs
  initialIndex?: number;  // Índice inicial (default: 0)
}
```

**Funcionalidades:**
- Click en thumbnail abre visor full screen
- Navegación con flechas izquierda/derecha
- Cerrar con botón X o gesto
- Contador visual de posición
- Imágenes optimizadas para pantalla

---

## 🚀 **Cómo Usar**

### **En un Formulario (Ejemplo: ReportForm)**

```typescript
import React, { useState } from 'react';
import ImagePicker, { ImageItem } from '../components/ImagePicker';

const ReportForm = () => {
  const [images, setImages] = useState<ImageItem[]>([]);

  const handleSubmit = () => {
    console.log('Imágenes a subir:', images);
    // Aquí subirías las imágenes al servidor
    // usando images[].base64 o images[].uri
  };

  return (
    <View>
      <ImagePicker
        images={images}
        onImagesChange={setImages}
        maxImages={10}
        compressionQuality={0.7}
      />

      <Button title="Guardar" onPress={handleSubmit} />
    </View>
  );
};
```

### **En una Pantalla de Detalle (Ejemplo: ReportDetail)**

```typescript
import React from 'react';
import ImageViewer from '../components/ImageViewer';

const ReportDetail = ({ report }) => {
  // Suponiendo que report.fotos es un array de URLs
  const imageUrls = report.fotos || [];

  return (
    <View>
      <Text>Fotos de Evidencia:</Text>

      {imageUrls.length > 0 ? (
        <ImageViewer images={imageUrls} />
      ) : (
        <Text>No hay fotos disponibles</Text>
      )}
    </View>
  );
};
```

---

## 🔧 **Integración con Backend**

### **Opción 1: Subir Base64 (Más Simple)**

```typescript
// En el formulario
const handleSubmit = async () => {
  const reportData = {
    // ... otros campos
    fotos: images.map(img => ({
      data: img.base64,
      contentType: 'image/jpeg',
      name: img.name,
    })),
  };

  await api.createReporte(reportData);
};
```

**En el Backend (Express/MongoDB):**
```javascript
// Modelo
const reporteSchema = new mongoose.Schema({
  // ... otros campos
  fotos: [{
    data: String,      // Base64 string
    contentType: String,
    name: String,
    fechaSubida: { type: Date, default: Date.now }
  }]
});

// Ruta
router.post('/reportes', async (req, res) => {
  const { fotos, ...otherData } = req.body;

  const reporte = new Reporte({
    ...otherData,
    fotos: fotos.map(foto => ({
      data: foto.data,
      contentType: foto.contentType,
      name: foto.name,
    })),
  });

  await reporte.save();
  res.json({ success: true, data: reporte });
});
```

### **Opción 2: Subir con FormData (Recomendado para Producción)**

```typescript
import * as FileSystem from 'expo-file-system';

const uploadImages = async (images: ImageItem[]) => {
  const formData = new FormData();

  for (const image of images) {
    // Crear objeto File/Blob desde URI
    const fileInfo = await FileSystem.getInfoAsync(image.uri);

    formData.append('fotos', {
      uri: image.uri,
      type: 'image/jpeg',
      name: image.name || 'photo.jpg',
    } as any);
  }

  // Agregar otros datos del reporte
  formData.append('fecha', new Date().toISOString());
  formData.append('ubicacion', 'Zona A');
  // ... más campos

  const response = await fetch('https://api.example.com/reportes', {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};
```

**En el Backend con Multer:**
```javascript
const multer = require('multer');
const path = require('path');

// Configurar storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/reportes/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  },
});

// Ruta
router.post('/reportes', upload.array('fotos', 10), async (req, res) => {
  const fotos = req.files.map(file => ({
    url: `/uploads/reportes/${file.filename}`,
    name: file.originalname,
    size: file.size,
  }));

  const reporte = new Reporte({
    ...req.body,
    fotos,
  });

  await reporte.save();
  res.json({ success: true, data: reporte });
});
```

---

## 📱 **Permisos**

### **Android (app.json)**
Ya configurado:
```json
{
  "android": {
    "permissions": [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE"
    ]
  }
}
```

### **iOS (app.json)**
Agregar descripciones:
```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "Esta app necesita acceso a la cámara para tomar fotos de evidencia en los reportes.",
      "NSPhotoLibraryUsageDescription": "Esta app necesita acceso a tu galería para seleccionar fotos de evidencia.",
      "NSPhotoLibraryAddUsageDescription": "Esta app necesita permiso para guardar fotos en tu galería."
    }
  }
}
```

---

## 🎨 **Personalización**

### **Cambiar calidad de compresión:**
```typescript
<ImagePicker
  images={images}
  onImagesChange={setImages}
  compressionQuality={0.5}  // 50% calidad (más pequeño)
/>
```

### **Cambiar límite de imágenes:**
```typescript
<ImagePicker
  images={images}
  onImagesChange={setImages}
  maxImages={5}  // Máximo 5 imágenes
/>
```

### **Tamaño de thumbnails:**
Editar en `ImagePicker.tsx`:
```typescript
const imageSize = (width - 48) / 4; // 4 imágenes por fila
```

---

## 💾 **Optimización de Storage**

### **Comprimir antes de subir:**

```typescript
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const compressImage = async (uri: string) => {
  const manipResult = await manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }], // Redimensionar a 1024px de ancho
    { compress: 0.7, format: SaveFormat.JPEG }
  );
  return manipResult.uri;
};

// Usar en ImagePicker
const result = await ImagePickerExpo.launchCameraAsync({
  quality: 0.7,
  // ...
});

if (!result.canceled) {
  const compressedUri = await compressImage(result.assets[0].uri);
  // Usar compressedUri
}
```

### **Límites recomendados:**

| Caso de Uso | Max Images | Quality | Max Size |
|-------------|------------|---------|----------|
| Reportes diarios | 10 | 0.7 | 2MB |
| Inspecciones | 20 | 0.8 | 3MB |
| Documentación | 50 | 0.9 | 5MB |

---

## 🐛 **Troubleshooting**

### **Problema: "Permission denied"**
**Solución:**
- Verificar permisos en `app.json`
- Solicitar permisos manualmente con `requestPermissions()`
- Revisar configuración del dispositivo

### **Problema: "Image too large"**
**Solución:**
- Reducir `compressionQuality`
- Implementar resize con `expo-image-manipulator`
- Validar tamaño antes de subir

### **Problema: "Cannot read property 'uri'"**
**Solución:**
- Verificar que `result.canceled === false`
- Verificar que `result.assets[0]` existe
- Agregar try-catch para errores

### **Problema: "Base64 string too long"**
**Solución:**
- Usar FormData en lugar de Base64
- Reducir calidad de compresión
- Subir imágenes de a una

---

## 📋 **Ejemplo Completo de Integración**

```typescript
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import ImagePicker, { ImageItem } from '../components/ImagePicker';
import Button from '../components/Button';
import api from '../services/api';

const ReportFormWithImages = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (images.length === 0) {
      Alert.alert('Aviso', 'Agrega al menos una foto de evidencia');
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        fecha: new Date(),
        ubicacion: 'Zona A',
        turno: 'primer',
        fotos: images.map(img => ({
          data: img.base64,
          contentType: 'image/jpeg',
          name: img.name,
        })),
      };

      await api.createReporte(reportData);
      Alert.alert('Éxito', 'Reporte guardado con éxito');
      setImages([]); // Limpiar imágenes
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <ImagePicker
        images={images}
        onImagesChange={setImages}
        maxImages={10}
        compressionQuality={0.7}
      />

      <Button
        title="Guardar Reporte"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading || images.length === 0}
        icon="save-outline"
        fullWidth
      />
    </View>
  );
};

export default ReportFormWithImages;
```

---

## 🎯 **Siguientes Pasos**

### **Fase 1: Integración Básica** ✅
1. ✅ Componente ImagePicker creado
2. ✅ Componente ImageViewer creado
3. ✅ Documentación completa

### **Fase 2: Integración en Reportes** (Pendiente)
4. Agregar ImagePicker a ReportFormEnhanced
5. Actualizar tipos de ReporteActividades
6. Implementar subida al servidor

### **Fase 3: Backend** (Pendiente)
7. Crear endpoint para subir imágenes
8. Configurar storage (local o cloud)
9. Agregar validaciones de seguridad

### **Fase 4: Optimizaciones** (Pendiente)
10. Implementar resize automático
11. Agregar carga progresiva
12. Implementar caché de imágenes

---

## 📚 **Dependencias Utilizadas**

Todas ya instaladas:
```json
{
  "expo-image-picker": "~17.0.10",
  "expo-file-system": "~19.0.21",
  "@expo/vector-icons": "^15.0.3"
}
```

**Opcional (para optimización):**
```bash
npx expo install expo-image-manipulator
```

---

## 💡 **Best Practices**

1. **Siempre validar permisos** antes de usar la cámara
2. **Comprimir imágenes** para ahorrar bandwidth
3. **Limitar cantidad** de fotos por reporte
4. **Usar FormData** para uploads en producción
5. **Mostrar feedback** de progreso al subir
6. **Validar formato** (solo JPEG/PNG)
7. **Implementar retry** en caso de error de red
8. **Guardar en caché** para modo offline

---

## 🎉 **Resumen**

La funcionalidad de cámara está **lista para usar** con:
- ✅ Componente ImagePicker completo
- ✅ Componente ImageViewer completo
- ✅ Permisos automáticos
- ✅ Compresión de imágenes
- ✅ Preview y eliminación
- ✅ Responsive al Dark Mode
- ✅ TypeScript types
- ✅ Documentación completa

**Siguiente paso:** Integrar en ReportFormEnhanced y conectar con el backend.

---

**¡La funcionalidad de cámara está lista! 📸✨**
