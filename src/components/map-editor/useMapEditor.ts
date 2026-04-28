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
    });

    // --- LÓGICA DE POPUPS (CLIC EN EL MAPA) ---
    map.on("click", (e) => {
      if (!drawRef.current) return;

      const features = drawRef.current.getFeatureIdsAt(e.point);

      if (features.length > 0) {
        const featureId = features[0];
        const feature = drawRef.current.get(featureId!);

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
        // 1. Intentamos quitar el control primero si existe
        try {
          if (map.hasControl(draw as any)) {
            map.removeControl(draw as any);
          }
        } catch (e) {
          console.warn("Error eliminando el control de dibujo:", e);
        }

        // 2. Destruimos el mapa por completo
        map.remove();
        mapRef.current = null;
        drawRef.current = null;
      }
    };
  }, [draw]);

  // Sincronizar datos guardados (DB -> Mapa)
  useEffect(() => {
    if (drawRef.current && savedGeometries) {
      drawRef.current.deleteAll();
      savedGeometries.forEach((g: any) => {
        drawRef.current?.add(g.data);
      });
    }
  }, [savedGeometries]);

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
    if (modalState.feature && drawRef.current) {
      drawRef.current.delete(modalState.feature.id);
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
