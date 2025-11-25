# Script para corregir FormularioReporte.tsx
$file = "c:\Users\ADMIN_SISTEMAS\Documents\Desarrollos\Jefes-En-Frente\frontend\src\components\FormularioReporte.tsx"

# Leer el contenido
$content = Get-Content $file -Raw

# Reemplazo 1: user?.name -> user?.nombre
$content = $content -replace "user\?\.name", "user?.nombre"

# Reemplazo 2: controlAcarreos -> controlAcarreo (plural a singular)
$content = $content -replace "controlAcarreos", "controlAcarreo"

# Guardar el archivo
$content | Set-Content $file -NoNewline

Write-Host "✅ Archivo corregido exitosamente"
