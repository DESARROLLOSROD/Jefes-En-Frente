import React, { useState, useEffect } from 'react';
import { bibliotecaMapaService, BibliotecaMapa } from '../../services/bibliotecaMapa.service';
import { comprimirImagen, formatearTamano } from '../../utils/imageCompressor';

interface BibliotecaMapasProps {
  onSeleccionarMapa?: (mapa: BibliotecaMapa) => void;
  modoSeleccion?: boolean;
}

const CATEGORIAS = ['GENERAL', 'CONSTRUCCIÓN', 'MINERÍA', 'TOPOGRAFÍA', 'PLANOS', 'OTROS'];

const BibliotecaMapas: React.FC<BibliotecaMapasProps> = ({ onSeleccionarMapa, modoSeleccion = false }) => {
  const [mapas, setMapas] = useState<BibliotecaMapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODOS');
  const [comprimiendo, setComprimiendo] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'GENERAL',
    imagen: null as { data: string; contentType: string } | null,
    width: 0,
    height: 0,
    etiquetas: [] as string[],
    esPublico: false
  });

  const [previewMapa, setPreviewMapa] = useState<string>('');
  const [etiquetaInput, setEtiquetaInput] = useState('');

  useEffect(() => {
    cargarMapas();
  }, []);

  const cargarMapas = async () => {
    setLoading(true);
    const response = await bibliotecaMapaService.obtenerMapas();
    if (response.success && response.data) {
      setMapas(response.data);
      setError('');
    } else {
      setError(response.error || 'ERROR AL CARGAR BIBLIOTECA');
    }
    setLoading(false);
  };

  const handleMapaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('LA IMAGEN NO DEBE SUPERAR 10MB');
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('SOLO SE PERMITEN IMÁGENES PNG O JPG');
      return;
    }

    try {
      setComprimiendo(true);

      const resultado = await comprimirImagen(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85
      });

      setFormData({
        ...formData,
        imagen: {
          data: resultado.base64,
          contentType: resultado.contentType
        },
        width: resultado.width,
        height: resultado.height
      });

      setPreviewMapa(`data:${resultado.contentType};base64,${resultado.base64}`);
    } catch (error) {
      console.error('Error al comprimir imagen:', error);
      alert('ERROR AL PROCESAR LA IMAGEN');
    } finally {
      setComprimiendo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imagen) {
      alert('DEBE SELECCIONAR UNA IMAGEN');
      return;
    }

    const response = await bibliotecaMapaService.crearMapa(formData);
    if (response.success) {
      cargarMapas();
      cerrarModal();
    } else {
      alert(response.error || 'ERROR AL GUARDAR MAPA');
    }
  };

  const handleEliminar = async (id: string) => {
    if (window.confirm('¿ESTÁS SEGURO DE ELIMINAR ESTE MAPA?')) {
      const response = await bibliotecaMapaService.eliminarMapa(id);
      if (response.success) {
        cargarMapas();
      } else {
        alert(response.error || 'ERROR AL ELIMINAR MAPA');
      }
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setFormData({
      nombre: '',
      descripcion: '',
      categoria: 'GENERAL',
      imagen: null,
      width: 0,
      height: 0,
      etiquetas: [],
      esPublico: false
    });
    setPreviewMapa('');
    setEtiquetaInput('');
  };

  const agregarEtiqueta = () => {
    if (etiquetaInput.trim() && !formData.etiquetas.includes(etiquetaInput.trim().toUpperCase())) {
      setFormData({
        ...formData,
        etiquetas: [...formData.etiquetas, etiquetaInput.trim().toUpperCase()]
      });
      setEtiquetaInput('');
    }
  };

  const eliminarEtiqueta = (etiqueta: string) => {
    setFormData({
      ...formData,
      etiquetas: formData.etiquetas.filter(e => e !== etiqueta)
    });
  };

  const mapasFiltrados = categoriaFiltro === 'TODOS'
    ? mapas
    : mapas.filter(m => m.categoria === categoriaFiltro);

  if (loading) return <div className="text-center p-8">CARGANDO BIBLIOTECA...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">BIBLIOTECA DE MAPAS</h2>
        {!modoSeleccion && (
          <button
            onClick={() => setMostrarModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + AGREGAR MAPA
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtro por categoría */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setCategoriaFiltro('TODOS')}
          className={`px-4 py-2 rounded ${categoriaFiltro === 'TODOS' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          TODOS ({mapas.length})
        </button>
        {CATEGORIAS.map(cat => {
          const count = mapas.filter(m => m.categoria === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={`px-4 py-2 rounded ${categoriaFiltro === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid de mapas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mapasFiltrados.map((mapa) => (
          <div key={mapa._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-100 relative">
              <img
                src={`data:${mapa.imagen.contentType};base64,${mapa.imagen.data}`}
                alt={mapa.nombre}
                className="w-full h-full object-contain"
              />
              {mapa.esPublico && (
                <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  PÚBLICO
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{mapa.nombre}</h3>
              <p className="text-xs text-gray-500 mb-2">{mapa.categoria}</p>
              <p className="text-sm text-gray-600 mb-3">{mapa.descripcion}</p>
              {mapa.etiquetas.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {mapa.etiquetas.map(etiqueta => (
                    <span key={etiqueta} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {etiqueta}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {mapa.width}x{mapa.height}px
                </span>
                <div className="flex gap-2">
                  {modoSeleccion && onSeleccionarMapa && (
                    <button
                      onClick={() => onSeleccionarMapa(mapa)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                    >
                      USAR
                    </button>
                  )}
                  <button
                    onClick={() => handleEliminar(mapa._id!)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    ELIMINAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mapasFiltrados.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          NO HAY MAPAS EN ESTA CATEGORÍA
        </div>
      )}

      {/* Modal para agregar mapa */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full m-4">
            <h3 className="text-xl font-bold mb-4">AGREGAR MAPA A BIBLIOTECA</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase">NOMBRE *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                  className="w-full border rounded px-3 py-2 uppercase"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase">DESCRIPCIÓN *</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value.toUpperCase() })}
                  className="w-full border rounded px-3 py-2 uppercase"
                  rows={3}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase">CATEGORÍA *</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  {CATEGORIAS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase">
                  ETIQUETAS (Opcional)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={etiquetaInput}
                    onChange={(e) => setEtiquetaInput(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarEtiqueta())}
                    className="flex-1 border rounded px-3 py-2 uppercase"
                    placeholder="AGREGAR ETIQUETA"
                  />
                  <button
                    type="button"
                    onClick={agregarEtiqueta}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.etiquetas.map(etiqueta => (
                    <span key={etiqueta} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                      {etiqueta}
                      <button
                        type="button"
                        onClick={() => eliminarEtiqueta(etiqueta)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.esPublico}
                    onChange={(e) => setFormData({ ...formData, esPublico: e.target.checked })}
                  />
                  <span className="text-sm font-semibold">HACER PÚBLICO (visible para todos)</span>
                </label>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase">IMAGEN DEL MAPA *</label>
                {comprimiendo && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-3">
                    COMPRIMIENDO IMAGEN...
                  </div>
                )}
                {previewMapa ? (
                  <div className="relative">
                    <img src={previewMapa} alt="Preview" className="w-full h-64 object-contain border rounded bg-gray-50" />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, imagen: null, width: 0, height: 0 });
                        setPreviewMapa('');
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      ELIMINAR
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleMapaChange}
                    className="w-full border rounded px-3 py-2"
                    disabled={comprimiendo}
                    required
                  />
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={comprimiendo}
                >
                  GUARDAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BibliotecaMapas;
