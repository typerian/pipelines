"use client";

import React, { useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { useMapEditor } from "./useMapEditor";
import { MapDashboard } from "./dashboard";
import { MapSearchBar } from "./search-bar";
import { MapToolbar } from "./toolbar";
import { InfrastructureModal } from "../infrastructure-modal";
import { FeaturePopup } from "./features-popup";
import { TanquillaMarker } from "./tanquilla-marker";
import maplibregl from "maplibre-gl";

export default function MapEditor() {
  const utils = api.useUtils();
  const { data: savedGeometries } = api.geometry.getAll.useQuery();

  const saveMutation = api.geometry.createBatch.useMutation({
    onSuccess: () => {
      void utils.geometry.getAll.invalidate();
    },
  });

  const {
    mapContainer,
    mapRef,
    drawRef,
    mode,
    modalState,
    popupInfo, // Extraído del hook
    setPopupInfo, // Extraído del hook
    confirmFeatureData,
    cancelFeature,
  } = useMapEditor(savedGeometries);

  const stats = useMemo(() => {
    if (!savedGeometries) return { markers: 0, meters: 0 };
    return savedGeometries.reduce(
      (acc, curr) => {
        if (curr.type === "Point") acc.markers += 1;
        if (curr.type === "LineString") {
          const m = curr.data.properties.pipeData?.lengthMeters || 0;
          acc.meters += m;
        }
        return acc;
      },
      { markers: 0, meters: 0 },
    );
  }, [savedGeometries]);

  const handleFinalSave = () => {
    if (!drawRef.current) return;
    const data = drawRef.current.getAll();
    const toSave = data.features.map((f: any) => ({
      name: f.properties?.name || "Sin identificación",
      type: f.geometry.type,
      data: f,
      source: "manual" as const,
    }));
    saveMutation.mutate(toSave);
  };

  const handleFlyTo = (coords: [number, number]) => {
    mapRef.current?.flyTo({ center: coords, zoom: 18, essential: true });
  };

  // Dentro de tu componente MapEditor
  useEffect(() => {
    if (!mapRef.current || !popupInfo) return;

    // Creamos el popup nativo
    const popup = new maplibregl.Popup({
      closeButton: false,
      offset: 15,
      maxWidth: "300px",
      className: "z-50 shadow-2xl",
    })
      .setLngLat([popupInfo.lngLat.lng, popupInfo.lngLat.lat])
      .setHTML('<div id="popup-root"></div>') // Creamos un contenedor vacío
      .addTo(mapRef.current);

    // Inyectamos nuestro componente FeaturePopup de React dentro del popup de MapLibre
    const container = document.getElementById("popup-root");
    if (container) {
      const { createRoot } = require("react-dom/client");
      const root = createRoot(container);
      root.render(<FeaturePopup data={popupInfo.properties} />);

      // Limpieza al cerrar el popup
      popup.on("close", () => {
        setPopupInfo(null);
        root.unmount();
      });
    }

    return () => {
      popup.remove();
    };
  }, [popupInfo, mapRef]);

  return (
    <div className="flex h-screen w-full flex-col gap-4 bg-slate-100 p-4 md:p-6">
      <header className="flex items-center justify-between rounded-2xl border bg-white px-6 py-4 shadow-sm">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase">
            GIS Hidráulico
          </h2>
          <p className="text-xs font-medium text-slate-400">
            Gestión de Tuberías y Válvulas
          </p>
        </div>
        <button
          onClick={handleFinalSave}
          disabled={saveMutation.isPending}
          className="rounded-xl bg-blue-600 px-8 py-2.5 font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:opacity-50"
        >
          {saveMutation.isPending ? "Guardando..." : "Sincronizar Red"}
        </button>
      </header>

      <MapDashboard stats={stats} />

      <div className="relative flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <MapSearchBar
          items={savedGeometries || []}
          onResultClick={handleFlyTo}
        />

        <div ref={mapContainer} className="h-full w-full" />

        {mapRef.current &&
          savedGeometries
            ?.filter((g) => g.type === "Point")
            .map((point) => {
              const [lng, lat] = (point.data.geometry as any).coordinates;
              return (
                <TanquillaMarker
                  key={point.id}
                  map={mapRef.current!} // Pasamos la instancia nativa
                  lng={lng}
                  lat={lat}
                  name={point.name}
                  onClick={() => {
                    // Aquí disparamos el popup nativo desde la instancia del mapa
                    new maplibregl.Popup({ closeButton: false, offset: 15 })
                      .setLngLat([lng, lat])
                      .setHTML(`<div class="p-2 font-bold">${point.name}</div>`)
                      .addTo(mapRef.current!);
                  }}
                />
              );
            })}

        {/* --- RENDERIZADO DE POPUPS --- */}

        <div className="absolute bottom-6 left-6 z-10 rounded-2xl border bg-white/80 px-4 py-2 text-[11px] font-black tracking-widest text-slate-600 uppercase shadow-xl backdrop-blur-md">
          {mode === "simple_select" ? "🔍 Exploración" : "✍️ Editando Red"}
        </div>
      </div>

      <MapToolbar
        onAction={(action) => {
          if (!drawRef.current) return;
          if (action === "trash") {
            drawRef.current.trash();
          } else {
            (drawRef.current as any).changeMode(action);
          }
        }}
        currentMode={mode}
      />

      <InfrastructureModal
        isOpen={modalState.isOpen}
        geometryType={modalState.geometryType}
        onClose={cancelFeature}
        onSubmit={(formData) => {
          confirmFeatureData(formData);
        }}
      />
    </div>
  );
}
