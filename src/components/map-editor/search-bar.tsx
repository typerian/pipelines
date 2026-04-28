"use client";

import React, { useState } from "react";

interface SearchBarProps {
  items: any[];
  onResultClick: (coords: [number, number]) => void;
}

export const MapSearchBar = ({ items, onResultClick }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  // Filtramos marcadores por nombre o descripción
  const filtered = items
    ?.filter((g) => {
      const isPoint = (g.data as any).geometry.type === "Point";
      const nameMatch = g.name.toLowerCase().includes(query.toLowerCase());
      const descMatch = (g.data as any).properties?.description
        ?.toLowerCase()
        .includes(query.toLowerCase());

      return isPoint && (nameMatch || descMatch);
    })
    .slice(0, 6); // Limitamos resultados para no saturar la vista

  return (
    <div className="absolute top-4 left-4 z-20 w-72 md:w-80">
      <div className="group relative">
        <input
          type="text"
          placeholder="Buscar marcador o detalle..."
          className="w-full rounded-2xl border-none bg-white/95 py-3 pr-10 pl-10 text-sm font-medium text-slate-700 shadow-2xl ring-2 ring-transparent backdrop-blur-md transition-all outline-none focus:ring-blue-500/50"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Icono de Lupa */}
        <div className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
          🔍
        </div>

        {/* Botón para limpiar */}
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute top-1/2 right-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* Lista de Resultados */}
      {query.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-2 mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white/95 shadow-2xl backdrop-blur-md duration-200">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  const coords = (item.data as any).geometry.coordinates;
                  onResultClick(coords);
                  setQuery(""); // Cerramos al seleccionar
                }}
                className="group w-full border-b border-slate-50 p-4 text-left transition-colors last:border-0 hover:bg-blue-50/50"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1">📍</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 transition-colors group-hover:text-blue-600">
                      {item.name}
                    </span>
                    <span className="line-clamp-1 text-xs font-medium text-slate-500 italic">
                      {(item.data as any).properties?.description ||
                        "Sin descripción adicional"}
                    </span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-xs font-medium text-slate-400">
              No se encontraron coincidencias
            </div>
          )}
        </div>
      )}
    </div>
  );
};
