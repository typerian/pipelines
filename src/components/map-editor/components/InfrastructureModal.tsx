"use client";

import { Badge, CheckCircle2, Info, MapPin, Settings2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

type InfraType = "observacion" | "tanquilla" | "valvula";

export const InfrastructureModal = ({
  isOpen,
  feature,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  feature: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) => {
  const [selectedType, setSelectedType] = useState<InfraType>("observacion");
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset();
      setSelectedType("observacion");
    }
  }, [isOpen, reset]);

  const handleFormSubmit = (data: any) => {
    const emojis = { observacion: "🚧", tanquilla: "🕳️", valvula: "⏲️" };
    onSubmit({
      ...data,
      tipo: selectedType,
      emoji: emojis[selectedType],
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="z-[9999] flex max-h-[90vh] w-[95vw] flex-col overflow-hidden rounded-[1.5rem] border-none bg-white p-0 shadow-2xl sm:max-w-[420px]">
        {/* Header Compacto */}
        <div className="shrink-0 bg-slate-900 px-6 pt-5 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
              <Settings2 size={18} className="text-blue-400" />
              Identificar Elemento
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Cuerpo con Scroll para que no se pierdan los botones */}
        <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto px-6 py-4">
          <form
            id="infra-form"
            onSubmit={handleSubmit((data) => {
              const emojis = {
                observacion: "🚧",
                tanquilla: "🕳️",
                valvula: "⏲️",
              };
              onSubmit({
                ...data,
                tipo: selectedType,
                emoji: emojis[selectedType],
              });
            })}
            className="space-y-5"
          >
            {/* UBICACIÓN */}
            <div className="space-y-2">
              <Label
                htmlFor="ramal"
                className="text-xs font-bold tracking-wider text-slate-500 uppercase"
              >
                Nombre del Ramal
              </Label>
              <Input
                id="ramal"
                placeholder='Ej: "Santa Elena"'
                {...register("ramal")}
                required
                className="h-10 rounded-xl border-slate-200 bg-slate-50"
              />
            </div>

            {/* SELECTOR DE TIPO (Más pequeño) */}
            <div className="grid grid-cols-3 gap-2">
              {(["observacion", "tanquilla", "valvula"] as const).map((t) => (
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
                    {t === "observacion"
                      ? "🚧"
                      : t === "tanquilla"
                        ? "🕳️"
                        : "⏲️"}
                  </span>
                  <span className="text-[9px] font-black tracking-tighter uppercase">
                    {t}
                  </span>
                  {selectedType === t && (
                    <CheckCircle2 className="absolute top-1 right-1 h-3 w-3 text-blue-600" />
                  )}
                </button>
              ))}
            </div>

            {/* DETALLES DINÁMICOS */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              {selectedType === "observacion" && (
                <div className="space-y-3">
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
                </div>
              )}
              {selectedType === "tanquilla" && (
                <Input
                  placeholder="Estado de tanquilla..."
                  {...register("observacion_tanquilla")}
                  required
                  className="h-10 bg-white"
                />
              )}
              {selectedType === "valvula" && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Tipo..."
                    {...register("tipo_valvula")}
                    required
                    className="h-10 bg-white"
                  />
                  <Input
                    type="number"
                    placeholder='Pulgadas (")'
                    {...register("tamano")}
                    required
                    className="h-10 bg-white"
                  />
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer FIJO (Siempre visible) */}
        <div className="shrink-0 border-t border-slate-100 bg-slate-50 p-4">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl font-semibold text-slate-500"
            >
              Cerrar
            </Button>
            <Button
              type="submit"
              form="infra-form" // Esto vincula el botón al form que está en el área de scroll
              className="h-11 flex-[2] rounded-xl bg-slate-900 font-bold text-white shadow-lg hover:bg-black"
            >
              Guardar Registro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
