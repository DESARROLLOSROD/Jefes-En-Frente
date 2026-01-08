import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import Usuario from '../models/Usuario.js';
import Proyecto from '../models/Proyecto.js';
import Vehiculo from '../models/Vehiculo.js';
import ReporteActividades from '../models/ReporteActividades.js';

dotenv.config();

// Configuración (Asegúrate de tener estos valores en tu .env)
const MONGODB_URI = process.env.MONGODB_URI || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!MONGODB_URI || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Falta configuración en el .env (MONGODB_URI, SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY)');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Mapas para mantener la relación entre MongoDB IDs y Supabase UUIDs
const projectMap = new Map<string, string>();
const vehicleMap = new Map<string, string>();
const userMap = new Map<string, string>();

async function migrate() {
    try {
        console.log('🚀 Iniciando migración a Supabase...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // 1. Migrar Proyectos
        console.log('📂 Migrando Proyectos...');
        const proyectos = await Proyecto.find();
        for (const p of proyectos) {
            // Verificar si el proyecto ya existe por nombre
            const { data: existingProject } = await supabase
                .from('proyectos')
                .select('id')
                .eq('nombre', p.nombre)
                .maybeSingle();

            if (existingProject) {
                console.log(`ℹ️ Proyecto ya existe: ${p.nombre}`);
                projectMap.set(p._id.toString(), existingProject.id);
                continue;
            }

            const { data, error } = await supabase
                .from('proyectos')
                .insert({
                    nombre: p.nombre,
                    ubicacion: p.ubicacion,
                    descripcion: p.descripcion,
                    activo: p.activo,
                    mapa_imagen_data: p.mapa?.imagen?.data,
                    mapa_content_type: p.mapa?.imagen?.contentType,
                    mapa_width: p.mapa?.width,
                    mapa_height: p.mapa?.height,
                    fecha_creacion: p.fechaCreacion
                })
                .select()
                .single();

            if (error) console.error(`❌ Error migrando proyecto ${p.nombre}:`, error.message);
            else projectMap.set(p._id.toString(), data.id);
        }

        // 2. Migrar Vehículos
        console.log('🚜 Migrando Vehículos...');
        const vehiculos = await Vehiculo.find();
        for (const v of vehiculos) {
            // Verificar si el vehículo ya existe por número económico
            const { data: existingVehiculo } = await supabase
                .from('vehiculos')
                .select('id')
                .eq('no_economico', v.noEconomico)
                .maybeSingle();

            let vehiculoId: string;

            if (existingVehiculo) {
                console.log(`ℹ️ Vehículo ya existe: ${v.noEconomico}`);
                vehiculoId = existingVehiculo.id;
            } else {
                const { data, error } = await supabase
                    .from('vehiculos')
                    .insert({
                        nombre: v.nombre,
                        tipo: v.tipo,
                        no_economico: v.noEconomico,
                        horometro_inicial: v.horometroInicial,
                        horometro_final: v.horometroFinal,
                        horas_operacion: v.horasOperacion,
                        capacidad: v.capacidad,
                        activo: v.activo,
                        fecha_creacion: v.fechaCreacion
                    })
                    .select()
                    .single();

                if (error) {
                    console.error(`❌ Error migrando vehículo ${v.noEconomico}:`, error.message);
                    continue;
                }
                vehiculoId = data.id;
            }

            vehicleMap.set(v._id.toString(), vehiculoId);

            // Migrar relación vehículo-proyecto
            if (v.proyectos && v.proyectos.length > 0) {
                for (const pId of v.proyectos) {
                    const supabaseProjectId = projectMap.get(pId.toString());
                    if (supabaseProjectId) {
                        // Usar upsert o verificar antes para evitar duplicados en la relación
                        await supabase.from('vehiculo_proyectos').upsert({
                            vehiculo_id: vehiculoId,
                            proyecto_id: supabaseProjectId
                        }, { onConflict: 'vehiculo_id,proyecto_id' });
                    }
                }
            }
        }

        // 3. Migrar Usuarios (Nota: Esto crea el PERFIL, Supabase Auth requiere otro paso)
        console.log('👤 Migrando Usuarios (Perfiles)...');
        const usuarios = await Usuario.find();
        for (const u of usuarios) {
            // NOTA: Para migrar a Auth se necesita importar usuarios a Supabase Auth primero.
            // Aquí asumo que ya se crearon o se crearán con el mismo ID si es posible, 
            // o simplemente guardamos el perfi. RECOMENDACIÓN: Crear manualmente en Auth.
            console.log(`⚠️ Recordatorio: Debes crear al usuario ${u.email} en Supabase Auth primero para obtener su UUID.`);
        }

        // 4. Migrar Reportes (La parte más compleja)
        console.log('📝 Migrando Reportes...');
        const reportes = await ReporteActividades.find();
        for (const r of reportes) {
            // Para reportes es un poco más difícil, usaremos offline_id si existe
            if (r.offlineId) {
                const { data: existingReporte } = await supabase
                    .from('reportes')
                    .select('id')
                    .eq('offline_id', r.offlineId)
                    .maybeSingle();

                if (existingReporte) {
                    console.log(`ℹ️ Reporte ya existe (offline_id): ${r.offlineId}`);
                    continue;
                }
            }

            const { data: reporteData, error: reporteError } = await supabase
                .from('reportes')
                .insert({
                    fecha: r.fecha,
                    ubicacion: r.ubicacion,
                    turno: r.turno,
                    inicio_actividades: r.inicioActividades,
                    termino_actividades: r.terminoActividades,
                    zona_id: r.zonaTrabajo?.zonaId,
                    zona_nombre: r.zonaTrabajo?.zonaNombre,
                    seccion_id: r.seccionTrabajo?.seccionId,
                    seccion_nombre: r.seccionTrabajo?.seccionNombre,
                    jefe_frente: r.jefeFrente,
                    sobrestante: r.sobrestante,
                    observaciones: r.observaciones,
                    creado_por: r.creadoPor,
                    proyecto_id: projectMap.get(r.proyectoId.toString()),
                    offline_id: r.offlineId,
                    ubicacion_mapa_pin_x: r.ubicacionMapa?.pinX,
                    ubicacion_mapa_pin_y: r.ubicacionMapa?.pinY,
                    ubicacion_mapa_colocado: r.ubicacionMapa?.colocado,
                    fecha_creacion: r.fechaCreacion
                })
                .select()
                .single();

            if (reporteError) {
                console.error(`❌ Error migrando reporte ${r._id}:`, reporteError.message);
                continue;
            }

            const reporteId = reporteData.id;

            // Migrar sub-tablas
            if (r.controlAcarreo?.length) {
                await supabase.from('reporte_acarreo').insert(
                    r.controlAcarreo.map(item => ({ reporte_id: reporteId, ...item }))
                );
            }
            if (r.controlMaterial?.length) {
                await supabase.from('reporte_material').insert(
                    r.controlMaterial.map(item => ({ reporte_id: reporteId, ...item }))
                );
            }
            if (r.controlAgua?.length) {
                await supabase.from('reporte_agua').insert(
                    r.controlAgua.map(item => ({ reporte_id: reporteId, ...item }))
                );
            }
            if (r.controlMaquinaria?.length) {
                await supabase.from('reporte_maquinaria').insert(
                    r.controlMaquinaria.map(item => ({
                        reporte_id: reporteId,
                        tipo: item.tipo,
                        modelo: item.modelo,
                        numero_economico: item.numeroEconomico,
                        horas_operacion: item.horasOperacion,
                        operador: item.operador,
                        actividad: item.actividad,
                        vehiculo_id: vehicleMap.get(item.vehiculoId?.toString() || ''),
                        horometro_inicial: item.horometroInicial,
                        horometro_final: item.horometroFinal
                    }))
                );
            }

            // Migrar Historial
            if (r.historialModificaciones?.length) {
                for (const mod of r.historialModificaciones) {
                    const { data: modData } = await supabase
                        .from('reporte_historial')
                        .insert({
                            reporte_id: reporteId,
                            fecha_modificacion: mod.fechaModificacion,
                            usuario_nombre: mod.usuarioNombre,
                            observacion: mod.observacion
                        })
                        .select()
                        .single();

                    if (modData && mod.cambios?.length) {
                        await supabase.from('reporte_cambios').insert(
                            mod.cambios.map(c => ({
                                historial_id: modData.id,
                                campo: c.campo,
                                valor_anterior: c.valorAnterior,
                                valor_nuevo: c.valorNuevo
                            }))
                        );
                    }
                }
            }
        }

        console.log('✅ Migración completada con éxito');
    } catch (error) {
        console.error('❌ Error general en la migración:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

migrate();
