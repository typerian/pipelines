"use client";

import React from "react";

interface ToolbarProps {
  onAction: (mode: string) => void;
  currentMode: string;
}

export const MapToolbar = ({ onAction, currentMode }: ToolbarProps) => {
  // Lista de botones para facilitar el renderizado
  const tools = [
    {
      id: "draw_polygon",
      label: "Polígono",
      icon: "⬢",
      color: "bg-green-600",
      ring: "ring-green-300",
    },
    {
      id: "draw_line_string",
      label: "Línea",
      icon: "⎯",
      color: "bg-blue-600",
      ring: "ring-blue-300",
    },
    {
      id: "draw_point",
      label: "Marcador",
      icon: "📍",
      color: "bg-red-600",
      ring: "ring-red-300",
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      {/* Grupo de Herramientas de Dibujo */}
      <div className="flex gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onAction(tool.id)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 ${
              currentMode === tool.id
                ? `${tool.color} ring-4 ${tool.ring} scale-105 shadow-lg`
                : `${tool.color} opacity-80 shadow-md hover:scale-105 hover:opacity-100`
            } `}
          >
            <span className="text-lg">{tool.icon}</span>
            <span className="hidden sm:inline">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Grupo de Acciones de Control */}
      <div className="flex items-center gap-3">
        {/* Separador vertical en escritorio */}
        <div className="mx-2 hidden h-8 w-px bg-slate-100 sm:block" />

        <button
          onClick={() => onAction("simple_select")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
            currentMode === "simple_select"
              ? "cursor-default bg-slate-100 text-slate-400"
              : "bg-slate-800 text-white shadow-md hover:scale-105 hover:bg-slate-900"
          } `}
          title="Detener dibujo y volver a navegación"
        >
          <span>✋</span>
          <span className="hidden sm:inline">
            {currentMode === "simple_select" ? "Selección" : "Finalizar Trazo"}
          </span>
        </button>

        <button
          onClick={() => {
            // Esta acción usualmente se maneja directo en el drawRef dentro del orquestador,
            // pero si necesitas un botón de 'Trash' global, aquí está la base.
            onAction("trash");
          }}
          className="rounded-xl border border-red-100 bg-white p-2.5 text-red-500 shadow-sm transition-colors hover:bg-red-50"
          title="Borrar elemento seleccionado"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
