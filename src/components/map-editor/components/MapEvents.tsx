"use client";

import { useEffect } from "react";

export const MapEvents = ({
  mapRef,
  drawRef,
  setMode,
  setModalState,
  setPopupInfo,
}: any) => {
  useEffect(() => {
    // Función para conectar eventos
    const connectEvents = () => {
      const map = mapRef.current;
      const draw = drawRef.current;

      if (!map || !draw) return false;

      const handleCreate = (e: any) => {
        const feature = e.features[0];
        if (!feature) return;

        // Si el modal funcionó con el botón rojo, esto ahora funcionará aquí
        setModalState({
          isOpen: true,
          feature: feature,
          geometryType: feature.geometry.type,
        });
      };

      const handleModeChange = (e: any) => {
        setMode(e.mode);
      };

      const handleClick = (e: any) => {
        const mode = draw.getMode();
        if (mode !== "simple_select" && mode !== "direct_select") return;
        const features = draw.getFeatureIdsAt(e.point);
        if (features.length > 0) {
          const feature = draw.get(features[0]);
          if (feature?.properties?.tipo) {
            setPopupInfo({ lngLat: e.lngLat, properties: feature.properties });
          }
        }
      };

      map.on("draw.create", handleCreate);
      map.on("draw.modechange", handleModeChange);
      map.on("click", handleClick);

      return () => {
        map.off("draw.create", handleCreate);
        map.off("draw.modechange", handleModeChange);
        map.off("click", handleClick);
      };
    };

    // Intentar conectar
    const cleanup = connectEvents();

    // Si no se pudo conectar (porque el mapa aún carga), reintentar en 1 segundo
    let retryTimeout: NodeJS.Timeout;
    if (!cleanup) {
      retryTimeout = setTimeout(() => {
        connectEvents();
      }, 1000);
    }

    return () => {
      if (cleanup) cleanup();
      if (retryTimeout) clearTimeout(retryTimeout);
    };

    // Escuchamos cambios en las referencias
  }, [mapRef, drawRef, setModalState]);

  return null;
};
