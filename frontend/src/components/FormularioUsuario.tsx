import React, { useState, useEffect } from 'react';
import { Usuario, CrearUsuarioDTO, ActualizarUsuarioDTO } from '../types/usuario.types';
import { Proyecto } from '../types/auth';
import { authService } from '../services/auth';

interface FormularioUsuarioProps {
    usuario?: Usuario | null;
    onClose: () => void;
    onGuardar: (data: CrearUsuarioDTO | ActualizarUsuarioDTO, id?: string) => void;
}

const FormularioUsuario: React.FC<FormularioUsuarioProps> = ({ usuario, onClose, onGuardar }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'operador' as 'admin' | 'supervisor' | 'operador',
        proyectos: [] as string[],
        activo: true
    });

    const [proyectosDisponibles, setProyectosDisponibles] = useState<Proyecto[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        cargarProyectos();
        if (usuario) {
            setFormData({
                nombre: usuario.nombre,
                email: usuario.email,
                password: '',
                rol: usuario.rol,
                proyectos: usuario.proyectos.map((p: any) => p._id || p),
                activo: usuario.activo
            });
        }
    }, [usuario]);

    const cargarProyectos = async () => {
        const response = await authService.obtenerProyectos();
        if (response.success && response.data) {
            setProyectosDisponibles(response.data);
        }
    };

    const validarFormulario = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!usuario && !formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        setLoading(true);

        try {
            if (usuario) {
                // Actualizar - no enviar password si está vacío
                const dataActualizar: ActualizarUsuarioDTO = {
                    nombre: formData.nombre,
                    email: formData.email,
                    rol: formData.rol,
                    proyectos: formData.proyectos,
                    activo: formData.activo
                };
                if (formData.password) {
                    dataActualizar.password = formData.password;
                }
                onGuardar(dataActualizar, usuario._id);
            } else {
                // Crear
                const dataCrear: CrearUsuarioDTO = {
                    nombre: formData.nombre,
                    email: formData.email,
                    password: formData.password,
                    rol: formData.rol,
                    proyectos: formData.proyectos,
                    activo: formData.activo
                };
                onGuardar(dataCrear);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProyectoToggle = (proyectoId: string) => {
        setFormData(prev => ({
            ...prev,
            proyectos: prev.proyectos.includes(proyectoId)
                ? prev.proyectos.filter(id => id !== proyectoId)
                : [...prev.proyectos, proyectoId]
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
                    <h2 className="text-2xl font-bold">
                        {usuario ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
                    </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Nombre */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Nombre Completo *
                        </label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nombre ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Ej: Juan Pérez"
                        />
                        {errors.nombre && (
                            <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="usuario@ejemplo.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Contraseña {usuario ? '(dejar vacío para mantener actual)' : '*'}
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder={usuario ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Rol */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Rol *
                        </label>
                        <select
                            value={formData.rol}
                            onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="operador">Operador</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    {/* Proyectos */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Proyectos Asignados
                        </label>
                        <div className="border border-gray-300 rounded-lg p-4 max-h-40 overflow-y-auto space-y-2">
                            {proyectosDisponibles.length === 0 ? (
                                <p className="text-gray-500 text-sm">No hay proyectos disponibles</p>
                            ) : (
                                proyectosDisponibles.map((proyecto) => (
                                    <label key={proyecto._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                        <input
                                            type="checkbox"
                                            checked={formData.proyectos.includes(proyecto._id!)}
                                            onChange={() => handleProyectoToggle(proyecto._id!)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">
                                            {proyecto.nombre} - {proyecto.ubicacion}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Activo */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="activo"
                            checked={formData.activo}
                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="activo" className="text-gray-700 font-semibold cursor-pointer">
                            Usuario Activo
                        </label>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : usuario ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormularioUsuario;
