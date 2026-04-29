"use client";

import React, { forwardRef } from "react";

interface MapCanvasProps {
  // Podemos pasar clases adicionales para el layout
  className?: string;
  children?: React.ReactNode;
}

/**
 * MapCanvas es un componente puramente estructural.
 * Su única responsabilidad es entregar un div con una referencia (ref)
 * y servir de contenedor relativo para otros elementos de UI (Toolbar, Modales).
 */
export const MapCanvas = forwardRef<HTMLDivElement, MapCanvasProps>(
  ({ className = "h-full w-full", children }, ref) => {
    return (
      <div className={`relative ${className}`}>
        {/* Este es el div donde MapLibre inyectará el canvas real */}
        <div
          ref={ref}
          className="h-full w-full outline-none"
          id="map-viewport"
        />

        {/* Renderizamos los hijos (Toolbar, Buscador, etc.) encima del mapa */}
        {children}
      </div>
    );
  },
);

MapCanvas.displayName = "MapCanvas";
