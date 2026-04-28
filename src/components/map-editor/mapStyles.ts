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

  // --- LÍNEAS (Y CONTORNOS DE POLÍGONOS) ---
  {
    id: "gl-draw-line-inactive",
    type: "line",
    filter: ["all", ["==", "active", "false"], ["==", "$type", "LineString"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#3bb2d0",
      "line-width": 3,
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
  {
    id: "gl-draw-point-inactive",
    type: "circle",
    filter: ["all", ["==", "active", "false"], ["==", "$type", "Point"]],
    paint: {
      "circle-radius": 0, // Invisible
      "circle-opacity": 0,
    },
    // Esto es clave: hacemos que el motor de MapLibre ignore este punto para eventos
    layout: {
      visibility: "none",
    },
  },

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
];
