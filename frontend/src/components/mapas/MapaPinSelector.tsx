import React, { useRef, useState } from 'react';
import { exportarMapaConPinUnico } from '../../utils/mapaExporter';

interface MapaPinSelectorProps {
  mapaImagen: string; // Base64 o URL de la imagen
  pinX?: number; // Porcentaje 0-100
  pinY?: number; // Porcentaje 0-100
  onPinChange: (x: number, y: number) => void;
  onPinRemove: () => void;
  readOnly?: boolean;
}

const MapaPinSelector: React.FC<MapaPinSelectorProps> = ({
  mapaImagen,
  pinX,
  pinY,
  onPinChange,
  onPinRemove,
  readOnly = false
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanX, setStartPanX] = useState(0);
  const [startPanY, setStartPanY] = useState(0);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || isPanning) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calcular posición considerando zoom y pan
    const x = ((e.clientX - rect.left - panX) / (rect.width * zoom)) * 100;
    const y = ((e.clientY - rect.top - panY) / (rect.height * zoom)) * 100;

    onPinChange(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(1, Math.min(5, zoom + delta));
    setZoom(newZoom);

    // Resetear pan si volvemos a zoom 1
    if (newZoom === 1) {
      setPanX(0);
      setPanY(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom > 1) {
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

  const handleExportar = async () => {
    if (pinX === undefined || pinY === undefined) {
      alert('DEBE COLOCAR UN PIN ANTES DE EXPORTAR');
      return;
    }

    try {
      await exportarMapaConPinUnico(mapaImagen, pinX, pinY, 'mapa-ubicacion.png');
    } catch (error) {
      console.error('Error al exportar mapa:', error);
      alert('ERROR AL EXPORTAR EL MAPA');
    }
  };

  return (
    <div className="relative">
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

      <div
        ref={canvasRef}
        onClick={handleClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden ${!readOnly && !isPanning ? 'cursor-crosshair' : isPanning ? 'cursor-move' : ''
          }`}
      >
        <img
          src={mapaImagen}
          alt="Mapa del proyecto"
          className="w-full h-auto object-contain transition-transform duration-100"
          style={{
            transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
            transformOrigin: '0 0'
          }}
          draggable={false}
        />

        {pinX !== undefined && pinY !== undefined && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${pinX}%`,
              top: `${pinY}%`,
              pointerEvents: 'none'
            }}
          >
            <div className="relative">
              <svg
                width="32"
                height="42"
                viewBox="0 0 32 42"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                <path
                  d="M16 0C7.16344 0 0 7.16344 0 16C0 24.8366 16 42 16 42C16 42 32 24.8366 32 16C32 7.16344 24.8366 0 16 0Z"
                  fill="#EF4444"
                />
                <circle cx="16" cy="15" r="6" fill="white" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {pinX !== undefined && pinY !== undefined ? (
            <span>PIN COLOCADO: X={pinX.toFixed(1)}%, Y={pinY.toFixed(1)}%</span>
          ) : (
            <span>CLICK EN EL MAPA PARA COLOCAR EL PIN</span>
          )}
          {zoom > 1 && (
            <span className="ml-3 text-xs text-blue-600">
              ZOOM: {zoom.toFixed(1)}x | ARRASTRA PARA MOVER
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {pinX !== undefined && pinY !== undefined && (
            <button
              type="button"
              onClick={handleExportar}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              EXPORTAR IMAGEN
            </button>
          )}
          {!readOnly && pinX !== undefined && pinY !== undefined && (
            <button
              type="button"
              onClick={onPinRemove}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              ELIMINAR PIN
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapaPinSelector;
