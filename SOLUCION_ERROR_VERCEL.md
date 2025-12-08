# 🔧 Solución: Error de Deploy en Vercel

## ❌ Error Encontrado

```
sh: line 1: /vercel/path0/backend/node_modules/.bin/tsc: Permission denied
Error: Command "npm run vercel-build" exited with 126
```

## 🎯 Causa del Problema

Vercel no puede ejecutar TypeScript porque:
1. Las dependencias de TypeScript estaban en `devDependencies`
2. El archivo `vercel.json` apuntaba a archivos compilados que no existen

## ✅ Soluciones Aplicadas

### 1. Mover TypeScript a `dependencies`

**Archivo**: `backend/package.json`

Las dependencias de build deben estar en `dependencies` para que Vercel las instale en producción:

```json
{
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.5.0",
    "uuid": "^13.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.13",
    "@types/express": "^4.17.17",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^20.5.0",
    "@types/uuid": "^10.0.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "tsx": "^3.12.7"
  }
}
```

### 2. Actualizar `vercel.json`

**Archivo**: `backend/vercel.json`

Configurar correctamente para que Vercel compile TypeScript:

```json
{
  "version": 2,
  "name": "jefes-en-frente-backend",
  "buildCommand": "npm run build",
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/src/server.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/src/server.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🚀 Próximos Pasos

1. **Commit los cambios**:
   ```bash
   git add backend/package.json backend/vercel.json
   git commit -m "fix: Configure Vercel deployment for TypeScript"
   git push origin main
   ```

2. **Vercel automáticamente re-desplegará** el proyecto

3. **Verificar el deploy** en el dashboard de Vercel

## ✅ Verificación

El deploy debería mostrar:
```
✓ Running "npm run build"
✓ Compiled successfully
✓ Build completed
```

## 📝 Alternativa: Sin TypeScript en Build

Si prefieres no compilar en Vercel, puedes:

1. **Compilar localmente** antes de commit:
   ```bash
   cd backend
   npm run build
   ```

2. **Commitear la carpeta dist**:
   ```bash
   git add dist/
   git commit -m "Add compiled files"
   ```

3. **Actualizar vercel.json**:
   ```json
   {
     "builds": [
       {
         "src": "dist/server.js",
         "use": "@vercel/node"
       }
     ]
   }
   ```

**⚠️ No recomendado** porque:
- Aumenta el tamaño del repositorio
- Puede causar conflictos en merges
- No aprovecha el build de Vercel

## 🎓 Lecciones Aprendidas

1. **En Vercel**: Todo lo necesario para el build debe estar en `dependencies`
2. **devDependencies**: Solo para desarrollo local
3. **TypeScript**: Debe compilarse durante el deploy
4. **vercel.json**: Debe apuntar a archivos fuente, no compilados

## 🆘 Si Persiste el Error

1. **Verificar logs de Vercel**: Dashboard → Deployments → Click en deployment → Function Logs
2. **Probar build local**: `cd backend && npm run build`
3. **Limpiar caché de Vercel**: Dashboard → Settings → Clear cache
4. **Re-deploy manual**: Dashboard → Deployments → Redeploy

---

**Solución aplicada**: ✅ Configuración corregida y lista para deploy
