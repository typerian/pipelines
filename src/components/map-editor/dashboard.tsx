"use client";

import React from "react";

interface DashboardProps {
  stats: {
    markers: number;
    meters: number;
  };
}

export const MapDashboard = ({ stats }: DashboardProps) => {
  // Formatear la distancia para que sea legible
  const formatDistance = (m: number) => {
    if (m >= 1000) {
      return `${(m / 1000).toFixed(2)} km`;
    }
    return `${m} m`;
  };

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
      {/* Tarjeta de Marcadores */}
      <div className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-2xl shadow-inner">
          📍
        </div>
        <div className="flex flex-col">
          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Total Marcadores
          </p>
          <p className="text-3xl font-black text-slate-800">
            {stats.markers}
            <span className="ml-2 text-sm font-medium text-slate-400 italic">
              puntos
            </span>
          </p>
        </div>
      </div>

      {/* Tarjeta de Longitud Lineal */}
      <div className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl shadow-inner">
          📏
        </div>
        <div className="flex flex-col">
          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Longitud Total
          </p>
          <p className="text-3xl font-black text-slate-800">
            {formatDistance(stats.meters)}
          </p>
        </div>
      </div>
    </div>
  );
};
