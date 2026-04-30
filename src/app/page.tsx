"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { api } from "~/trpc/react";

const MapEditor = dynamic(
  () => import("~/components/map-editor/index").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <LoadingState />,
  },
);

export default function EditorPage() {
  // Obtenemos los datos de la base de datos
  const { data: savedGeometries, isLoading } =
    api.infrastructure.getAll.useQuery();

  if (isLoading) return <LoadingState />;

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto h-screen max-w-[1600px] p-0 md:p-4">
        <Suspense fallback={<LoadingState />}>
          {/* Ahora pasamos los datos, o un array vacío si no hay nada aún */}
          <MapEditor savedGeometries={savedGeometries ?? []} />
        </Suspense>
      </div>
    </main>
  );
}

// Componente de carga extraído para limpieza
function LoadingState() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-medium text-slate-500">
          Cargando infraestructura...
        </p>
      </div>
    </div>
  );
}
