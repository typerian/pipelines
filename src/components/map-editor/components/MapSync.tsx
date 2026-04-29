"use client";

import { useEffect } from "react";

interface MapSyncProps {
  mapRef: React.MutableRefObject<maplibregl.Map | null>;
  drawRef: React.MutableRefObject<any | null>;
  data: any[];
}

/**
 * Responsabilidad:
 * Sincronizar las geometrías guardadas en la base de datos con el lienzo de MapboxDraw.
 * Incluye lógica de reintento para asegurar que el motor de dibujo esté listo.
 */
export const MapSync = ({ mapRef, drawRef, data }: MapSyncProps) => {
  useEffect(() => {
    const map = mapRef.current;
    const draw = drawRef.current;

    // Si no hay mapa, instancia de dibujo o datos, no hacemos nada
    if (!map || !draw || !data) return;

    const syncDataToMap = () => {
      try {
        // Verificamos que las capas internas de MapboxDraw estén presentes en el estilo
        const style = map.getStyle();
        const isDrawReady = style?.layers?.some((l) =>
          l.id.includes("gl-draw"),
        );

        if (!isDrawReady) {
          // Si el mapa cargó pero Draw aún no inyectó sus capas, reintentamos en 50ms
          setTimeout(syncDataToMap, 50);
          return;
        }

        // 1. Limpiamos el lienzo de dibujo actual
        draw.deleteAll();

        // 2. Insertamos las geometrías de la DB (GeoJSON)
        data.forEach((item: any) => {
          if (item.data) {
            draw.add(item.data);
          }
        });
      } catch (error) {
        console.warn("MapSync: Error al sincronizar geometrías:", error);
      }
    };

    // Ejecutamos la sincronización solo cuando el mapa esté totalmente cargado
    if (map.loaded()) {
      syncDataToMap();
    } else {
      map.once("load", syncDataToMap);
    }

    // No necesitamos cleanup aquí porque deleteAll se encarga en la siguiente ejecución
  }, [data, mapRef, drawRef]);

  return null; // Este componente no renderiza HTML, solo ejecuta lógica
};
