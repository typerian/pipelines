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
    const connectEvents = () => {
      const map = mapRef.current;
      const draw = drawRef.current;

      if (!map || !draw) return false;

      // --- SEGURIDAD: ELIMINACIÓN CON CLAVE ---
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          const selected = draw.getSelectedIds();

          if (selected.length > 0) {
            e.preventDefault();

            const password = prompt("🔐 Autorización requerida para eliminar:");
            if (password === "1234") {
              draw.delete(selected);
              setPopupInfo(null);
            } else {
              alert("❌ Clave incorrecta.");
            }
          }
        }
      };

      const handleCreate = (e: any) => {
        const feature = e.features[0];
        if (!feature) return;

        setModalState({
          isOpen: true,
          feature: feature,
          geometryType: feature.geometry.type,
        });
      };

      // --- INMUTABILIDAD: BLOQUEO DE MODOS DE EDICIÓN ---
      const handleModeChange = (e: any) => {
        if (e.mode === "direct_select") {
          // Bloquea la edición de vértices en tuberías y marcadores
          draw.changeMode("simple_select");
          return;
        }
        setMode(e.mode);
      };

      // --- INMUTABILIDAD: BLOQUEO DE MOVIMIENTO (ARRASTRE) ---
      const handleUpdate = (e: any) => {
        if (e.action === "move") {
          // Si el usuario intenta arrastrar un elemento ya existente,
          // podrías implementar una lógica aquí para recargar la posición original
          // o simplemente notificar que la infraestructura es fija.
          alert("⚠️ La infraestructura registrada no puede ser desplazada.");
          // Opcional: Revertir cambios si tienes persistencia
        }
      };

      const handleClick = (e: any) => {
        const mode = draw.getMode();
        if (mode !== "simple_select") return;

        const features = draw.getFeatureIdsAt(e.point);
        if (features.length > 0) {
          const feature = draw.get(features[0]);
          if (feature?.properties?.tipo) {
            setPopupInfo({ lngLat: e.lngLat, properties: feature.properties });
          }
        } else {
          setPopupInfo(null);
        }
      };

      // Registrar eventos
      map.on("draw.create", handleCreate);
      map.on("draw.modechange", handleModeChange);
      map.on("draw.update", handleUpdate);
      map.on("click", handleClick);
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        map.off("draw.create", handleCreate);
        map.off("draw.modechange", handleModeChange);
        map.off("draw.update", handleUpdate);
        map.off("click", handleClick);
        window.removeEventListener("keydown", handleKeyDown);
      };
    };

    const cleanup = connectEvents();

    let retryTimeout: NodeJS.Timeout;
    if (!cleanup) {
      retryTimeout = setTimeout(() => connectEvents(), 1000);
    }

    return () => {
      if (typeof cleanup === "function") cleanup();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [mapRef, drawRef, setModalState, setPopupInfo, setMode]);

  return null;
};
