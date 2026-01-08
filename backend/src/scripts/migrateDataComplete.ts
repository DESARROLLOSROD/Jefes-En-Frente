/**
 * Script de Migración Completa de Datos de MongoDB a Supabase
 *
 * IMPORTANTE: Debes ejecutar PRIMERO migrateUsersToAuth.ts antes de este script
 *
 * Uso:
 * ts-node src/scripts/migrateDataComplete.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { supabaseAdmin } from '../config/supabase.js';

// Modelos de MongoDB
import Proyecto from '../models/Proyecto.js';
import Usuario from '../models/Usuario.js';
import Vehiculo from '../models/Vehiculo.js';
import ReporteActividades from '../models/ReporteActividades.js';
import Material from '../models/Material.js';
import Capacidad from '../models/Capacidad.js';
import Origen from '../models/Origen.js';
import Destino from '../models/Destino.js';
import TipoVehiculo from '../models/TipoVehiculo.js';

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
          id: proyecto._id.toString(),
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

        const { error } = await supabaseAdmin
          .from('proyectos')
          .insert(proyectoData);

        if (error) {
          if (error.code === '23505') { // Duplicate key
            console.log(`⚠️  Proyecto ya existe: ${proyecto.nombre}`);
          } else {
            throw error;
          }
        } else {
          console.log(`✅ Proyecto migrado: ${proyecto.nombre}`);
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
          id: vehiculo._id.toString(),
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

        const { error } = await supabaseAdmin
          .from('vehiculos')
          .insert(vehiculoData);

        if (error) {
          if (error.code === '23505') { // Duplicate key
            console.log(`⚠️  Vehículo ya existe: ${vehiculo.noEconomico}`);
          } else {
            throw error;
          }
        } else {
          console.log(`✅ Vehículo migrado: ${vehiculo.nombre} (${vehiculo.noEconomico})`);

          // Migrar relación con proyectos
          if (vehiculo.proyectos && vehiculo.proyectos.length > 0) {
            const vehiculoProyectos = vehiculo.proyectos.map((p: any) => ({
              vehiculo_id: vehiculo._id.toString(),
              proyecto_id: p.toString()
            }));

            const { error: relError } = await supabaseAdmin
              .from('vehiculo_proyectos')
              .insert(vehiculoProyectos);

            if (relError && relError.code !== '23505') {
              console.warn(`⚠️  Error asignando proyectos a vehículo:`, relError.message);
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
        id: material._id.toString(),
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
        id: capacidad._id.toString(),
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
        id: origen._id.toString(),
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
        id: destino._id.toString(),
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
        id: tipo._id.toString(),
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
    const reportes = await ReporteActividades.find().sort({ fechaCreacion: 1 });
    stats.reportes.total = reportes.length;

    console.log(`📋 ${reportes.length} reportes encontrados\n`);

    for (let i = 0; i < reportes.length; i++) {
      const reporte = reportes[i];

      try {
        console.log(`\n[${i + 1}/${reportes.length}] Migrando reporte ${reporte._id}...`);

        // Mapear usuario_id de MongoDB a Supabase Auth
        const { data: usuarios } = await supabaseAdmin.auth.admin.listUsers();
        const mongoUsuario = await Usuario.findById(reporte.usuarioId);

        let supabaseUserId = reporte.usuarioId?.toString();
        if (mongoUsuario) {
          const supabaseUser = usuarios?.users.find(u => u.email === mongoUsuario.email);
          if (supabaseUser) {
            supabaseUserId = supabaseUser.id;
          }
        }

        // Insertar reporte principal
        const reporteData: any = {
          id: reporte._id.toString(),
          proyecto_id: reporte.proyectoId?.toString(),
          usuario_id: supabaseUserId,
          fecha: reporte.fecha,
          turno: reporte.turno || null,
          jefe_frente: reporte.jefeFrente || null,
          observaciones: reporte.observaciones || null,
          offline_id: reporte.offlineId || null,
          fecha_creacion: reporte.fechaCreacion || new Date()
        };

        const { error } = await supabaseAdmin
          .from('reportes')
          .insert(reporteData);

        if (error) {
          if (error.code === '23505') {
            console.log(`⚠️  Reporte ya existe`);
            continue;
          } else {
            throw error;
          }
        }

        console.log(`✅ Reporte principal migrado`);

        // Migrar control de acarreo
        if (reporte.controlAcarreo && reporte.controlAcarreo.length > 0) {
          const acarreoData = reporte.controlAcarreo.map((item: any) => ({
            reporte_id: reporte._id.toString(),
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
            reporte_id: reporte._id.toString(),
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
            reporte_id: reporte._id.toString(),
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
            reporte_id: reporte._id.toString(),
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
