"use client";

import { useEffect } from "react";
import maplibregl from "maplibre-gl";

interface Props {
  map: maplibregl.Map;
  lng: number;
  lat: number;
  name: string; // <--- Agrega esta línea
  onClick: () => void;
}

export const TanquillaMarker = ({ map, lng, lat, onClick }: Props) => {
  useEffect(() => {
    // Creamos el elemento del DOM manualmente
    const el = document.createElement("div");

    // Inyectamos el estilo y el SVG de la gota directamente (basado en Lucide Droplet)
    el.className =
      "flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg transition-transform hover:scale-110 cursor-pointer";
    el.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
      </svg>
    `;

    const handleInternalClick = (e: MouseEvent) => {
      e.stopPropagation();
      onClick();
    };

    el.addEventListener("click", handleInternalClick);

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map);

    // Limpieza segura: solo removemos del mapa y el listener
    return () => {
      el.removeEventListener("click", handleInternalClick);
      marker.remove();
    };
  }, [map, lng, lat, onClick]);

  return null;
};
