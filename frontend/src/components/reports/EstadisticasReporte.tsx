import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { EstadisticasResponse } from '../../services/estadisticas.service';

interface Props {
    estadisticas: EstadisticasResponse;
}

const COLORS = ['#4C4EC9', '#6B6EC9', '#8B8EC9', '#ABABC9', '#CBCBC9'];

// Helper function para formatear fechas
const formatDate = (date: string): string => {
    // Agregar 'T00:00:00' para forzar interpretación como fecha local
    const localDate = new Date(date + 'T00:00:00');
    return localDate.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Mexico_City'
    });
};

export const EstadisticasReporte: React.FC<Props> = ({ estadisticas }) => {
    return (
        <div className="space-y-8">
            {/* Header con resumen */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    📊 ANÁLISIS DE ACTIVIDADES
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Período</p>
                        <p className="text-lg font-semibold text-gray-800">
                            {formatDate(estadisticas.rangoFechas.inicio)} - {formatDate(estadisticas.rangoFechas.fin)}
                        </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total de Reportes</p>
                        <p className="text-3xl font-bold text-green-600">{estadisticas.totalReportes}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Viajes Generales</p>
                        <p className="text-3xl font-bold text-yellow-600">{estadisticas.totalViajes?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Material Más Movido</p>
                        <p className="text-lg font-semibold text-purple-600">{estadisticas.acarreo.materialMasMovido}</p>
                    </div>
                </div>
            </div>

            {/* Control de Acarreo */}
            {estadisticas.acarreo.materiales.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2" role="img" aria-label="Paquete">📦</span> CONTROL DE ACARREO
                    </h3>
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-blue-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Total Volumen</p>
                            <p className="font-bold text-xl text-blue-600">{estadisticas.acarreo.totalVolumen.toLocaleString()} m³</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Total de Viajes</p>
                            <p className="font-bold text-xl text-green-600">{estadisticas.acarreo.totalViajes.toLocaleString()}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Material más movido</p>
                            <p className="font-semibold text-sm text-purple-600">{estadisticas.acarreo.materialMasMovido}</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={estadisticas.acarreo.materiales}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `${value.toLocaleString()} m³`} />
                            <Legend />
                            <Bar dataKey="volumen" fill="#4C4EC9" name="Volumen (m³)" />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Tabla de datos */}
                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <caption className="sr-only">Detalle de materiales de acarreo por volumen</caption>
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volumen (m³)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Viajes</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Porcentaje</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {estadisticas.acarreo.materiales.map((material) => (
                                    <tr key={`acarreo-${material.nombre}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.volumen.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.viajes.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.porcentaje}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Control de Material */}
            {estadisticas.material.materiales.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2" role="img" aria-label="Construcción">🏗️</span> CONTROL DE MATERIAL
                    </h3>
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">Material más utilizado: <span className="font-semibold">{estadisticas.material.materialMasUtilizado}</span></p>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={estadisticas.material.materiales}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="cantidad" fill="#6B6EC9" name="Cantidad" />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Tabla de datos */}
                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <caption className="sr-only">Detalle de materiales utilizados con cantidades</caption>
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {estadisticas.material.materiales.map((material) => (
                                    <tr key={`material-${material.nombre}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.cantidad.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.unidad}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Control de Agua */}
            {estadisticas.agua.porOrigen.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2" role="img" aria-label="Agua">💧</span> CONTROL DE AGUA
                    </h3>
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-blue-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Total Volumen</p>
                            <p className="font-bold text-xl text-blue-600">{estadisticas.agua.volumenTotal.toLocaleString()} m³</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Total de Viajes</p>
                            <p className="font-bold text-xl text-green-600">{estadisticas.agua.totalViajes.toLocaleString()}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Origen más utilizado</p>
                            <p className="font-semibold text-sm text-purple-600">{estadisticas.agua.origenMasUtilizado}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Gráfica de barras */}
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={estadisticas.agua.porOrigen}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="origen" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `${value.toLocaleString()} m³`} />
                                <Legend />
                                <Bar dataKey="volumen" fill="#8B8EC9" name="Volumen (m³)" />
                            </BarChart>
                        </ResponsiveContainer>

                        {/* Gráfica de pie */}
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={estadisticas.agua.porOrigen}
                                    dataKey="volumen"
                                    nameKey="origen"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                >
                                    {estadisticas.agua.porOrigen.map((origen, index) => (
                                        <Cell key={`cell-${origen.origen}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value.toLocaleString()} m³`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Tabla de datos */}
                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <caption className="sr-only">Detalle de volumen de agua por origen</caption>
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origen</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volumen (m³)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Viajes</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Porcentaje</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {estadisticas.agua.porOrigen.map((origen) => (
                                    <tr key={`agua-${origen.origen}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{origen.origen}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{origen.volumen.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{origen.viajes.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{origen.porcentaje}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Vehículos */}
            {estadisticas.vehiculos.vehiculos.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2" role="img" aria-label="Tractor">🚜</span> VEHÍCULOS
                    </h3>
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Total Horas</p>
                            <p className="font-bold text-xl text-blue-600">{estadisticas.vehiculos.totalHoras.toLocaleString()} hrs</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Vehículo más utilizado</p>
                            <p className="font-semibold text-sm text-purple-600">{estadisticas.vehiculos.vehiculoMasUtilizado}</p>
                        </div>
                    </div>

                    {/* Gráfica de Horas de Operación */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">Horas de Operación por Vehículo</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={estadisticas.vehiculos.vehiculos}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="noEconomico" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `${value.toLocaleString()} hrs`} />
                                <Legend />
                                <Bar dataKey="horasOperacion" fill="#ABABC9" name="Horas de Operación" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Tabla de Horas de Operación */}
                    <div className="mb-6 overflow-x-auto">
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">Distribución de Horas</h4>
                        <table className="min-w-full divide-y divide-gray-200">
                            <caption className="sr-only">Detalle de horas de operación por vehículo</caption>
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Económico</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Porcentaje</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {estadisticas.vehiculos.vehiculos.map((vehiculo) => (
                                    <tr key={`vehiculo-horas-${vehiculo.noEconomico}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehiculo.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehiculo.noEconomico}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehiculo.horasOperacion.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehiculo.porcentaje}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Tabla de Todos los Vehículos Utilizados */}
                    <div className="mb-6 overflow-x-auto">
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">Vehículos Utilizados</h4>
                        <table className="min-w-full divide-y divide-gray-200">
                            <caption className="sr-only">Lista completa de vehículos utilizados</caption>
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo de Vehículo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Económico</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horas</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {estadisticas.vehiculos.vehiculos.map((vehiculo) => (
                                    <tr key={`vehiculo-listado-${vehiculo.noEconomico}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehiculo.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehiculo.noEconomico}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehiculo.horasOperacion.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Gráfica de Vehículos por Tipo */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">Distribución por Tipo de Vehículo</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={Object.entries(
                                    estadisticas.vehiculos.vehiculos.reduce((acc, v) => {
                                        const tipo = v.nombre.split(' ')[0];
                                        acc[tipo] = (acc[tipo] || 0) + 1;
                                        return acc;
                                    }, {} as Record<string, number>)
                                ).map(([tipo, cantidad]) => ({ tipo, cantidad }))}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="tipo" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `${value} vehículo(s)`} />
                                <Legend />
                                <Bar dataKey="cantidad" fill="#6B6EC9" name="Cantidad de Vehículos" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};
