import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

interface InfrastructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  geometryType: "Point" | "LineString" | "Polygon";
  initialData?: any;
}

export const InfrastructureModal = ({
  isOpen,
  onClose,
  onSubmit,
  geometryType,
  initialData,
}: InfrastructureModalProps) => {
  const { register, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: initialData || {
      name: "",
      description: "",
      pipeData: { diameter: "2", hasCoating: false, coatingType: "" },
      valveData: { valveType: "Compuerta", valveSize: "2" },
    },
  });

  const hasCoating = watch("pipeData.hasCoating");

  // Resetear el formulario cuando se abre para un nuevo elemento
  useEffect(() => {
    if (isOpen) reset(initialData);
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">
        {/* Header */}
        <div className="border-b bg-slate-50 p-6">
          <h3 className="text-xl font-bold text-slate-800">
            {geometryType === "LineString"
              ? "Detalles de Tubería"
              : "Detalles de Tanquilla"}
          </h3>
          <p className="text-sm text-slate-500">
            Ingrese la información técnica del activo
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
          {/* Campo Común: Nombre */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Identificador / Nombre
            </label>
            <input
              {...register("name", { required: true })}
              placeholder="Ej: Tramo Principal A1"
              className="w-full rounded-lg border border-slate-200 p-2.5 transition-all outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* CAMPOS ESPECÍFICOS PARA TUBERÍAS (LineString) */}
          {geometryType === "LineString" && (
            <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-blue-700 uppercase">
                    Diámetro (pulg)
                  </label>
                  <select
                    {...register("pipeData.diameter")}
                    className="w-full rounded-lg border border-blue-200 bg-white p-2 text-sm outline-none"
                  >
                    {["1/2", "3/4", "1", "2", "4", "6", "8", "12"].map((d) => (
                      <option key={d} value={d}>
                        {d}"
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      {...register("pipeData.hasCoating")}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      ¿Revestimiento?
                    </span>
                  </label>
                </div>
              </div>

              {hasCoating && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="mb-1 block text-xs font-bold text-blue-700 uppercase">
                    Tipo de Revestimiento
                  </label>
                  <input
                    {...register("pipeData.coatingType")}
                    placeholder="Ej: Pintura Epóxica"
                    className="w-full rounded-lg border border-blue-200 bg-white p-2 text-sm outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* CAMPOS ESPECÍFICOS PARA TANQUILLAS (Point) */}
          {geometryType === "Point" && (
            <div className="space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-emerald-700 uppercase">
                    Tipo de Válvula
                  </label>
                  <select
                    {...register("valveData.valveType")}
                    className="w-full rounded-lg border border-emerald-200 bg-white p-2 text-sm outline-none"
                  >
                    {["Compuerta", "Mariposa", "Bola", "Globo", "Check"].map(
                      (v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-emerald-700 uppercase">
                    Tamaño (pulg)
                  </label>
                  <select
                    {...register("valveData.valveSize")}
                    className="w-full rounded-lg border border-emerald-200 bg-white p-2 text-sm outline-none"
                  >
                    {["2", "4", "6", "8", "10", "12"].map((s) => (
                      <option key={s} value={s}>
                        {s}"
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Footer del Modal */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
            >
              Guardar Activo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
