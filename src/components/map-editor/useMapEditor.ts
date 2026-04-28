import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import length from "@turf/length";
import { mapLibreStyles } from "./mapStyles"; // Asegúrate de importar tus estilos corregidos

export const useMapEditor = (savedGeometries: any) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  // --- ESTADOS ---
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    feature: any;
    geometryType: "Point" | "LineString" | "Polygon";
  }>({
    isOpen: false,
    feature: null,
    geometryType: "Point",
  });

  const draw = useMemo(
    () =>
      new MapboxDraw({
        displayControlsDefault: false,
        styles: mapLibreStyles,
      }),
    [],
  );

  const [popupInfo, setPopupInfo] = useState<{
    lngLat: { lng: number; lat: number };
    properties: any;
  } | null>(null);

  const [mode, setMode] = useState("simple_select");
  const isHandlingFeature = useRef(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [-67.6, 10.25],
      zoom: 14,
    });

    map.on("load", () => {
      if (!map.hasControl(draw as any)) {
        map.addControl(draw as any);
      }
      // ASIGNACIÓN SEGURA: Las refs se activan solo cuando el mapa cargó
      mapRef.current = map;
      drawRef.current = draw;
    });

    // --- LÓGICA DE POPUPS (CLIC EN EL MAPA) ---
    map.on("click", (e) => {
      const drawInstance = drawRef.current;
      if (!drawInstance) return;

      const features = drawInstance.getFeatureIdsAt(e.point);

      if (features.length > 0 && features[0]) {
        const feature = drawInstance.get(features[0]);

        if (feature && feature.properties) {
          setPopupInfo({
            lngLat: e.lngLat,
            properties: feature.properties,
          });
        }
      } else {
        setPopupInfo(null);
      }
    });

    mapRef.current = map;
    drawRef.current = draw;

    // --- EVENTOS DE DIBUJO ---
    const handleCreate = (e: any) => {
      const f = e.features[0];
      if (!f || isHandlingFeature.current) return;

      isHandlingFeature.current = true;
      setModalState({
        isOpen: true,
        feature: f,
        geometryType: f.geometry.type,
      });
    };

    // Dentro del useEffect principal en useMapEditor.ts
    const handleModeChange = (e: any) => {
      setMode(e.mode);

      if (!mapRef.current) return;

      // Obtenemos el elemento del canvas del mapa
      const canvas = mapRef.current.getCanvasContainer();

      // Si el modo es trazar línea (o polígono), ponemos la cruz
      if (e.mode === "draw_line_string" || e.mode === "draw_polygon") {
        canvas.style.cursor = "crosshair";
      } else {
        // Si vuelve a selección simple, regresamos al cursor normal
        canvas.style.cursor = "";
      }
    };

    map.on("draw.create", handleCreate);
    map.on("draw.modechange", handleModeChange);

    return () => {
      if (map) {
        // Limpieza de eventos
        map.off("draw.create", handleCreate);
        map.off("draw.modechange", handleModeChange);

        try {
          if (map.hasControl(draw as any)) {
            map.removeControl(draw as any);
          }
        } catch (e) {}

        map.remove();
        // Limpiamos las refs
        mapRef.current = null;
        drawRef.current = null;
      }
    };
  }, [draw]);

  // Sincronizar datos guardados (DB -> Mapa)
  // Sincronizar datos guardados (DB -> Mapa)
  useEffect(() => {
    const drawInstance = drawRef.current;
    const mapInstance = mapRef.current;

    if (drawInstance && mapInstance && savedGeometries) {
      const syncData = () => {
        // Verificamos que las capas de Draw existan en el estilo del mapa
        // MapboxDraw inyecta capas que empiezan por 'gl-draw'
        const isDrawReady = mapInstance
          .getStyle()
          ?.layers?.some((l) => l.id.includes("gl-draw"));

        if (!isDrawReady) {
          // Si no está listo, reintentamos en el siguiente frame
          setTimeout(syncData, 50);
          return;
        }

        try {
          drawInstance.deleteAll();
          savedGeometries.forEach((g: any) => {
            if (g.data) drawInstance.add(g.data);
          });
        } catch (error) {
          console.error("Error crítico en syncData:", error);
        }
      };

      if (!mapInstance.loaded()) {
        mapInstance.once("load", syncData);
      } else {
        syncData();
      }
    }
  }, [savedGeometries]); // Eliminamos draw de las dependencias ya que es un useMemo estable

  const confirmFeatureData = useCallback(
    (formData: any) => {
      const { feature } = modalState;
      if (!feature || !drawRef.current) return;

      const properties = {
        ...feature.properties,
        name: formData.name,
        description: formData.description,
      };

      if (feature.geometry.type === "LineString") {
        const pipeMeters = Math.round(length(feature) * 1000);
        properties.pipeData = {
          ...formData.pipeData,
          lengthMeters: pipeMeters,
        };
      } else if (feature.geometry.type === "Point") {
        properties.valveData = formData.valveData;
      }

      drawRef.current.setFeatureProperty(feature.id, "name", properties.name);
      drawRef.current.setFeatureProperty(
        feature.id,
        "pipeData",
        properties.pipeData,
      );
      drawRef.current.setFeatureProperty(
        feature.id,
        "valveData",
        properties.valveData,
      );

      setModalState({ isOpen: false, feature: null, geometryType: "Point" });
      isHandlingFeature.current = false;
    },
    [modalState],
  );

  const cancelFeature = useCallback(() => {
    // Usamos el encadenamiento opcional ?. para evitar el error si es undefined
    if (modalState.feature && drawRef.current) {
      try {
        drawRef.current.delete(modalState.feature.id);
      } catch (e) {
        console.warn("No se pudo borrar el feature al cancelar:", e);
      }
    }
    setModalState({ isOpen: false, feature: null, geometryType: "Point" });
    isHandlingFeature.current = false;
  }, [modalState]);

  return {
    mapContainer,
    mapRef,
    drawRef,
    mode,
    modalState,
    popupInfo, // Exportado
    setPopupInfo, // Exportado
    confirmFeatureData,
    cancelFeature,
  };
};
