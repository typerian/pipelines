"use client";

import React, { useState } from "react";
import {
  MousePointer2,
  GitCommitVertical,
  Share2,
  Trash2,
  Navigation,
  MapPin, // Para el punto GPS
  Milestone,
  Square,
  PlusCircle,
  Play, // Para la línea GPS
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

export const MapToolbar = ({ drawRef, mapRef, currentMode }: any) => {
  const [activeLineId, setActiveLineId] = useState<string | null>(null);

  // --- LÓGICA DE PUNTOS ---
  const setMode = (mode: string) => {
    if (!drawRef.current) return;
    drawRef.current.changeMode(mode);
  };

  // Función GPS para puntos (la que ya teníamos funcionando)
  async function handleAddAtCurrentLocation() {
    if (!navigator.geolocation || !drawRef.current || !mapRef.current) return;
    try {
      const pos = await new Promise<GeolocationCoordinates>((res, rej) =>
        navigator.geolocation.getCurrentPosition(
          (p) => res(p.coords),
          (e) => rej(e),
          { enableHighAccuracy: true },
        ),
      );
      const featureId = `gps_point_${Date.now()}`;
      drawRef.current.add({
        id: featureId,
        type: "Feature",
        geometry: { type: "Point", coordinates: [pos.longitude, pos.latitude] },
        properties: {},
      });
      mapRef.current.flyTo({ center: [pos.longitude, pos.latitude], zoom: 19 });
      drawRef.current.changeMode("simple_select", { featureIds: [featureId] });

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.fire("draw.create", {
            features: [drawRef.current.get(featureId)],
          });
        }
      }, 400);
    } catch (error) {
      console.error(error);
    }
  }

  // --- LÓGICA DE LÍNEAS (Tuberías) ---
  const handleStartOrSegmentLine = async () => {
    if (!drawRef.current || !mapRef.current) return;
    try {
      const pos = await new Promise<GeolocationCoordinates>((res, rej) =>
        navigator.geolocation.getCurrentPosition(
          (p) => res(p.coords),
          (e) => rej(e),
          { enableHighAccuracy: true },
        ),
      );
      const newCoords = [pos.longitude, pos.latitude];

      if (!activeLineId) {
        const id = `line_${Date.now()}`;
        drawRef.current.add({
          id,
          type: "Feature",
          geometry: { type: "LineString", coordinates: [newCoords] },
          properties: {},
        });
        setActiveLineId(id);
        drawRef.current.changeMode("direct_select", { featureId: id });
        mapRef.current.flyTo({ center: newCoords, zoom: 19 });
      } else {
        const feature = drawRef.current.get(activeLineId);
        if (feature) {
          const updatedCoords = [...feature.geometry.coordinates, newCoords];
          drawRef.current.add({
            ...feature,
            geometry: { ...feature.geometry, coordinates: updatedCoords },
          });
          drawRef.current.changeMode("direct_select", {
            featureId: activeLineId,
          });
          mapRef.current.panTo(newCoords);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFinishLine = () => {
    if (!activeLineId || !drawRef.current || !mapRef.current) return;
    const finalFeature = drawRef.current.get(activeLineId);
    drawRef.current.changeMode("simple_select");
    mapRef.current.fire("draw.create", { features: [finalFeature] });
    setActiveLineId(null);
  };

  return (
    <div className="absolute top-6 left-6 z-50 flex flex-col gap-2 rounded-[1.5rem] border border-slate-200 bg-white/90 p-2 shadow-2xl backdrop-blur-md">
      <TooltipProvider delayDuration={200}>
        {/* SELECCIÓN GENERAL */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentMode === "simple_select" ? "default" : "ghost"}
              size="icon"
              className="rounded-xl"
              onClick={() => setMode("simple_select")}
            >
              <MousePointer2 size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Seleccionar</TooltipContent>
        </Tooltip>

        <div className="my-1 h-px bg-slate-200" />

        {/* HERRAMIENTAS DE PUNTO (Tanquilla, Válvula, etc) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentMode === "draw_point" ? "default" : "ghost"}
              size="icon"
              className="rounded-xl text-slate-700"
              onClick={() => setMode("draw_point")}
            >
              <GitCommitVertical size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Dibujar Punto Manual</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              onClick={handleAddAtCurrentLocation}
            >
              <MapPin size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Marcar Punto GPS</TooltipContent>
        </Tooltip>

        <div className="my-1 h-px bg-slate-200" />

        {/* HERRAMIENTAS DE LÍNEA (Tubería Segmentada) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeLineId ? "secondary" : "ghost"}
              size="icon"
              className={`rounded-xl transition-all ${activeLineId ? "animate-pulse bg-blue-100 text-blue-700" : "text-blue-600"}`}
              onClick={handleStartOrSegmentLine}
            >
              {activeLineId ? <PlusCircle size={20} /> : <Play size={20} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {activeLineId ? "Agregar Segmento GPS" : "Iniciar Tubería GPS"}
          </TooltipContent>
        </Tooltip>

        {activeLineId && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="animate-in fade-in zoom-in rounded-xl bg-slate-900 hover:bg-black"
                onClick={handleFinishLine}
              >
                <Square size={14} fill="white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Finalizar y Guardar</TooltipContent>
          </Tooltip>
        )}

        <div className="my-1 h-px bg-slate-200" />

        {/* ELIMINAR */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-red-500 hover:bg-red-50"
              onClick={() => drawRef.current.trash()}
            >
              <Trash2 size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Eliminar Seleccionado</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
