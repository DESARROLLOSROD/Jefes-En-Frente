const fs = require('fs');
const path = require('path');

// Lista de archivos a procesar
const archivos = [
  'frontend/src/components/shared/modals/ModalControlMaterial.tsx',
  'frontend/src/components/shared/modals/ModalControlAgua.tsx',
  'frontend/src/components/reports/sections/SeccionControlAcarreo.tsx',
  'frontend/src/components/reports/sections/SeccionControlMaterial.tsx',
  'frontend/src/components/reports/sections/SeccionControlAgua.tsx',
  'frontend/src/components/reports/FormularioReporte.tsx',
  'frontend/src/components/reports/ListaReportes.tsx',
  'frontend/src/components/auth/Login.tsx',
  'frontend/src/components/dashboard/Dashboard.tsx',
  'frontend/src/components/projects/SeleccionarProyecto.tsx',
  'frontend/src/components/projects/GestionProyectos.tsx',
  'frontend/src/components/users/GestionUsuarios.tsx',
  'frontend/src/components/users/FormularioUsuario.tsx',
  'frontend/src/components/vehicles/GestionVehiculos.tsx'
];

// Función para convertir strings en JSX a mayúsculas
function convertirTextos(contenido) {
  // Convertir textos entre comillas simples y dobles que están en JSX
  // Excluir import/export y clases CSS
  let resultado = contenido;

  // Convertir textos entre comillas dobles (excepto imports, exports, className, etc.)
  resultado = resultado.replace(/(>|placeholder=|title=|label=|alt=)["']([^"']+)["']/g, (match, prefix, texto) => {
    return `${prefix}"${texto.toUpperCase()}"`;
  });

  // Convertir textos directos en JSX (entre > y <)
  resultado = resultado.replace(/>([^<>{}\n]+)</g, (match, texto) => {
    const textoLimpio = texto.trim();
    if (textoLimpio && !textoLimpio.startsWith('//') && !textoLimpio.startsWith('/*')) {
      const espaciosAntes = match.match(/^>(\s*)/)[1];
      const espaciosDespues = match.match(/(\s*)<$/)[1];
      return `>${espaciosAntes}${textoLimpio.toUpperCase()}${espaciosDespues}<`;
    }
    return match;
  });

  return resultado;
}

// Procesar cada archivo
archivos.forEach(archivo => {
  const rutaCompleta = path.join(__dirname, archivo);

  try {
    if (fs.existsSync(rutaCompleta)) {
      console.log(`Procesando: ${archivo}`);
      const contenido = fs.readFileSync(rutaCompleta, 'utf8');
      const nuevoContenido = convertirTextos(contenido);
      fs.writeFileSync(rutaCompleta, nuevoContenido, 'utf8');
      console.log(`✓ Completado: ${archivo}`);
    } else {
      console.log(`✗ No encontrado: ${archivo}`);
    }
  } catch (error) {
    console.error(`Error procesando ${archivo}:`, error.message);
  }
});

console.log('\n¡Conversión completada!');
