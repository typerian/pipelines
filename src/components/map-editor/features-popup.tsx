// src/components/map-editor/FeaturePopup.tsx

export const FeaturePopup = ({ data }: { data: any }) => {
  // Usamos el encadenamiento opcional (?.) y valores por defecto (??)
  const pipe = data.pipeData;
  const valve = data.valveData;

  return (
    <div className="flex flex-col gap-1 p-2 text-slate-800">
      <header className="mb-1 border-b border-slate-100 pb-1">
        <h4 className="text-sm font-bold">{data.name ?? "Sin nombre"}</h4>
      </header>

      {pipe && (
        <div className="space-y-1 text-xs">
          <p>
            <span className="font-semibold text-blue-600">Diámetro:</span>{" "}
            {pipe.diameter ?? "N/A"}"
          </p>
          <p>
            <span className="font-semibold text-blue-600">Longitud:</span>{" "}
            {pipe.lengthMeters ?? 0}m
          </p>
          {pipe.hasCoating && (
            <p>
              <span className="font-semibold text-blue-600">
                Revestimiento:
              </span>{" "}
              {pipe.coatingType ?? "Estándar"}
            </p>
          )}
        </div>
      )}

      {valve && (
        <div className="space-y-1 text-xs">
          <p>
            <span className="font-semibold text-emerald-600">Válvula:</span>{" "}
            {valve.valveType ?? "N/A"}
          </p>
          <p>
            <span className="font-semibold text-emerald-600">Tamaño:</span>{" "}
            {valve.valveSize ?? "N/A"}"
          </p>
        </div>
      )}
    </div>
  );
};
