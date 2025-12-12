import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { EstadisticasResponse } from '../../services/estadisticas.service';

interface Props {
    estadisticas: EstadisticasResponse;
}

const COLORS = ['#4C4EC9', '#6B6EC9', '#8B8EC9', '#ABABC9', '#CBCBC9'];

export const EstadisticasReporte: React.FC<Props> = ({ estadisticas }) => {
    return (
        <div className="space-y-8">
            {/* Header con resumen */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    📊 ANÁLISIS DE ACTIVIDADES
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Período</p>
                        <p className="text-lg font-semibold text-gray-800">
                            {new Date(estadisticas.rangoFechas.inicio).toLocaleDateString('es-MX')} - {new Date(estadisticas.rangoFechas.fin).toLocaleDateString('es-MX')}
                        </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total de Reportes</p>
                        <p className="text-3xl font-bold text-green-600">{estadisticas.totalReportes}</p>
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
                        <span className="mr-2">📦</span> CONTROL DE ACARREO
                    </h3>
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">Total Volumen: <span className="font-bold text-lg text-blue-600">{estadisticas.acarreo.totalVolumen.toLocaleString()} m³</span></p>
                        <p className="text-sm text-gray-600">Material más movido: <span className="font-semibold">{estadisticas.acarreo.materialMasMovido}</span></p>
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
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volumen (m³)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Porcentaje</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {estadisticas.acarreo.materiales.map((material, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.volumen.toLocaleString()}</td>
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
                        <span className="mr-2">🏗️</span> CONTROL DE MATERIAL
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
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {estadisticas.material.materiales.map((material, index) => (
                                    <tr key={index}>
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
                        <span className="mr-2">💧</span> CONTROL DE AGUA
                    </h3>
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">Total Volumen: <span className="font-bold text-lg text-blue-600">{estadisticas.agua.volumenTotal.toLocaleString()} m³</span></p>
                        <p className="text-sm text-gray-600">Origen más utilizado: <span className="font-semibold">{estadisticas.agua.origenMasUtilizado}</span></p>
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

                                >
                                    {estadisticas.agua.porOrigen.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value.toLocaleString()} m³`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Tabla de datos */}
                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origen</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volumen (m³)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Porcentaje</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {estadisticas.agua.porOrigen.map((origen, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{origen.origen}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{origen.volumen.toLocaleString()}</td>
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
                        <span className="mr-2">🚜</span> VEHÍCULOS
                    </h3>
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">Total Horas: <span className="font-bold text-lg text-blue-600">{estadisticas.vehiculos.totalHoras.toLocaleString()} hrs</span></p>
                        <p className="text-sm text-gray-600">Vehículo más utilizado: <span className="font-semibold">{estadisticas.vehiculos.vehiculoMasUtilizado}</span></p>
                    </div>
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

                    {/* Tabla de datos */}
                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Económico</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Porcentaje</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {estadisticas.vehiculos.vehiculos.map((vehiculo, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehiculo.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehiculo.noEconomico}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehiculo.horasOperacion.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehiculo.porcentaje}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
