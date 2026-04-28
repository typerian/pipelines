"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Importamos el orquestador de forma dinámica para evitar errores de 'window is not defined'
const MapEditor = dynamic(
  () => import("~/components/map-editor/index").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">
            Cargando mapa y herramientas...
          </p>
        </div>
      </div>
    ),
  },
);

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      {/* Contenedor principal con padding para que el editor respire */}
      <div className="mx-auto h-screen max-w-[1600px] p-0 md:p-4">
        <Suspense fallback={<div>Cargando...</div>}>
          <MapEditor />
        </Suspense>
      </div>
    </main>
  );
}
