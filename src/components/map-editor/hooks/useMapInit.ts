"use client";

import { useEffect, useRef, useMemo } from "react";
import maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { mapLibreStyles } from "../mapStyles";

export const useMapInit = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // 1. Inicializamos el Draw inmediatamente en la Ref, no esperes al useEffect
  const drawRef = useRef<MapboxDraw>(
    new MapboxDraw({
      displayControlsDefault: false,
      styles: mapLibreStyles,
    }),
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    // 2. Inicialización del Mapa
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [-67.6, 10.25],
      zoom: 14,
      pitchWithRotate: false,
      dragRotate: false,
    });

    // 3. ASIGNACIÓN INMEDIATA DE LA REF DEL MAPA
    // No esperes al 'load' para que otros componentes vean la instancia
    mapRef.current = map;

    map.on("load", () => {
      // 4. Vinculación segura
      if (mapRef.current && !map.hasControl(drawRef.current as any)) {
        map.addControl(drawRef.current as any);
      }
    });

    return () => {
      if (map) {
        try {
          // Usamos la ref directamente para limpiar
          map.removeControl(drawRef.current as any);
        } catch (e) {}
        map.remove();
        mapRef.current = null;
      }
    };
  }, []); // Quitamos 'draw' de las dependencias para evitar ciclos

  return {
    mapContainer,
    mapRef,
    drawRef,
    draw: drawRef.current,
  };
};
