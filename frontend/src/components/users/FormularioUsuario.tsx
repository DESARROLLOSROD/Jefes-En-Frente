import React, { useState, useEffect } from 'react';
import { Usuario, CrearUsuarioDTO, ActualizarUsuarioDTO } from '../../types/usuario.types';
import { Proyecto } from '../../types/auth';
import { authService } from '../../services/auth';

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
        rol: 'jefe en frente' as 'admin' | 'supervisor' | 'jefe en frente',
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
            newErrors.nombre = 'EL NOMBRE ES REQUERIDO';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'EL EMAIL ES REQUERIDO';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'EMAIL INVÁLIDO';
        }

        if (!usuario && !formData.password) {
            newErrors.password = 'LA CONTRASEÑA ES REQUERIDA';
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'LA CONTRASEÑA DEBE TENER AL MENOS 6 CARACTERES';
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
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg flex-none">
                    <h2 className="text-2xl font-bold">
                        {usuario ? '✏️ EDITAR USUARIO' : '➕ NUEVO USUARIO'}
                    </h2>
                </div>

                {/* Form */}
                <div className="overflow-y-auto flex-1 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nombre */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                NOMBRE COMPLETO *
                            </label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${errors.nombre ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="EJ: JUAN PÉREZ"
                            />
                            {errors.nombre && (
                                <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                EMAIL *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="USUARIO@EJEMPLO.COM"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                CONTRASEÑA {usuario ? '(DEJAR VACÍO PARA MANTENER ACTUAL)' : '*'}
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder={usuario ? 'NUEVA CONTRASEÑA (OPCIONAL)' : 'MÍNIMO 6 CARACTERES'}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Rol */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                ROL *
                            </label>
                            <select
                                value={formData.rol}
                                onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                            >
                                <option value="jefe en frente">JEFE EN FRENTE</option>
                                <option value="supervisor">SUPERVISOR</option>
                                <option value="admin">ADMINISTRADOR</option>
                            </select>
                        </div>

                        {/* Proyectos */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                PROYECTOS ASIGNADOS
                            </label>
                            <div className="border border-gray-300 rounded-lg p-4 max-h-40 overflow-y-auto space-y-2">
                                {proyectosDisponibles.length === 0 ? (
                                    <p className="text-gray-500 text-sm">NO HAY PROYECTOS DISPONIBLES</p>
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
                                USUARIO ACTIVO
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
                                CANCELAR
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? 'GUARDANDO...' : usuario ? 'ACTUALIZAR' : 'CREAR'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormularioUsuario;
