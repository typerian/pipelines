"use client";

import React, { useEffect, useState } from "react";
import { useMapInit } from "./hooks/useMapInit";
import { MapSync } from "./components/MapSync";
import { MapEvents } from "./components/MapEvents"; // El nuevo componente de eventos
import { InfrastructureModal } from "./components/InfrastructureModal";
import { MapToolbar } from "./components/MapToolbar";
import { FeaturePopup } from "./components/FeaturesPopup";
import { api } from "~/trpc/react";

// Define qué es un Feature de MapboxDraw para TypeScript
interface MapFeature {
  id: string | number;
  properties: any;
  geometry: {
    type: string;
    coordinates: any[];
  };
}

interface ModalState {
  isOpen: boolean;
  feature: MapFeature | null;
  geometryType: "Point" | "LineString" | "Polygon" | null; // Añade null aquí si quieres iniciar en null
}

export default function MapEditor({
  savedGeometries,
}: {
  savedGeometries: any;
}) {
  // 1. Inicializamos el núcleo del mapa
  const { mapContainer, mapRef, drawRef, draw } = useMapInit();

  // 2. Estados de UI (puedes mover estos a un hook de lógica si crecen mucho)
  const [popupInfo, setPopupInfo] = useState<any>(null);
  const [mode, setMode] = useState("simple_select");
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    feature: null,
    geometryType: null,
  });

  const utils = api.useUtils();

  const createMutation = api.infrastructure.create.useMutation({
    onSuccess: async () => {
      await utils.infrastructure.invalidate();
    },
  });

  const handleConfirmFeature = (formData: any) => {
    const { feature } = modalState;
    const drawInstance = drawRef.current;

    if (!feature || !drawInstance) return;

    const properties = {
      ramal: formData.ramal,
      tipo: formData.tipo,
      emoji: formData.emoji,
      asunto: formData.asunto,
      detalle: formData.detalle,
      observacion: formData.observacion_tanquilla,
      tipo_valvula: formData.tipo_valvula,
      tamano: formData.tamano,
    };

    // Actualización visual inmediata
    Object.keys(properties).forEach((key) => {
      const value = (properties as any)[key];
      if (value !== undefined) {
        drawInstance.setFeatureProperty(`${feature.id}`, key, value);
      }
    });

    // Persistencia en DB
    createMutation.mutate({
      id: crypto.randomUUID(), // Estándar moderno de JS para IDs únicos
      mapboxId: `${feature.id}`,
      geometryType: feature.geometry.type as "Point" | "LineString",
      coordinates: feature.geometry.coordinates,
      properties: properties,
      ramal: formData.ramal,
    });

    setModalState({ ...modalState, isOpen: false, feature: null });
  };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on("click", () => {
        console.log("CLIC DIRECTO EN EL MAPA");
      });
    }
  }, [mapRef.current]);

  // Solo para probar en MapEditor.tsx
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on("click", () => {
        console.log("CLIC DIRECTO EN EL MAPA");
      });
    }
  }, [mapRef.current]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-50">
      {" "}
      {/* --- LIENZO DEL MAPA --- */}
      <div ref={mapContainer} className="h-full w-full" />
      {/* --- LÓGICA SEGREGADA (Sin representación visual directa) --- */}
      {/* Responsabilidad: Sincronizar DB -> Mapa */}
      <MapSync mapRef={mapRef} drawRef={drawRef} data={savedGeometries} />
      {/* Responsabilidad: Escuchar eventos de dibujo y clics */}
      <MapEvents
        mapRef={mapRef}
        drawRef={drawRef}
        setMode={setMode}
        setModalState={setModalState} // <--- Asegúrate que sea este
        setPopupInfo={setPopupInfo}
      />
      {/* Responsabilidad: Renderizar iconos de Tanquillas (React Markers) */}
      {/* --- COMPONENTES DE INTERFAZ (UI) --- */}
      <MapToolbar drawRef={drawRef} mapRef={mapRef} currentMode={mode} />
      {/* Popups de información */}
      {popupInfo && (
        <FeaturePopup
          mapRef={mapRef}
          info={popupInfo}
          onClose={() => setPopupInfo(null)}
        />
      )}
      {/* Modal de formulario para nuevas tuberías/tanquillas */}
      {/* Modal de formulario para nuevas tuberías/tanquillas */}
      <InfrastructureModal
        isOpen={modalState.isOpen}
        feature={modalState.feature}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSubmit={handleConfirmFeature}
      />
      {/* Indicador de modo actual */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1 text-xs font-medium shadow-sm backdrop-blur-md">
        Modo: {mode === "simple_select" ? "Selección" : "Dibujando..."}
      </div>
    </div>
  );
}
