// src/components/map-editor/mapStyles.ts

export const mapLibreStyles = [
  // --- POLÍGONOS (RELLENO) ---
  {
    id: "gl-draw-polygon-fill-inactive",
    type: "fill",
    filter: ["all", ["==", "active", "false"], ["==", "$type", "Polygon"]],
    paint: {
      "fill-color": "#3bb2d0",
      "fill-outline-color": "#3bb2d0",
      "fill-opacity": 0.1,
    },
  },
  {
    id: "gl-draw-polygon-fill-active",
    type: "fill",
    filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
    paint: {
      "fill-color": "#fbb03b",
      "fill-outline-color": "#fbb03b",
      "fill-opacity": 0.2,
    },
  },
  {
    id: "gl-draw-line-active",
    type: "line",
    filter: ["all", ["==", "active", "true"], ["==", "$type", "LineString"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#fbb03b",
      "line-dasharray": ["literal", [0.2, 2]],
      "line-width": 4,
    },
  },

  // --- MARCADORES PERSONALIZADOS (PUNTOS) ---

  // --- PUNTOS EN EDICIÓN (CUANDO SE SELECCIONAN) ---
  {
    id: "gl-draw-point-active",
    type: "circle",
    filter: ["all", ["==", "active", "true"], ["==", "$type", "Point"]],
    paint: {
      "circle-radius": 7,
      "circle-color": "#fbb03b",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    },
  },

  // --- VÉRTICES (LOS PUNTITOS PARA MOVER LÍNEAS/POLÍGONOS) ---
  {
    id: "gl-draw-polygon-and-line-vertex-inactive",
    type: "circle",
    filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
    paint: {
      "circle-radius": 4,
      "circle-color": "#fff",
      "circle-stroke-width": 1,
      "circle-stroke-color": "#3bb2d0",
    },
  },

  // 1. ESTILO PARA LÍNEAS (TUBERÍAS) - Se mantiene igual
  {
    id: "gl-draw-line-inactive",
    type: "line",
    filter: [
      "all",
      ["==", "$geometryType", "LineString"],
      ["!=", "mode", "static"],
    ],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#4b5563", "line-width": 3 },
  },

  // 2. ESTILO PARA PUNTOS ACTUARIALES (TEMPORALES DURANTE DIBUJO)
  // Mantenemos los círculos pequeños mientras el usuario está haciendo clic
  {
    id: "gl-draw-point-point-stroke-inactive",
    type: "circle",
    filter: [
      "all",
      ["==", "$geometryType", "Point"],
      ["==", "active", "false"],
    ],
    paint: {
      "circle-radius": 5,
      "circle-color": "#fff",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#3b82f6",
    },
  },

  // 3. ¡LA CLAVE!: ESTILO PARA PUNTOS FINALIZADOS (CON EMOJI)
  // Este estilo renderiza el emoji como texto sobre el punto

  {
    id: "gl-draw-point-emoji", // Este ID es personalizado
    type: "symbol",
    filter: [
      "all",
      ["==", "$geometryType", "Point"],
      ["==", "active", "false"],
      ["has", "emoji"],
    ],
    layout: {
      "text-field": ["get", "emoji"],
      "text-size": 24,
      "text-anchor": "center",
      "text-allow-overlap": true,
    },
    // IMPORTANTE: Añade esto para que el motor de selección lo detecte
    paint: {
      "text-opacity": 1,
    },
  },
  // AGREGAMOS UN "HITBOX" INVISIBLE
  // Esto crea un área circular invisible alrededor del emoji para facilitar el clic
  {
    id: "gl-draw-point-inactive",
    type: "circle",
    filter: [
      "all",
      ["==", "$geometryType", "Point"],
      ["==", "active", "false"],
    ],
    paint: {
      "circle-radius": 15,
      "circle-color": "#000",
      "circle-opacity": 0, // Invisible pero clickable
    },
  },
];
