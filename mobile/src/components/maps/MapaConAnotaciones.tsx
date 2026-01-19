import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  TextInput,
  Alert,
  PanResponder,
} from 'react-native';
import Svg, { Polyline, Rect, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { PinMapa } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

// Interfaces - Usamos PinMapa del sistema de tipos

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
  pins: PinMapa[];
  onPinsChange: (pins: PinMapa[]) => void;
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
  '#F97316', // Naranja
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
  readOnly = false,
}) => {
  const [imageSize, setImageSize] = useState({ width: screenWidth - 32, height: 300 });
  const [zoom, setZoom] = useState(1);
  const [herramientaActiva, setHerramientaActiva] = useState<HerramientaActiva>(null);
  const [colorSeleccionado, setColorSeleccionado] = useState(COLORES_DISPONIBLES[0]);
  const [grosorLinea, setGrosorLinea] = useState(3);

  // Estados para creación
  const [etiquetaNueva, setEtiquetaNueva] = useState('');
  const [textoNuevo, setTextoNuevo] = useState('');
  const [dibujandoLinea, setDibujandoLinea] = useState(false);
  const [puntosLinea, setPuntosLinea] = useState<{ x: number; y: number }[]>([]);
  const [puntoInicialForma, setPuntoInicialForma] = useState<{ x: number; y: number } | null>(null);
  const [puntoInicialMedida, setPuntoInicialMedida] = useState<{ x: number; y: number } | null>(null);

  const [elementoSeleccionado, setElementoSeleccionado] = useState<string | null>(null);
  const [tipoElementoSeleccionado, setTipoElementoSeleccionado] = useState<'pin' | 'texto' | 'dibujo' | 'forma' | 'medida' | null>(null);

  const handleImageLoad = (e: any) => {
    const { width, height } = e.nativeEvent.source;
    const aspectRatio = width / height;
    const containerWidth = screenWidth - 32;
    const containerHeight = containerWidth / aspectRatio;
    setImageSize({ width: containerWidth, height: Math.min(containerHeight, 400) });
  };

  const getCoordinatesFromTouch = (locationX: number, locationY: number) => {
    const x = (locationX / (imageSize.width * zoom)) * 100;
    const y = (locationY / (imageSize.height * zoom)) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  };

  const handleMapPress = (e: any) => {
    if (readOnly) return;

    const { locationX, locationY } = e.nativeEvent;
    const coords = getCoordinatesFromTouch(locationX, locationY);

    switch (herramientaActiva) {
      case 'pin':
        agregarPin(coords.x, coords.y);
        break;
      case 'texto':
        if (textoNuevo.trim()) {
          agregarTexto(coords.x, coords.y);
        } else {
          Alert.alert('Texto requerido', 'Escribe el texto antes de colocarlo en el mapa');
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
    if (!etiquetaNueva.trim()) {
      Alert.prompt(
        'Etiqueta del Pin',
        'Ingresa una etiqueta para este pin:',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Agregar',
            onPress: (etiqueta) => {
              if (etiqueta) {
                const nuevoPin: PinMapa = {
                  id: Date.now().toString(),
                  pinX: x,
                  pinY: y,
                  etiqueta: etiqueta.toUpperCase(),
                  color: colorSeleccionado,
                };
                onPinsChange([...pins, nuevoPin]);
              }
            },
          },
        ],
        'plain-text',
        `PIN ${pins.length + 1}`
      );
    } else {
      const nuevoPin: PinMapa = {
        id: Date.now().toString(),
        pinX: x,
        pinY: y,
        etiqueta: etiquetaNueva.toUpperCase(),
        color: colorSeleccionado,
      };
      onPinsChange([...pins, nuevoPin]);
      setEtiquetaNueva('');
    }
  };

  const agregarTexto = (x: number, y: number) => {
    const nuevoTexto: TextoAnotacion = {
      id: Date.now().toString(),
      x,
      y,
      texto: textoNuevo.toUpperCase(),
      color: colorSeleccionado,
      fontSize: 14,
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
      x: Math.min(inicio.x, fin.x),
      y: Math.min(inicio.y, fin.y),
      ancho: herramientaActiva === 'rectangulo' ? Math.abs(fin.x - inicio.x) : undefined,
      alto: herramientaActiva === 'rectangulo' ? Math.abs(fin.y - inicio.y) : undefined,
      radio: herramientaActiva === 'circulo' ? Math.sqrt(Math.pow(fin.x - inicio.x, 2) + Math.pow(fin.y - inicio.y, 2)) : undefined,
      color: colorSeleccionado,
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
      color: colorSeleccionado,
    };
    onMedidasChange([...medidas, nuevaMedida]);
  };

  const eliminarElemento = () => {
    if (!elementoSeleccionado || !tipoElementoSeleccionado) return;

    Alert.alert('Eliminar', '¿Eliminar este elemento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          switch (tipoElementoSeleccionado) {
            case 'pin':
              onPinsChange(pins.filter((p) => p.id !== elementoSeleccionado));
              break;
            case 'texto':
              onTextosChange(textos.filter((t) => t.id !== elementoSeleccionado));
              break;
            case 'dibujo':
              onDibujosChange(dibujos.filter((d) => d.id !== elementoSeleccionado));
              break;
            case 'forma':
              onFormasChange(formas.filter((f) => f.id !== elementoSeleccionado));
              break;
            case 'medida':
              onMedidasChange(medidas.filter((m) => m.id !== elementoSeleccionado));
              break;
          }
          setElementoSeleccionado(null);
          setTipoElementoSeleccionado(null);
        },
      },
    ]);
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

  const renderToolbar = () => (
    <View style={styles.toolbar}>
      <Text style={styles.toolbarTitle}>HERRAMIENTAS</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolsRow}>
        <TouchableOpacity
          style={[styles.toolButton, herramientaActiva === 'pin' && styles.toolButtonActive]}
          onPress={() => setHerramientaActiva(herramientaActiva === 'pin' ? null : 'pin')}
        >
          <Text style={styles.toolIcon}>📍</Text>
          <Text style={[styles.toolText, herramientaActiva === 'pin' && styles.toolTextActive]}>PIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, herramientaActiva === 'texto' && styles.toolButtonActive]}
          onPress={() => setHerramientaActiva(herramientaActiva === 'texto' ? null : 'texto')}
        >
          <Text style={styles.toolIcon}>📝</Text>
          <Text style={[styles.toolText, herramientaActiva === 'texto' && styles.toolTextActive]}>TEXTO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, herramientaActiva === 'dibujo' && styles.toolButtonActive]}
          onPress={() => setHerramientaActiva(herramientaActiva === 'dibujo' ? null : 'dibujo')}
        >
          <Text style={styles.toolIcon}>✏️</Text>
          <Text style={[styles.toolText, herramientaActiva === 'dibujo' && styles.toolTextActive]}>DIBUJAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, herramientaActiva === 'rectangulo' && styles.toolButtonActive]}
          onPress={() => setHerramientaActiva(herramientaActiva === 'rectangulo' ? null : 'rectangulo')}
        >
          <Text style={styles.toolIcon}>▭</Text>
          <Text style={[styles.toolText, herramientaActiva === 'rectangulo' && styles.toolTextActive]}>RECT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, herramientaActiva === 'circulo' && styles.toolButtonActive]}
          onPress={() => setHerramientaActiva(herramientaActiva === 'circulo' ? null : 'circulo')}
        >
          <Text style={styles.toolIcon}>⭕</Text>
          <Text style={[styles.toolText, herramientaActiva === 'circulo' && styles.toolTextActive]}>CÍRCULO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, herramientaActiva === 'medida' && styles.toolButtonActive]}
          onPress={() => setHerramientaActiva(herramientaActiva === 'medida' ? null : 'medida')}
        >
          <Text style={styles.toolIcon}>📏</Text>
          <Text style={[styles.toolText, herramientaActiva === 'medida' && styles.toolTextActive]}>MEDIDA</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Selector de colores */}
      {herramientaActiva && (
        <View style={styles.colorSection}>
          <Text style={styles.colorLabel}>Color:</Text>
          <View style={styles.colorRow}>
            {COLORES_DISPONIBLES.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  colorSeleccionado === color && styles.colorButtonSelected,
                ]}
                onPress={() => setColorSeleccionado(color)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Opciones específicas por herramienta */}
      {herramientaActiva === 'pin' && (
        <View style={styles.optionSection}>
          <TextInput
            style={styles.optionInput}
            value={etiquetaNueva}
            onChangeText={(text) => setEtiquetaNueva(text.toUpperCase())}
            placeholder="ETIQUETA DEL PIN (OPCIONAL)"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      )}

      {herramientaActiva === 'texto' && (
        <View style={styles.optionSection}>
          <TextInput
            style={styles.optionInput}
            value={textoNuevo}
            onChangeText={(text) => setTextoNuevo(text.toUpperCase())}
            placeholder="TEXTO A AGREGAR"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      )}

      {herramientaActiva === 'dibujo' && dibujandoLinea && (
        <TouchableOpacity style={styles.finishButton} onPress={finalizarDibujo}>
          <Text style={styles.finishButtonText}>FINALIZAR DIBUJO ({puntosLinea.length} puntos)</Text>
        </TouchableOpacity>
      )}

      {herramientaActiva && (
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>
            {herramientaActiva === 'pin' && 'Toca el mapa para colocar un pin'}
            {herramientaActiva === 'texto' && 'Escribe el texto y toca donde colocarlo'}
            {herramientaActiva === 'dibujo' && (dibujandoLinea ? 'Toca para agregar puntos' : 'Toca para comenzar a dibujar')}
            {(herramientaActiva === 'rectangulo' || herramientaActiva === 'circulo') &&
              (puntoInicialForma ? 'Toca el punto final' : 'Toca el punto inicial')}
            {herramientaActiva === 'medida' && (puntoInicialMedida ? 'Toca el punto final' : 'Toca el punto inicial')}
          </Text>
          <TouchableOpacity style={styles.cancelButton} onPress={cancelarHerramienta}>
            <Text style={styles.cancelButtonText}>CANCELAR</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {!readOnly && renderToolbar()}

      {/* Controles de zoom */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={() => setZoom(Math.min(3, zoom + 0.5))}>
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <Text style={styles.zoomText}>{zoom.toFixed(1)}x</Text>
        <TouchableOpacity style={styles.zoomButton} onPress={() => setZoom(Math.max(1, zoom - 0.5))}>
          <Text style={styles.zoomButtonText}>-</Text>
        </TouchableOpacity>
        {zoom > 1 && (
          <TouchableOpacity style={styles.zoomButton} onPress={() => setZoom(1)}>
            <Text style={styles.zoomButtonText}>⟲</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Mapa */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={zoom > 1}
        scrollEnabled={zoom > 1}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={zoom > 1}
          scrollEnabled={zoom > 1}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleMapPress}
            style={[
              styles.mapContainer,
              {
                width: imageSize.width * zoom,
                height: imageSize.height * zoom,
              },
            ]}
          >
            <Image
              source={{ uri: mapaImagen }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
              onLoad={handleImageLoad}
            />

            {/* SVG overlay */}
            <Svg
              style={StyleSheet.absoluteFill}
              viewBox={`0 0 100 100`}
              preserveAspectRatio="none"
            >
              {/* Dibujos */}
              {dibujos.map((dibujo) => (
                <Polyline
                  key={dibujo.id}
                  points={dibujo.puntos.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={dibujo.color}
                  strokeWidth={dibujo.grosor * 0.15}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  onPress={() => {
                    setElementoSeleccionado(dibujo.id);
                    setTipoElementoSeleccionado('dibujo');
                  }}
                />
              ))}

              {/* Dibujo temporal */}
              {dibujandoLinea && puntosLinea.length > 0 && (
                <Polyline
                  points={puntosLinea.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={colorSeleccionado}
                  strokeWidth={grosorLinea * 0.15}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.6}
                />
              )}

              {/* Formas */}
              {formas.map((forma) => (
                <G key={forma.id}>
                  {forma.tipo === 'rectangulo' && (
                    <Rect
                      x={forma.x}
                      y={forma.y}
                      width={forma.ancho}
                      height={forma.alto}
                      fill="none"
                      stroke={forma.color}
                      strokeWidth={0.5}
                      onPress={() => {
                        setElementoSeleccionado(forma.id);
                        setTipoElementoSeleccionado('forma');
                      }}
                    />
                  )}
                  {forma.tipo === 'circulo' && (
                    <Circle
                      cx={forma.x}
                      cy={forma.y}
                      r={forma.radio}
                      fill="none"
                      stroke={forma.color}
                      strokeWidth={0.5}
                      onPress={() => {
                        setElementoSeleccionado(forma.id);
                        setTipoElementoSeleccionado('forma');
                      }}
                    />
                  )}
                </G>
              ))}

              {/* Medidas */}
              {medidas.map((medida) => (
                <G key={medida.id}>
                  <Line
                    x1={medida.x1}
                    y1={medida.y1}
                    x2={medida.x2}
                    y2={medida.y2}
                    stroke={medida.color}
                    strokeWidth={0.4}
                    onPress={() => {
                      setElementoSeleccionado(medida.id);
                      setTipoElementoSeleccionado('medida');
                    }}
                  />
                  <SvgText
                    x={(medida.x1 + medida.x2) / 2}
                    y={(medida.y1 + medida.y2) / 2 - 1}
                    fill={medida.color}
                    fontSize={2.5}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {medida.distancia.toFixed(1)}%
                  </SvgText>
                </G>
              ))}
            </Svg>

            {/* Pins */}
            {pins.map((pin) => (
              <TouchableOpacity
                key={pin.id}
                style={[
                  styles.pin,
                  {
                    left: `${pin.pinX}%`,
                    top: `${pin.pinY}%`,
                    transform: [{ translateX: -15 }, { translateY: -30 }],
                  },
                ]}
                onPress={() => {
                  setElementoSeleccionado(pin.id);
                  setTipoElementoSeleccionado('pin');
                }}
              >
                <View style={[styles.pinHead, { backgroundColor: pin.color || '#EF4444' }]}>
                  <View style={styles.pinCircle} />
                </View>
                <View style={[styles.pinPoint, { borderTopColor: pin.color || '#EF4444' }]} />
                {pin.etiqueta && (
                  <View style={styles.pinLabel}>
                    <Text style={styles.pinLabelText} numberOfLines={1}>
                      {pin.etiqueta}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Textos */}
            {textos.map((texto) => (
              <TouchableOpacity
                key={texto.id}
                style={[
                  styles.textoAnotacion,
                  {
                    left: `${texto.x}%`,
                    top: `${texto.y}%`,
                  },
                ]}
                onPress={() => {
                  setElementoSeleccionado(texto.id);
                  setTipoElementoSeleccionado('texto');
                }}
              >
                <Text style={[styles.textoContent, { color: texto.color, fontSize: texto.fontSize }]}>
                  {texto.texto}
                </Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </ScrollView>
      </ScrollView>

      {/* Elemento seleccionado */}
      {elementoSeleccionado && !readOnly && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            {tipoElementoSeleccionado === 'pin' && 'Pin seleccionado'}
            {tipoElementoSeleccionado === 'texto' && 'Texto seleccionado'}
            {tipoElementoSeleccionado === 'dibujo' && 'Dibujo seleccionado'}
            {tipoElementoSeleccionado === 'forma' && 'Forma seleccionada'}
            {tipoElementoSeleccionado === 'medida' && 'Medida seleccionada'}
          </Text>
          <TouchableOpacity style={styles.deleteButton} onPress={eliminarElemento}>
            <Ionicons name="trash" size={18} color="#FFF" />
            <Text style={styles.deleteButtonText}>ELIMINAR</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Estadísticas */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          📍 {pins.length} | 📝 {textos.length} | ✏️ {dibujos.length} | ▭ {formas.length} | 📏 {medidas.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  toolbarTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  toolsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  toolButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  toolIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  toolText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  toolTextActive: {
    color: '#FFFFFF',
  },
  colorSection: {
    marginTop: 8,
  },
  colorLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#000000',
    borderWidth: 3,
  },
  optionSection: {
    marginTop: 8,
  },
  optionInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DBEAFE',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  zoomControls: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  zoomButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  zoomButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  zoomText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    marginVertical: 4,
  },
  mapContainer: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  pin: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinHead: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  pinCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  pinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  pinLabel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pinLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#374151',
  },
  textoAnotacion: {
    position: 'absolute',
  },
  textoContent: {
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stats: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  statsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default MapaConAnotaciones;
