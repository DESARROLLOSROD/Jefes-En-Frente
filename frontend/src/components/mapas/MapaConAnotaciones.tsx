import React, { useRef, useState } from 'react';

interface Pin {
  id: string;
  pinX: number;
  pinY: number;
  etiqueta: string;
  color?: string;
}

interface TextoAnotacion {
  id: string;
  x: number;
  y: number;
  texto: string;
  color: string;
  fontSize: number;
}

interface DibujoLibre {
  id: string;
  puntos: { x: number; y: number }[];
  color: string;
  grosor: number;
  tipo: 'linea' | 'flecha';
}

interface Forma {
  id: string;
  tipo: 'rectangulo' | 'circulo';
  x: number;
  y: number;
  ancho?: number;
  alto?: number;
  radio?: number;
  color: string;
  relleno: boolean;
}

interface Medida {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  distancia: number;
  color: string;
}

interface MapaConAnotacionesProps {
  mapaImagen: string;
  pins: Pin[];
  onPinsChange: (pins: Pin[]) => void;
  textos?: TextoAnotacion[];
  onTextosChange?: (textos: TextoAnotacion[]) => void;
  dibujos?: DibujoLibre[];
  onDibujosChange?: (dibujos: DibujoLibre[]) => void;
  formas?: Forma[];
  onFormasChange?: (formas: Forma[]) => void;
  medidas?: Medida[];
  onMedidasChange?: (medidas: Medida[]) => void;
  readOnly?: boolean;
}

const COLORES_DISPONIBLES = [
  '#EF4444', // Rojo
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Amarillo
  '#8B5CF6', // Morado
  '#EC4899', // Rosa
  '#14B8A6', // Teal
  '#F97316'  // Naranja
];

type HerramientaActiva = 'pin' | 'texto' | 'dibujo' | 'rectangulo' | 'circulo' | 'medida' | null;

const MapaConAnotaciones: React.FC<MapaConAnotacionesProps> = ({
  mapaImagen,
  pins,
  onPinsChange,
  textos = [],
  onTextosChange = () => {},
  dibujos = [],
  onDibujosChange = () => {},
  formas = [],
  onFormasChange = () => {},
  medidas = [],
  onMedidasChange = () => {},
  readOnly = false
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanX, setStartPanX] = useState(0);
  const [startPanY, setStartPanY] = useState(0);

  // Estados para herramientas
  const [herramientaActiva, setHerramientaActiva] = useState<HerramientaActiva>(null);
  const [colorSeleccionado, setColorSeleccionado] = useState(COLORES_DISPONIBLES[0]);
  const [grosorLinea, setGrosorLinea] = useState(2);
  const [tamañoTexto, setTamañoTexto] = useState(14);

  // Estados para creación de elementos
  const [etiquetaNueva, setEtiquetaNueva] = useState('');
  const [textoNuevo, setTextoNuevo] = useState('');
  const [dibujandoLinea, setDibujandoLinea] = useState(false);
  const [puntosLinea, setPuntosLinea] = useState<{ x: number; y: number }[]>([]);
  const [puntoInicialForma, setPuntoInicialForma] = useState<{ x: number; y: number } | null>(null);
  const [puntoInicialMedida, setPuntoInicialMedida] = useState<{ x: number; y: number } | null>(null);

  const [elementoSeleccionado, setElementoSeleccionado] = useState<string | null>(null);
  const [tipoElementoSeleccionado, setTipoElementoSeleccionado] = useState<'pin' | 'texto' | 'dibujo' | 'forma' | 'medida' | null>(null);

  const getCoordinatesFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const x = ((e.clientX - rect.left - panX) / (rect.width * zoom)) * 100;
    const y = ((e.clientY - rect.top - panY) / (rect.height * zoom)) * 100;

    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || isPanning) return;

    const coords = getCoordinatesFromEvent(e);
    if (!coords) return;

    switch (herramientaActiva) {
      case 'pin':
        agregarPin(coords.x, coords.y);
        break;
      case 'texto':
        if (textoNuevo.trim()) {
          agregarTexto(coords.x, coords.y);
        }
        break;
      case 'dibujo':
        if (!dibujandoLinea) {
          setDibujandoLinea(true);
          setPuntosLinea([coords]);
        } else {
          setPuntosLinea([...puntosLinea, coords]);
        }
        break;
      case 'rectangulo':
      case 'circulo':
        if (!puntoInicialForma) {
          setPuntoInicialForma(coords);
        } else {
          agregarForma(puntoInicialForma, coords);
          setPuntoInicialForma(null);
        }
        break;
      case 'medida':
        if (!puntoInicialMedida) {
          setPuntoInicialMedida(coords);
        } else {
          agregarMedida(puntoInicialMedida, coords);
          setPuntoInicialMedida(null);
        }
        break;
    }
  };

  const agregarPin = (x: number, y: number) => {
    const nuevoPin: Pin = {
      id: Date.now().toString(),
      pinX: x,
      pinY: y,
      etiqueta: etiquetaNueva || `PIN ${pins.length + 1}`,
      color: colorSeleccionado
    };
    onPinsChange([...pins, nuevoPin]);
    setEtiquetaNueva('');
  };

  const agregarTexto = (x: number, y: number) => {
    const nuevoTexto: TextoAnotacion = {
      id: Date.now().toString(),
      x,
      y,
      texto: textoNuevo,
      color: colorSeleccionado,
      fontSize: tamañoTexto
    };
    onTextosChange([...textos, nuevoTexto]);
    setTextoNuevo('');
  };

  const finalizarDibujo = () => {
    if (puntosLinea.length >= 2) {
      const nuevoDibujo: DibujoLibre = {
        id: Date.now().toString(),
        puntos: puntosLinea,
        color: colorSeleccionado,
        grosor: grosorLinea,
        tipo: 'linea'
      };
      onDibujosChange([...dibujos, nuevoDibujo]);
    }
    setDibujandoLinea(false);
    setPuntosLinea([]);
  };

  const agregarForma = (inicio: { x: number; y: number }, fin: { x: number; y: number }) => {
    const nuevaForma: Forma = {
      id: Date.now().toString(),
      tipo: herramientaActiva as 'rectangulo' | 'circulo',
      x: inicio.x,
      y: inicio.y,
      ancho: herramientaActiva === 'rectangulo' ? Math.abs(fin.x - inicio.x) : undefined,
      alto: herramientaActiva === 'rectangulo' ? Math.abs(fin.y - inicio.y) : undefined,
      radio: herramientaActiva === 'circulo' ? Math.sqrt(Math.pow(fin.x - inicio.x, 2) + Math.pow(fin.y - inicio.y, 2)) : undefined,
      color: colorSeleccionado,
      relleno: false
    };
    onFormasChange([...formas, nuevaForma]);
  };

  const agregarMedida = (inicio: { x: number; y: number }, fin: { x: number; y: number }) => {
    const distancia = Math.sqrt(Math.pow(fin.x - inicio.x, 2) + Math.pow(fin.y - inicio.y, 2));
    const nuevaMedida: Medida = {
      id: Date.now().toString(),
      x1: inicio.x,
      y1: inicio.y,
      x2: fin.x,
      y2: fin.y,
      distancia: parseFloat(distancia.toFixed(2)),
      color: colorSeleccionado
    };
    onMedidasChange([...medidas, nuevaMedida]);
  };

  const eliminarElemento = () => {
    if (!elementoSeleccionado || !tipoElementoSeleccionado) return;

    switch (tipoElementoSeleccionado) {
      case 'pin':
        onPinsChange(pins.filter(p => p.id !== elementoSeleccionado));
        break;
      case 'texto':
        onTextosChange(textos.filter(t => t.id !== elementoSeleccionado));
        break;
      case 'dibujo':
        onDibujosChange(dibujos.filter(d => d.id !== elementoSeleccionado));
        break;
      case 'forma':
        onFormasChange(formas.filter(f => f.id !== elementoSeleccionado));
        break;
      case 'medida':
        onMedidasChange(medidas.filter(m => m.id !== elementoSeleccionado));
        break;
    }
    setElementoSeleccionado(null);
    setTipoElementoSeleccionado(null);
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
    if (zoom > 1 && !herramientaActiva) {
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

  const cancelarHerramienta = () => {
    setHerramientaActiva(null);
    setDibujandoLinea(false);
    setPuntosLinea([]);
    setPuntoInicialForma(null);
    setPuntoInicialMedida(null);
    setTextoNuevo('');
    setEtiquetaNueva('');
  };

  return (
    <div className="relative">
      {/* Panel de herramientas */}
      {!readOnly && (
        <div className="mb-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setHerramientaActiva('pin')}
              className={`px-3 py-2 rounded font-semibold text-sm ${
                herramientaActiva === 'pin' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'
              }`}
            >
              📍 PIN
            </button>
            <button
              type="button"
              onClick={() => setHerramientaActiva('texto')}
              className={`px-3 py-2 rounded font-semibold text-sm ${
                herramientaActiva === 'texto' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'
              }`}
            >
              📝 TEXTO
            </button>
            <button
              type="button"
              onClick={() => setHerramientaActiva('dibujo')}
              className={`px-3 py-2 rounded font-semibold text-sm ${
                herramientaActiva === 'dibujo' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'
              }`}
            >
              ✏️ DIBUJAR
            </button>
            <button
              type="button"
              onClick={() => setHerramientaActiva('rectangulo')}
              className={`px-3 py-2 rounded font-semibold text-sm ${
                herramientaActiva === 'rectangulo' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'
              }`}
            >
              ▭ RECTÁNGULO
            </button>
            <button
              type="button"
              onClick={() => setHerramientaActiva('circulo')}
              className={`px-3 py-2 rounded font-semibold text-sm ${
                herramientaActiva === 'circulo' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'
              }`}
            >
              ⭕ CÍRCULO
            </button>
            <button
              type="button"
              onClick={() => setHerramientaActiva('medida')}
              className={`px-3 py-2 rounded font-semibold text-sm ${
                herramientaActiva === 'medida' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'
              }`}
            >
              📏 MEDIDA
            </button>
          </div>

          {/* Opciones según herramienta activa */}
          {herramientaActiva && (
            <div className="space-y-2 p-3 bg-white rounded border border-gray-200">
              {/* Selector de color */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Color:</span>
                {COLORES_DISPONIBLES.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setColorSeleccionado(color)}
                    className={`w-8 h-8 rounded border-2 ${
                      colorSeleccionado === color ? 'border-black' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Opciones específicas por herramienta */}
              {herramientaActiva === 'pin' && (
                <input
                  type="text"
                  value={etiquetaNueva}
                  onChange={(e) => setEtiquetaNueva(e.target.value.toUpperCase())}
                  placeholder="ETIQUETA DEL PIN"
                  className="w-full border rounded px-3 py-2 text-sm uppercase"
                />
              )}

              {herramientaActiva === 'texto' && (
                <>
                  <input
                    type="text"
                    value={textoNuevo}
                    onChange={(e) => setTextoNuevo(e.target.value.toUpperCase())}
                    placeholder="TEXTO A AGREGAR"
                    className="w-full border rounded px-3 py-2 text-sm uppercase"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Tamaño:</span>
                    <input
                      type="range"
                      min="12"
                      max="32"
                      value={tamañoTexto}
                      onChange={(e) => setTamañoTexto(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{tamañoTexto}px</span>
                  </div>
                </>
              )}

              {herramientaActiva === 'dibujo' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Grosor:</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={grosorLinea}
                      onChange={(e) => setGrosorLinea(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{grosorLinea}px</span>
                  </div>
                  {dibujandoLinea && (
                    <button
                      type="button"
                      onClick={finalizarDibujo}
                      className="w-full bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                    >
                      FINALIZAR DIBUJO
                    </button>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={cancelarHerramienta}
                className="w-full bg-gray-400 text-white px-3 py-2 rounded hover:bg-gray-500"
              >
                CANCELAR
              </button>
            </div>
          )}

          {/* Información */}
          <div className="mt-2 text-xs text-gray-600">
            {herramientaActiva === 'pin' && 'Click en el mapa para colocar un pin'}
            {herramientaActiva === 'texto' && 'Escribe el texto y haz click donde quieras colocarlo'}
            {herramientaActiva === 'dibujo' && (dibujandoLinea ? 'Click para agregar puntos. Finaliza el dibujo cuando termines' : 'Click en el mapa para comenzar a dibujar')}
            {(herramientaActiva === 'rectangulo' || herramientaActiva === 'circulo') && (puntoInicialForma ? 'Click en el punto final' : 'Click en el punto inicial')}
            {herramientaActiva === 'medida' && (puntoInicialMedida ? 'Click en el punto final para medir' : 'Click en el punto inicial')}
            {!herramientaActiva && `Total: ${pins.length} pins, ${textos.length} textos, ${dibujos.length} dibujos, ${formas.length} formas, ${medidas.length} medidas`}
          </div>
        </div>
      )}

      {/* Controles de zoom */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 bg-white rounded-lg shadow-md p-2">
        <button
          type="button"
          onClick={() => setZoom(Math.min(5, zoom + 0.5))}
          className="w-8 h-8 bg-white hover:bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-lg font-bold"
        >
          +
        </button>
        <div className="text-xs text-center font-semibold">{zoom.toFixed(1)}x</div>
        <button
          type="button"
          onClick={() => setZoom(Math.max(1, zoom - 0.5))}
          className="w-8 h-8 bg-white hover:bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-lg font-bold"
        >
          -
        </button>
        {zoom > 1 && (
          <button
            type="button"
            onClick={resetZoom}
            className="w-8 h-8 bg-white hover:bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-xs font-bold"
          >
            ⟲
          </button>
        )}
      </div>

      {/* Mapa con anotaciones */}
      <div
        ref={canvasRef}
        onClick={handleMapClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden ${
          herramientaActiva ? 'cursor-crosshair' : isPanning ? 'cursor-move' : ''
        }`}
        style={{ minHeight: '500px' }}
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

        {/* SVG overlay para dibujos, formas y medidas */}
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
            transformOrigin: '0 0'
          }}
        >
          {/* Dibujos libres */}
          {dibujos.map(dibujo => (
            <polyline
              key={dibujo.id}
              points={dibujo.puntos.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={dibujo.color}
              strokeWidth={dibujo.grosor * 0.1}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setElementoSeleccionado(dibujo.id);
                setTipoElementoSeleccionado('dibujo');
              }}
            />
          ))}

          {/* Dibujo temporal */}
          {dibujandoLinea && puntosLinea.length > 0 && (
            <polyline
              points={puntosLinea.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={colorSeleccionado}
              strokeWidth={grosorLinea * 0.1}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
            />
          )}

          {/* Formas */}
          {formas.map(forma => (
            <g key={forma.id}>
              {forma.tipo === 'rectangulo' && (
                <rect
                  x={forma.x}
                  y={forma.y}
                  width={forma.ancho}
                  height={forma.alto}
                  fill={forma.relleno ? forma.color : 'none'}
                  stroke={forma.color}
                  strokeWidth={0.3}
                  className="pointer-events-auto cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setElementoSeleccionado(forma.id);
                    setTipoElementoSeleccionado('forma');
                  }}
                />
              )}
              {forma.tipo === 'circulo' && (
                <circle
                  cx={forma.x}
                  cy={forma.y}
                  r={forma.radio}
                  fill={forma.relleno ? forma.color : 'none'}
                  stroke={forma.color}
                  strokeWidth={0.3}
                  className="pointer-events-auto cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setElementoSeleccionado(forma.id);
                    setTipoElementoSeleccionado('forma');
                  }}
                />
              )}
            </g>
          ))}

          {/* Medidas */}
          {medidas.map(medida => (
            <g key={medida.id}>
              <line
                x1={medida.x1}
                y1={medida.y1}
                x2={medida.x2}
                y2={medida.y2}
                stroke={medida.color}
                strokeWidth={0.3}
                className="pointer-events-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setElementoSeleccionado(medida.id);
                  setTipoElementoSeleccionado('medida');
                }}
              />
              <text
                x={(medida.x1 + medida.x2) / 2}
                y={(medida.y1 + medida.y2) / 2}
                fill={medida.color}
                fontSize={2}
                fontWeight="bold"
                textAnchor="middle"
                className="pointer-events-none"
              >
                {medida.distancia.toFixed(1)}m
              </text>
            </g>
          ))}
        </svg>

        {/* Pins */}
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
                className="drop-shadow-lg cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setElementoSeleccionado(pin.id);
                  setTipoElementoSeleccionado('pin');
                }}
              >
                <path
                  d="M16 0C7.16344 0 0 7.16344 0 16C0 24.8366 16 42 16 42C16 42 32 24.8366 32 16C32 7.16344 24.8366 0 16 0Z"
                  fill={pin.color || '#EF4444'}
                />
                <circle cx="16" cy="15" r="6" fill="white" />
              </svg>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                {pin.etiqueta}
              </div>
            </div>
          </div>
        ))}

        {/* Textos */}
        {textos.map(texto => (
          <div
            key={texto.id}
            className="absolute cursor-pointer"
            style={{
              left: `${texto.x * zoom + panX / zoom}%`,
              top: `${texto.y * zoom + panY / zoom}%`,
              color: texto.color,
              fontSize: `${texto.fontSize / zoom}px`,
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              pointerEvents: 'auto'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setElementoSeleccionado(texto.id);
              setTipoElementoSeleccionado('texto');
            }}
          >
            {texto.texto}
          </div>
        ))}
      </div>

      {/* Elemento seleccionado - Botón eliminar */}
      {elementoSeleccionado && !readOnly && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded flex items-center justify-between">
          <span className="text-sm font-medium text-red-800">
            {tipoElementoSeleccionado === 'pin' && 'Pin seleccionado'}
            {tipoElementoSeleccionado === 'texto' && 'Texto seleccionado'}
            {tipoElementoSeleccionado === 'dibujo' && 'Dibujo seleccionado'}
            {tipoElementoSeleccionado === 'forma' && 'Forma seleccionada'}
            {tipoElementoSeleccionado === 'medida' && 'Medida seleccionada'}
          </span>
          <button
            type="button"
            onClick={eliminarElemento}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold"
          >
            🗑️ ELIMINAR
          </button>
        </div>
      )}
    </div>
  );
};

export default MapaConAnotaciones;
