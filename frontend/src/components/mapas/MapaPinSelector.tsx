import React, { useRef } from 'react';

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

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onPinChange(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
  };

  return (
    <div className="relative">
      <div
        ref={canvasRef}
        onClick={handleClick}
        className={`relative w-full bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden ${!readOnly ? 'cursor-crosshair' : ''}`}
        style={{ minHeight: '400px' }}
      >
        <img
          src={mapaImagen}
          alt="Mapa del proyecto"
          className="w-full h-full object-contain"
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
        </div>
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
  );
};

export default MapaPinSelector;
