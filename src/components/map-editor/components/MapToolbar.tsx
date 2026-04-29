"use client";

import React from "react";
import {
  MousePointer2,
  GitCommitVertical,
  Share2,
  Trash2,
  Navigation,
  MapPin, // Para el punto GPS
  Milestone, // Para la línea GPS
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
} from "~/components/ui/tooltip";

interface MapToolbarProps {
  drawRef: React.MutableRefObject<any | null>;
  mapRef: React.MutableRefObject<maplibregl.Map | null>; // Añadido mapRef
  currentMode: string;
}

export const MapToolbar = ({
  drawRef,
  mapRef,
  currentMode,
}: MapToolbarProps) => {
  const setMode = (mode: string) => {
    if (!drawRef.current) return;
    drawRef.current.changeMode(mode);
  };

  const deleteSelected = () => {
    if (!drawRef.current) return;
    drawRef.current.trash();
  };

  // Función para obtener ubicación con alta precisión
  const getCoordinates = (): Promise<GeolocationCoordinates> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err),
        { enableHighAccuracy: true },
      );
    });
  };

  // Al definirla así, TypeScript resuelve la referencia de tipo inmediatamente
  async function handleAddAtCurrentLocation() {
    if (!navigator.geolocation || !drawRef.current || !mapRef.current) return;

    try {
      const coords = await getCoordinates();
      const featureId = `gps_point_${Date.now()}`;

      // 1. Añadir al motor de dibujo
      drawRef.current.add({
        id: featureId,
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [coords.longitude, coords.latitude],
        },
        properties: {},
      });

      // 2. Centrar mapa
      mapRef.current.flyTo({
        center: [coords.longitude, coords.latitude],
        zoom: 19,
        essential: true,
      });

      // 3. Seleccionar el punto recién creado
      drawRef.current.changeMode("simple_select", {
        featureIds: [featureId],
      });

      // 4. Disparar el evento para que el Modal se abra
      // Usamos un pequeño delay para que la animación del mapa no bloquee el portal del Modal
      setTimeout(() => {
        if (drawRef.current && mapRef.current) {
          const feature = drawRef.current.get(featureId);
          if (feature) {
            mapRef.current.fire("draw.create", {
              features: [feature],
            });
          }
        }
      }, 400);
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
    }
  }

  async function handleStartLineFromLocation() {
    if (!navigator.geolocation || !drawRef.current || !mapRef.current) return;
    try {
      const { longitude, latitude } = await getCoordinates();

      mapRef.current.flyTo({ center: [longitude, latitude], zoom: 19 });

      const lineId = `gps_line_${Date.now()}`;
      drawRef.current.add({
        id: lineId,
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [[longitude, latitude]],
        },
        properties: {},
      });

      drawRef.current.changeMode("direct_select", {
        featureId: lineId,
      });
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
    }
  }

  const actions = [
    {
      id: "select",
      icon: <MousePointer2 size={18} />,
      label: "Seleccionar",
      mode: "simple_select",
    },
    {
      id: "point",
      icon: <GitCommitVertical size={18} />,
      label: "Dibujar Tanquilla",
      mode: "draw_point",
    },
    {
      id: "line",
      icon: <Share2 size={18} />,
      label: "Dibujar Tubería",
      mode: "draw_line_string",
    },
  ];

  return (
    <div className="absolute top-6 left-6 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white/90 p-2 shadow-2xl backdrop-blur-md">
      <TooltipProvider delayDuration={200}>
        {/* Herramientas Estándar */}
        {actions.map((action) => (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>
              <Button
                variant={currentMode === action.mode ? "default" : "ghost"}
                size="icon"
                className="h-10 w-10 rounded-lg"
                onClick={() => setMode(action.mode)}
              >
                {action.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {" "}
              {action.label}{" "}
            </TooltipContent>
          </Tooltip>
        ))}

        <div className="my-1 h-px bg-slate-200" />

        {/* Herramientas GPS */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg text-emerald-600 hover:bg-emerald-50"
              onClick={handleAddAtCurrentLocation}
            >
              <MapPin size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Marcar aquí (GPS)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg text-blue-600 hover:bg-blue-50"
              onClick={handleStartLineFromLocation}
            >
              <Milestone size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Trazar desde aquí (GPS)
          </TooltipContent>
        </Tooltip>

        <div className="my-1 h-px bg-slate-200" />

        {/* Borrar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg text-red-500 hover:bg-red-50"
              onClick={deleteSelected}
            >
              <Trash2 size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Eliminar
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
