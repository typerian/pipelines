"use client";

import React, { useEffect } from "react";
import maplibregl from "maplibre-gl";
import { createRoot } from "react-dom/client";
import { Settings2, Ruler, Hash } from "lucide-react";

interface FeaturePopupProps {
  mapRef: React.MutableRefObject<maplibregl.Map | null>;
  info: {
    lngLat: { lng: number; lat: number };
    properties: any;
    name?: string;
  };
  onClose: () => void;
}

export const FeaturePopup = ({ mapRef, info, onClose }: FeaturePopupProps) => {
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !info) return;

    // 1. Crear el contenedor del Popup nativo
    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: "320px",
      offset: 15,
      className: "custom-gis-popup",
    })
      .setLngLat([info.lngLat.lng, info.lngLat.lat])
      .setHTML('<div id="popup-content-root"></div>')
      .addTo(map);

    // 2. Renderizar el contenido React dentro del Popup de MapLibre
    const container = document.getElementById("popup-content-root");
    if (container) {
      const root = createRoot(container);
      root.render(<PopupUI properties={info.properties} />);
      // Limpieza al cerrar manualmente el popup
      popup.on("close", () => {
        onClose();
        // Diferimos el desmonte para evitar el error de ciclo de renderizado
        setTimeout(() => root.unmount(), 0);
      });
    }

    return () => {
      popup.remove();
    };
  }, [mapRef, info, onClose]);

  return null;
};

/**
 * Sub-componente que define la interfaz visual dentro del Popup
 */
const PopupUI = ({ properties }: { properties: any }) => {
  const type = properties.type;

  return (
    <div className="min-w-[200px] p-3">
      <div className="mb-2 flex items-center gap-2 border-b pb-1">
        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600 uppercase">
          {type}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        {type === "observacion" && (
          <>
            <p className="font-bold text-slate-800">{properties.nombre}</p>
            <p className="text-xs text-slate-600 italic">
              {properties.detalle}
            </p>
          </>
        )}

        {type === "tanquilla" && (
          <>
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Ramal:
            </p>
            <p className="font-bold text-slate-800">{properties.ramal}</p>
            <p className="mt-1 text-xs text-slate-600">
              {properties.observacion}
            </p>
          </>
        )}

        {type === "valvula" && (
          <>
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">Tipo:</span>
              <span className="font-bold">{properties.tipo_valvula}</span>
            </div>
            <div className="mt-1 flex justify-between border-t pt-1">
              <span className="text-xs text-slate-500">Tamaño:</span>
              <span className="font-bold">{properties.tamano}"</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
