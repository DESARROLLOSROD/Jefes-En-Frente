import React, { useRef, useState } from 'react';
import { exportarMapaConPins } from '../../utils/mapaExporter';

interface Pin {
  id: string;
  pinX: number;
  pinY: number;
  etiqueta: string;
  color?: string;
}

interface MapaMultiplesPinsProps {
  mapaImagen: string;
  pins: Pin[];
  onPinsChange: (pins: Pin[]) => void;
  readOnly?: boolean;
}

const COLORES_DISPONIBLES = [
  '#EF4444', // Rojo
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Amarillo/Naranja
  '#8B5CF6', // Morado
  '#EC4899', // Rosa
  '#14B8A6', // Teal
  '#F97316'  // Naranja
];

const MapaMultiplesPins: React.FC<MapaMultiplesPinsProps> = ({
  mapaImagen,
  pins,
  onPinsChange,
  readOnly = false
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanX, setStartPanX] = useState(0);
  const [startPanY, setStartPanY] = useState(0);
  const [modoAgregar, setModoAgregar] = useState(false);
  const [colorSeleccionado, setColorSeleccionado] = useState(COLORES_DISPONIBLES[0]);
  const [etiquetaNueva, setEtiquetaNueva] = useState('');
  const [pinSeleccionado, setPinSeleccionado] = useState<string | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || isPanning || !modoAgregar) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calcular posición considerando zoom y pan
    const x = ((e.clientX - rect.left - panX) / (rect.width * zoom)) * 100;
    const y = ((e.clientY - rect.top - panY) / (rect.height * zoom)) * 100;

    // Crear nuevo pin
    const nuevoPin: Pin = {
      id: Date.now().toString(),
      pinX: Math.max(0, Math.min(100, x)),
      pinY: Math.max(0, Math.min(100, y)),
      etiqueta: etiquetaNueva || `PIN ${pins.length + 1}`,
      color: colorSeleccionado
    };

    onPinsChange([...pins, nuevoPin]);
    setEtiquetaNueva('');
    setModoAgregar(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(1, Math.min(5, zoom + delta));
    setZoom(newZoom);

    if (newZoom === 1) {
      setPanX(0);
      setPanY(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom > 1 && !modoAgregar) {
      setIsPanning(true);
      setStartPanX(e.clientX - panX);
      setStartPanY(e.clientY - panY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning && zoom > 1) {
      setPanX(e.clientX - startPanX);
      setPanY(e.clientY - startPanY);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const resetZoom = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const eliminarPin = (id: string) => {
    onPinsChange(pins.filter(p => p.id !== id));
    if (pinSeleccionado === id) {
      setPinSeleccionado(null);
    }
  };

  const actualizarEtiqueta = (id: string, nuevaEtiqueta: string) => {
    onPinsChange(pins.map(p => p.id === id ? { ...p, etiqueta: nuevaEtiqueta } : p));
  };

  const handleExportar = async () => {
    if (pins.length === 0) {
      alert('DEBE COLOCAR AL MENOS UN PIN ANTES DE EXPORTAR');
      return;
    }

    try {
      await exportarMapaConPins(mapaImagen, pins, 'mapa-multiples-ubicaciones.png');
    } catch (error) {
      console.error('Error al exportar mapa:', error);
      alert('ERROR AL EXPORTAR EL MAPA');
    }
  };

  return (
    <div className="relative">
      {/* Controles superiores */}
      <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-3 items-center">
          {!readOnly && (
            <>
              {!modoAgregar ? (
                <button
                  type="button"
                  onClick={() => setModoAgregar(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
                >
                  + AGREGAR PIN
                </button>
              ) : (
                <div className="flex gap-2 items-center flex-wrap">
                  <input
                    type="text"
                    value={etiquetaNueva}
                    onChange={(e) => setEtiquetaNueva(e.target.value.toUpperCase())}
                    placeholder="ETIQUETA (OPCIONAL)"
                    className="border rounded px-3 py-2 text-sm uppercase"
                    style={{ width: '200px' }}
                  />
                  <div className="flex gap-1">
                    {COLORES_DISPONIBLES.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setColorSeleccionado(color)}
                        className={`w-8 h-8 rounded border-2 ${colorSeleccionado === color ? 'border-black' : 'border-gray-300'}`}
                        style={{ backgroundColor: color }}
                        title={`Color ${color}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setModoAgregar(false);
                      setEtiquetaNueva('');
                    }}
                    className="bg-gray-400 text-white px-3 py-2 rounded hover:bg-gray-500 text-sm"
                  >
                    CANCELAR
                  </button>
                </div>
              )}
              <div className="text-xs text-gray-600">
                {modoAgregar ? 'CLICK EN EL MAPA PARA COLOCAR PIN' : `PINS: ${pins.length}`}
              </div>
            </>
          )}
          {pins.length > 0 && (
            <button
              type="button"
              onClick={handleExportar}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold"
            >
              EXPORTAR IMAGEN
            </button>
          )}
        </div>
      </div>

      {/* Controles de zoom */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 bg-white rounded-lg shadow-md p-2">
        <button
          type="button"
          onClick={() => setZoom(Math.min(5, zoom + 0.5))}
          className="w-8 h-8 bg-white hover:bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-lg font-bold"
          title="Acercar zoom"
        >
          +
        </button>
        <div className="text-xs text-center font-semibold">{zoom.toFixed(1)}x</div>
        <button
          type="button"
          onClick={() => setZoom(Math.max(1, zoom - 0.5))}
          className="w-8 h-8 bg-white hover:bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-lg font-bold"
          title="Alejar zoom"
        >
          -
        </button>
        {zoom > 1 && (
          <button
            type="button"
            onClick={resetZoom}
            className="w-8 h-8 bg-white hover:bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-xs font-bold"
            title="Resetear zoom"
          >
            ⟲
          </button>
        )}
      </div>

      {/* Mapa con pins */}
      <div
        ref={canvasRef}
        onClick={handleClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden ${
          modoAgregar ? 'cursor-crosshair' : isPanning ? 'cursor-move' : ''
        }`}
        style={{ minHeight: '400px' }}
      >
        <img
          src={mapaImagen}
          alt="Mapa del proyecto"
          className="w-full h-full object-contain transition-transform duration-100"
          style={{
            transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
            transformOrigin: '0 0'
          }}
          draggable={false}
        />

        {/* Renderizar pins */}
        {pins.map(pin => (
          <div
            key={pin.id}
            className="absolute transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${pin.pinX * zoom + panX / zoom}%`,
              top: `${pin.pinY * zoom + panY / zoom}%`,
              pointerEvents: 'auto'
            }}
          >
            <div className="relative group">
              <svg
                width="32"
                height="42"
                viewBox="0 0 32 42"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setPinSeleccionado(pin.id);
                }}
              >
                <path
                  d="M16 0C7.16344 0 0 7.16344 0 16C0 24.8366 16 42 16 42C16 42 32 24.8366 32 16C32 7.16344 24.8366 0 16 0Z"
                  fill={pin.color || '#EF4444'}
                />
                <circle cx="16" cy="15" r="6" fill="white" />
              </svg>
              {/* Tooltip con etiqueta */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                {pin.etiqueta}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lista de pins */}
      {pins.length > 0 && (
        <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
          <h4 className="font-semibold text-sm mb-2 text-gray-700">PINS COLOCADOS:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {pins.map(pin => (
              <div
                key={pin.id}
                className={`flex items-center justify-between p-2 rounded ${
                  pinSeleccionado === pin.id ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: pin.color || '#EF4444' }}
                  />
                  {!readOnly && pinSeleccionado === pin.id ? (
                    <input
                      type="text"
                      value={pin.etiqueta}
                      onChange={(e) => actualizarEtiqueta(pin.id, e.target.value.toUpperCase())}
                      className="border rounded px-2 py-1 text-xs flex-1 uppercase"
                      onBlur={() => setPinSeleccionado(null)}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="text-xs font-medium flex-1 cursor-pointer"
                      onClick={() => !readOnly && setPinSeleccionado(pin.id)}
                    >
                      {pin.etiqueta}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    X:{pin.pinX.toFixed(1)}% Y:{pin.pinY.toFixed(1)}%
                  </span>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => eliminarPin(pin.id)}
                    className="text-red-600 hover:text-red-800 text-xs ml-2"
                  >
                    ELIMINAR
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {zoom > 1 && (
        <div className="mt-2 text-xs text-center text-blue-600">
          ZOOM: {zoom.toFixed(1)}x | ARRASTRA PARA MOVER
        </div>
      )}
    </div>
  );
};

export default MapaMultiplesPins;
