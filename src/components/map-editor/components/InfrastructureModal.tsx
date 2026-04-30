"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { CheckCircle2, Settings2, Share2 } from "lucide-react";

type InfraType =
  | "observacion"
  | "tanquilla"
  | "valvula"
  | "ERM"
  | "ERP"
  | "tuberia";

export const InfrastructureModal = ({
  isOpen,
  feature,
  onClose,
  onSubmit,
}: any) => {
  const [selectedType, setSelectedType] = useState<InfraType>("observacion");
  const { register, handleSubmit, reset } = useForm();

  // Detectar si el elemento es una línea (tubería)
  const isLine =
    feature?.geometry?.type === "LineString" || feature?.type === "LineString";

  useEffect(() => {
    if (isOpen) {
      reset();
      setSelectedType(isLine ? "tuberia" : "observacion");
    }
  }, [isOpen, reset, isLine]);

  const handleFormSubmit = (data: any) => {
    const emojiMap: Record<string, string> = {
      observacion: "🚧",
      tanquilla: "🕳️",
      valvula: "⏲️",
      ERM: "🏭",
      ERP: "🔰",
      tuberia: "➖",
    };

    onSubmit({
      ...data,
      tipo: isLine ? "tuberia" : selectedType,
      emoji: isLine ? emojiMap.tuberia : emojiMap[selectedType],
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="z-[9999] flex max-h-[90vh] w-[95vw] flex-col overflow-hidden rounded-[1.5rem] border-none bg-white p-0 shadow-2xl sm:max-w-[420px]">
        <div className="shrink-0 bg-slate-900 px-6 pt-5 pb-4 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Settings2 size={18} className="text-blue-400" />
              {isLine ? "Datos de Tubería" : `Identificar ${selectedType}`}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-4">
          <form
            id="infra-form"
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-5"
          >
            {isLine ? (
              /* --- VISTA PARA TUBERÍAS (LÍNEAS) --- */
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
                <div className="mb-2 flex items-center gap-2 text-blue-600">
                  <Share2 size={16} />
                  <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                    Nueva Conexión
                  </span>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase">
                    Ramal Asociado
                  </Label>
                  <Input
                    {...register("ramal_asociado")}
                    placeholder="Nombre del ramal principal..."
                    required
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase">
                    Diámetro de Tubería (Pulgadas)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    {...register("diametro")}
                    placeholder='Ej: 4"'
                    required
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:border-blue-500"
                  />
                </div>
              </div>
            ) : (
              /* --- VISTA PARA MARCADORES (PUNTOS) --- */
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Ramal de Ubicación
                  </Label>
                  <Input
                    {...register("ramal")}
                    placeholder="Nombre del sector/zona"
                    required
                    className="h-10 rounded-xl bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      "observacion",
                      "tanquilla",
                      "valvula",
                      "ERM",
                      "ERP",
                    ] as InfraType[]
                  ).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedType(t)}
                      className={`relative flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-3 transition-all ${
                        selectedType === t
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-slate-100 text-slate-400"
                      }`}
                    >
                      <span className="text-xl">
                        {t === "observacion" && "🚧"}{" "}
                        {t === "tanquilla" && "🕳️"}
                        {t === "valvula" && "⏲️"} {t === "ERM" && "🏭"}{" "}
                        {t === "ERP" && "🔰"}
                      </span>
                      <span className="text-[9px] font-black uppercase">
                        {t}
                      </span>
                      {selectedType === t && (
                        <CheckCircle2 className="absolute top-1 right-1 h-3 w-3 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  {selectedType === "observacion" && (
                    <>
                      <Input
                        placeholder="Asunto..."
                        {...register("asunto")}
                        required
                        className="h-10 bg-white"
                      />
                      <Input
                        placeholder="Descripción..."
                        {...register("detalle")}
                        className="h-10 bg-white"
                      />
                    </>
                  )}
                  {selectedType === "tanquilla" && (
                    <Input
                      placeholder="Observación de tanquilla..."
                      {...register("observacion_tanquilla")}
                      required
                      className="h-10 bg-white"
                    />
                  )}
                  {selectedType === "valvula" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Tipo válvula..."
                        {...register("tipo_valvula")}
                        required
                        className="h-10 bg-white"
                      />
                      <Input
                        type="number"
                        placeholder="Pulgadas"
                        {...register("tamano")}
                        required
                        className="h-10 bg-white"
                      />
                    </div>
                  )}
                  {selectedType === "ERM" && (
                    <Input
                      placeholder="Nombre del Cliente..."
                      {...register("nombre_cliente")}
                      required
                      className="h-10 border-blue-100 bg-white"
                    />
                  )}
                  {selectedType === "ERP" && (
                    <Input
                      placeholder="Ramal Asociado..."
                      {...register("ramal_asociado")}
                      required
                      className="h-10 border-emerald-100 bg-white"
                    />
                  )}
                </div>
              </>
            )}
          </form>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 p-4">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 rounded-xl text-slate-500"
            >
              Cerrar
            </Button>
            <Button
              type="submit"
              form="infra-form"
              className="flex-[2] rounded-xl bg-slate-900 font-bold text-white shadow-lg hover:bg-black"
            >
              Guardar {isLine ? "Tubería" : selectedType}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
