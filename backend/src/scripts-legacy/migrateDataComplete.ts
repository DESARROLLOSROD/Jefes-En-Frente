/**
 * Script de Migración Completa de Datos de MongoDB a Supabase
 *
 * IMPORTANTE: Debes ejecutar PRIMERO migrateUsersToAuth.ts antes de este script
 *
 * Uso:
 * npx tsx src/scripts/migrateDataComplete.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { supabaseAdmin } from '../config/supabase';

// Modelos de MongoDB
import Proyecto from '../models/Proyecto';
import Usuario from '../models/Usuario';
import Vehiculo from '../models/Vehiculo';
import ReporteActividades from '../models/ReporteActividades';
import Material from '../models/Material';
import Capacidad from '../models/Capacidad';
import Origen from '../models/Origen';
import Destino from '../models/Destino';
import TipoVehiculo from '../models/TipoVehiculo';

// Cargar variables de entorno
dotenv.config();

interface MigrationStats {
  [key: string]: {
    total: number;
    successful: number;
    failed: number;
    errors: Array<{ id: string; error: string }>;
  };
}

const stats: MigrationStats = {};

// Mapeo de IDs antiguos (MongoDB ObjectID) a nuevos (Supabase UUID)
const idMapping: {
  proyectos: Map<string, string>;
  vehiculos: Map<string, string>;
  usuarios: Map<string, string>;
} = {
  proyectos: new Map(),
  vehiculos: new Map(),
  usuarios: new Map()
};

function initStats(collection: string) {
  stats[collection] = {
    total: 0,
    successful: 0,
    failed: 0,
    errors: []
  };
}

async function connectMongoDB() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI no está configurada');
  }
  console.log('📦 Conectando a MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Conectado a MongoDB\n');
}

async function migrateProyectos() {
  console.log('\n📂 ============================================');
  console.log('📂 MIGRANDO PROYECTOS');
  console.log('📂 ============================================\n');

  initStats('proyectos');

  try {
    const proyectos = await Proyecto.find();
    stats.proyectos.total = proyectos.length;

    console.log(`📋 ${proyectos.length} proyectos encontrados\n`);

    for (const proyecto of proyectos) {
      try {
        const proyectoData: any = {
          // No incluir id - dejar que Supabase genere UUID automáticamente
          nombre: proyecto.nombre,
          ubicacion: proyecto.ubicacion,
          descripcion: proyecto.descripcion || null,
          activo: proyecto.activo !== undefined ? proyecto.activo : true,
          fecha_creacion: proyecto.fechaCreacion || new Date()
        };

        // Migrar mapa (si existe)
        if (proyecto.mapa?.imagen?.data) {
          proyectoData.mapa_imagen_data = proyecto.mapa.imagen.data;
          proyectoData.mapa_content_type = proyecto.mapa.imagen.contentType || 'image/png';
          proyectoData.mapa_width = proyecto.mapa.width || null;
          proyectoData.mapa_height = proyecto.mapa.height || null;
        }

        const { data: insertedData, error } = await supabaseAdmin
          .from('proyectos')
          .insert(proyectoData)
          .select()
          .single();

        if (error) {
          if (error.code === '23505') { // Duplicate key
            console.log(`⚠️  Proyecto ya existe: ${proyecto.nombre}`);
          } else {
            throw error;
          }
        } else {
          // Guardar mapeo de ID antiguo a nuevo
          idMapping.proyectos.set(proyecto._id.toString(), insertedData.id);
          console.log(`✅ Proyecto migrado: ${proyecto.nombre} (${proyecto._id} → ${insertedData.id})`);
          stats.proyectos.successful++;
        }
      } catch (error: any) {
        console.error(`❌ Error en proyecto ${proyecto.nombre}:`, error.message);
        stats.proyectos.failed++;
        stats.proyectos.errors.push({ id: proyecto._id.toString(), error: error.message });
      }
    }
  } catch (error: any) {
    console.error('❌ Error fatal en migración de proyectos:', error.message);
  }
}

async function migrateVehiculos() {
  console.log('\n🚛 ============================================');
  console.log('🚛 MIGRANDO VEHÍCULOS');
  console.log('🚛 ============================================\n');

  initStats('vehiculos');

  try {
    const vehiculos = await Vehiculo.find();
    stats.vehiculos.total = vehiculos.length;

    console.log(`📋 ${vehiculos.length} vehículos encontrados\n`);

    for (const vehiculo of vehiculos) {
      try {
        const vehiculoData: any = {
          // No incluir id - dejar que Supabase genere UUID automáticamente
          nombre: vehiculo.nombre,
          tipo: vehiculo.tipo,
          no_economico: vehiculo.noEconomico,
          capacidad: vehiculo.capacidad || null,
          horometro_inicial: vehiculo.horometroInicial || 0,
          horometro_final: vehiculo.horometroFinal || 0,
          horas_operacion: vehiculo.horasOperacion || 0,
          activo: vehiculo.activo !== undefined ? vehiculo.activo : true,
          fecha_creacion: vehiculo.fechaCreacion || new Date()
        };

        const { data: insertedData, error } = await supabaseAdmin
          .from('vehiculos')
          .insert(vehiculoData)
          .select()
          .single();

        if (error) {
          if (error.code === '23505') { // Duplicate key
            console.log(`⚠️  Vehículo ya existe: ${vehiculo.noEconomico}`);
          } else {
            throw error;
          }
        } else {
          // Guardar mapeo de ID antiguo a nuevo
          idMapping.vehiculos.set(vehiculo._id.toString(), insertedData.id);
          console.log(`✅ Vehículo migrado: ${vehiculo.nombre} (${vehiculo.noEconomico})`);

          // Migrar relación con proyectos usando el mapeo de IDs
          if (vehiculo.proyectos && vehiculo.proyectos.length > 0) {
            const vehiculoProyectos = vehiculo.proyectos
              .map((p: any) => {
                const proyectoIdAntiguo = p.toString();
                const proyectoIdNuevo = idMapping.proyectos.get(proyectoIdAntiguo);

                if (!proyectoIdNuevo) {
                  console.warn(`⚠️  Proyecto no encontrado en mapeo: ${proyectoIdAntiguo}`);
                  return null;
                }

                return {
                  vehiculo_id: insertedData.id,
                  proyecto_id: proyectoIdNuevo
                };
              })
              .filter(Boolean); // Eliminar nulls

            if (vehiculoProyectos.length > 0) {
              const { error: relError } = await supabaseAdmin
                .from('vehiculo_proyectos')
                .insert(vehiculoProyectos);

              if (relError && relError.code !== '23505') {
                console.warn(`⚠️  Error asignando proyectos a vehículo:`, relError.message);
              }
            }
          }

          stats.vehiculos.successful++;
        }
      } catch (error: any) {
        console.error(`❌ Error en vehículo ${vehiculo.nombre}:`, error.message);
        stats.vehiculos.failed++;
        stats.vehiculos.errors.push({ id: vehiculo._id.toString(), error: error.message });
      }
    }
  } catch (error: any) {
    console.error('❌ Error fatal en migración de vehículos:', error.message);
  }
}

async function migrateCatalogos() {
  console.log('\n📚 ============================================');
  console.log('📚 MIGRANDO CATÁLOGOS');
  console.log('📚 ============================================\n');

  // Materiales
  console.log('📦 Migrando materiales...');
  initStats('materiales');
  const materiales = await Material.find();
  stats.materiales.total = materiales.length;

  for (const material of materiales) {
    try {
      const { error } = await supabaseAdmin.from('cat_materiales').insert({
        // No incluir id - dejar que Supabase genere UUID automáticamente
        nombre: material.nombre,
        unidad: material.unidad || null,
        activo: material.activo !== undefined ? material.activo : true,
        fecha_creacion: material.fechaCreacion || new Date()
      });

      if (!error || error.code === '23505') {
        stats.materiales.successful++;
        console.log(`✅ Material: ${material.nombre}`);
      } else {
        throw error;
      }
    } catch (error: any) {
      stats.materiales.failed++;
      console.error(`❌ Error en material ${material.nombre}:`, error.message);
    }
  }

  // Capacidades
  console.log('\n📏 Migrando capacidades...');
  initStats('capacidades');
  const capacidades = await Capacidad.find();
  stats.capacidades.total = capacidades.length;

  for (const capacidad of capacidades) {
    try {
      const { error } = await supabaseAdmin.from('cat_capacidades').insert({
        // No incluir id - dejar que Supabase genere UUID automáticamente
        valor: capacidad.valor,
        etiqueta: capacidad.etiqueta || null,
        activo: capacidad.activo !== undefined ? capacidad.activo : true,
        fecha_creacion: capacidad.fechaCreacion || new Date()
      });

      if (!error || error.code === '23505') {
        stats.capacidades.successful++;
        console.log(`✅ Capacidad: ${capacidad.valor}`);
      } else {
        throw error;
      }
    } catch (error: any) {
      stats.capacidades.failed++;
      console.error(`❌ Error en capacidad ${capacidad.valor}:`, error.message);
    }
  }

  // Orígenes
  console.log('\n📍 Migrando orígenes...');
  initStats('origenes');
  const origenes = await Origen.find();
  stats.origenes.total = origenes.length;

  for (const origen of origenes) {
    try {
      const { error } = await supabaseAdmin.from('cat_origenes').insert({
        // No incluir id - dejar que Supabase genere UUID automáticamente
        nombre: origen.nombre,
        activo: origen.activo !== undefined ? origen.activo : true,
        fecha_creacion: origen.fechaCreacion || new Date()
      });

      if (!error || error.code === '23505') {
        stats.origenes.successful++;
        console.log(`✅ Origen: ${origen.nombre}`);
      } else {
        throw error;
      }
    } catch (error: any) {
      stats.origenes.failed++;
      console.error(`❌ Error en origen ${origen.nombre}:`, error.message);
    }
  }

  // Destinos
  console.log('\n🎯 Migrando destinos...');
  initStats('destinos');
  const destinos = await Destino.find();
  stats.destinos.total = destinos.length;

  for (const destino of destinos) {
    try {
      const { error } = await supabaseAdmin.from('cat_destinos').insert({
        // No incluir id - dejar que Supabase genere UUID automáticamente
        nombre: destino.nombre,
        activo: destino.activo !== undefined ? destino.activo : true,
        fecha_creacion: destino.fechaCreacion || new Date()
      });

      if (!error || error.code === '23505') {
        stats.destinos.successful++;
        console.log(`✅ Destino: ${destino.nombre}`);
      } else {
        throw error;
      }
    } catch (error: any) {
      stats.destinos.failed++;
      console.error(`❌ Error en destino ${destino.nombre}:`, error.message);
    }
  }

  // Tipos de Vehículo
  console.log('\n🚜 Migrando tipos de vehículo...');
  initStats('tipos_vehiculo');
  const tiposVehiculo = await TipoVehiculo.find();
  stats.tipos_vehiculo.total = tiposVehiculo.length;

  for (const tipo of tiposVehiculo) {
    try {
      const { error } = await supabaseAdmin.from('cat_tipos_vehiculo').insert({
        // No incluir id - dejar que Supabase genere UUID automáticamente
        nombre: tipo.nombre,
        activo: tipo.activo !== undefined ? tipo.activo : true,
        fecha_creacion: tipo.fechaCreacion || new Date()
      });

      if (!error || error.code === '23505') {
        stats.tipos_vehiculo.successful++;
        console.log(`✅ Tipo vehículo: ${tipo.nombre}`);
      } else {
        throw error;
      }
    } catch (error: any) {
      stats.tipos_vehiculo.failed++;
      console.error(`❌ Error en tipo vehículo ${tipo.nombre}:`, error.message);
    }
  }
}

async function migrateReportes() {
  console.log('\n📝 ============================================');
  console.log('📝 MIGRANDO REPORTES');
  console.log('📝 ============================================\n');

  initStats('reportes');

  try {
    // Primero, cargar el mapeo de usuarios (ya migrados en script anterior)
    console.log('📋 Cargando mapeo de usuarios...');
    const { data: usuarios } = await supabaseAdmin.auth.admin.listUsers();
    const mongoUsuarios = await Usuario.find();

    mongoUsuarios.forEach(mongoUsuario => {
      const supabaseUser = usuarios?.users.find(u => u.email === mongoUsuario.email);
      if (supabaseUser) {
        idMapping.usuarios.set(mongoUsuario._id.toString(), supabaseUser.id);
      }
    });
    console.log(`✅ ${idMapping.usuarios.size} usuarios mapeados\n`);

    const reportes = await ReporteActividades.find().sort({ fechaCreacion: 1 });
    stats.reportes.total = reportes.length;

    console.log(`📋 ${reportes.length} reportes encontrados\n`);

    for (let i = 0; i < reportes.length; i++) {
      const reporte = reportes[i];

      try {
        console.log(`\n[${i + 1}/${reportes.length}] Migrando reporte...`);

        // Mapear IDs usando el mapeo creado
        const proyectoIdAntiguo = reporte.proyectoId?.toString();
        const usuarioIdAntiguo = reporte.usuarioId?.toString();

        const proyectoIdNuevo = proyectoIdAntiguo ? idMapping.proyectos.get(proyectoIdAntiguo) : null;
        const usuarioIdNuevo = usuarioIdAntiguo ? idMapping.usuarios.get(usuarioIdAntiguo) : null;

        if (!proyectoIdNuevo) {
          console.warn(`⚠️  Proyecto no encontrado en mapeo: ${proyectoIdAntiguo}`);
          stats.reportes.failed++;
          continue;
        }

        if (!usuarioIdNuevo) {
          console.warn(`⚠️  Usuario no encontrado en mapeo: ${usuarioIdAntiguo}`);
          stats.reportes.failed++;
          continue;
        }

        // Insertar reporte principal
        const reporteData: any = {
          // No incluir id - dejar que Supabase genere UUID automáticamente
          proyecto_id: proyectoIdNuevo,
          usuario_id: usuarioIdNuevo,
          fecha: reporte.fecha,
          turno: reporte.turno || null,
          jefe_frente: reporte.jefeFrente || null,
          observaciones: reporte.observaciones || null,
          offline_id: reporte.offlineId || null,
          fecha_creacion: reporte.fechaCreacion || new Date()
        };

        const { data: insertedReporte, error } = await supabaseAdmin
          .from('reportes')
          .insert(reporteData)
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            console.log(`⚠️  Reporte ya existe`);
            continue;
          } else {
            throw error;
          }
        }

        const reporteIdNuevo = insertedReporte.id;
        console.log(`✅ Reporte principal migrado (${reporteIdNuevo})`);

        // Migrar control de acarreo
        if (reporte.controlAcarreo && reporte.controlAcarreo.length > 0) {
          const acarreoData = reporte.controlAcarreo.map((item: any) => ({
            reporte_id: reporteIdNuevo,
            no_viaje: item.noViaje || 1,
            horario: item.horario || null,
            material: item.material,
            capacidad: item.capacidad || null,
            vol_suelto: item.volSuelto ? parseFloat(item.volSuelto) : 0,
            origen: item.origen,
            destino: item.destino
          }));

          await supabaseAdmin.from('reporte_acarreo').insert(acarreoData);
          console.log(`  ✅ ${acarreoData.length} items de acarreo`);
        }

        // Migrar control de material
        if (reporte.controlMaterial && reporte.controlMaterial.length > 0) {
          const materialData = reporte.controlMaterial.map((item: any) => ({
            reporte_id: reporteIdNuevo,
            material: item.material,
            cantidad: item.cantidad ? parseFloat(item.cantidad) : 0,
            unidad: item.unidad || 'M³'
          }));

          await supabaseAdmin.from('reporte_material').insert(materialData);
          console.log(`  ✅ ${materialData.length} items de material`);
        }

        // Migrar control de agua
        if (reporte.controlAgua && reporte.controlAgua.length > 0) {
          const aguaData = reporte.controlAgua.map((item: any) => ({
            reporte_id: reporteIdNuevo,
            viaje: item.viaje || 1,
            horario: item.horario || null,
            volumen: item.volumen ? parseFloat(item.volumen) : 0,
            origen: item.origen || null,
            destino: item.destino || null
          }));

          await supabaseAdmin.from('reporte_agua').insert(aguaData);
          console.log(`  ✅ ${aguaData.length} items de agua`);
        }

        // Migrar control de maquinaria
        if (reporte.controlMaquinaria && reporte.controlMaquinaria.length > 0) {
          const maquinariaData = reporte.controlMaquinaria.map((item: any) => ({
            reporte_id: reporteIdNuevo,
            tipo: item.tipo,
            numero_economico: item.numeroEconomico || null,
            horometro_inicial: item.horometroInicial || 0,
            horometro_final: item.horometroFinal || 0,
            horas_operacion: item.horasOperacion || 0,
            observaciones: item.observaciones || null
          }));

          await supabaseAdmin.from('reporte_maquinaria').insert(maquinariaData);
          console.log(`  ✅ ${maquinariaData.length} items de maquinaria`);
        }

        stats.reportes.successful++;

      } catch (error: any) {
        console.error(`❌ Error en reporte ${reporte._id}:`, error.message);
        stats.reportes.failed++;
        stats.reportes.errors.push({ id: reporte._id.toString(), error: error.message });
      }
    }
  } catch (error: any) {
    console.error('❌ Error fatal en migración de reportes:', error.message);
  }
}

function printSummary() {
  console.log('\n\n📊 ============================================');
  console.log('📊 RESUMEN GENERAL DE MIGRACIÓN');
  console.log('📊 ============================================\n');

  Object.entries(stats).forEach(([collection, data]) => {
    console.log(`📋 ${collection.toUpperCase()}`);
    console.log(`   Total: ${data.total}`);
    console.log(`   ✅ Exitosos: ${data.successful}`);
    console.log(`   ❌ Fallidos: ${data.failed}`);

    if (data.errors.length > 0) {
      console.log(`   Errores:`);
      data.errors.slice(0, 5).forEach(({ id, error }) => {
        console.log(`      - ${id}: ${error}`);
      });
      if (data.errors.length > 5) {
        console.log(`      ... y ${data.errors.length - 5} más`);
      }
    }
    console.log('');
  });

  console.log('📊 ============================================\n');
}

async function main() {
  console.log('🚀 ============================================');
  console.log('🚀 MIGRACIÓN COMPLETA DE DATOS');
  console.log('🚀 MongoDB → Supabase PostgreSQL');
  console.log('🚀 ============================================\n');

  try {
    await connectMongoDB();

    // Orden de migración (importante por foreign keys)
    await migrateProyectos();
    await migrateVehiculos();
    await migrateCatalogos();
    await migrateReportes();

    printSummary();

  } catch (error: any) {
    console.error('\n❌ Error fatal en la migración:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  }
}

// Ejecutar script
main()
  .then(() => {
    console.log('\n✅ Migración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
