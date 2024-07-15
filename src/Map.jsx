import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import DrawLineString from "./draw/linestring";
import DrawRectangle from "./draw/rectangle";
import DrawCircle from "./draw/circle";
import SimpleSelect from "./draw/simple_select";
import ExtendDrawBar from "./draw/extend_draw_bar";
import drawStyles from "./draw/styles";

import { EditControl, SaveCancelControl, TrashControl } from "./controls";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import accessToken from "./access-token";
import {
  DEFAULT_DARK_FEATURE_COLOR,
  DEFAULT_LIGHT_FEATURE_COLOR,
  DEFAULT_SATELLITE_FEATURE_COLOR,
} from "./constants";
import { useAppContext } from "./AppContext";
import { addIds, zoomextent, dummyGeojson } from "./map-utils";

mapboxgl.accessToken = accessToken;

const Map = () => {
  const {
    mapData: data,
    appendMapData,
    recovery,
    setRecovery,
    map,
    setMap,
    styleLoaded,
    setStyleLoaded,
  } = useAppContext();

  const mapContainer = useRef(null);
  const drawRef = useRef();

  const [drawing, setDrawing] = useState(false);


  const stripIds = (features) => {
    return features.map((feature) => {
      delete feature.id;
      return feature;
    });
  };

  const created = useCallback(
    (e) => {
      drawRef.current.deleteAll();
      appendMapData(stripIds(e.features));

      // delay setting drawing back to false after a drawn feature is created
      // this allows the map click handler to ignore the click and prevents a popup
      // if the drawn feature endeds within an existing feature
      setTimeout(() => {
        setDrawing(false);
      }, 500);
    },
    [data],
  );

  useEffect(() => {
    const theMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [0, 0],
      zoom: 2,
      accessToken,
      hash: true,
    });

    if (true) {
      theMap.addControl(
        new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl,
          marker: true,
        }),
      );

      const draw = (drawRef.current = new MapboxDraw({
        displayControlsDefault: false,
        modes: {
          ...MapboxDraw.modes,
          simple_select: SimpleSelect,
          direct_select: MapboxDraw.modes.direct_select,
          draw_line_string: DrawLineString,
          draw_rectangle: DrawRectangle,
          draw_circle: DrawCircle,
        },
        controls: {},
        styles: drawStyles,
      }));

      const drawControl = new ExtendDrawBar({
        draw,
        buttons: [
          {
            on: "click",
            action: () => {
              setDrawing(true);
              draw.changeMode("draw_point");
            },
            classes: ["mapbox-gl-draw_ctrl-draw-btn", "mapbox-gl-draw_point"],
            title: "Draw Point (m)",
          },
          {
            on: "click",
            action: () => {
              setDrawing(true);
              draw.changeMode("draw_line_string");
            },
            classes: ["mapbox-gl-draw_ctrl-draw-btn", "mapbox-gl-draw_line"],
            title: "Draw LineString (l)",
          },
          {
            on: "click",
            action: () => {
              setDrawing(true);
              draw.changeMode("draw_polygon");
            },
            classes: ["mapbox-gl-draw_ctrl-draw-btn", "mapbox-gl-draw_polygon"],
            title: "Draw Polygon (p)",
          },
          {
            on: "click",
            action: () => {
              setDrawing(true);
              draw.changeMode("draw_rectangle");
            },
            classes: [
              "mapbox-gl-draw_ctrl-draw-btn",
              "mapbox-gl-draw_rectangle",
            ],
            title: "Draw Rectangular Polygon (r)",
          },
          {
            on: "click",
            action: () => {
              setDrawing(true);
              draw.changeMode("draw_circle");
            },
            classes: ["mapbox-gl-draw_ctrl-draw-btn", "mapbox-gl-draw_circle"],
            title: "Draw Circular Polygon (c)",
          },
        ],
      });

      theMap.addControl(new mapboxgl.NavigationControl());

      theMap.addControl(drawControl, "top-right");

      const editControl = new EditControl();
      theMap.addControl(editControl, "top-right");

      const saveCancelControl = new SaveCancelControl();

      theMap.addControl(saveCancelControl, "top-right");

      const trashControl = new TrashControl();

      theMap.addControl(trashControl, "top-right");
    }

    theMap.on("load", () => {
      setStyleLoaded(true);

      theMap.on("draw.create", created);

      if (!theMap.getSource("map-data")) {
        const { name } = theMap.getStyle();

        let color = DEFAULT_DARK_FEATURE_COLOR; // Sets default dark color for lighter base maps

        // Sets a light color for dark base map
        if (["Mapbox Dark"].includes(name)) {
          color = DEFAULT_LIGHT_FEATURE_COLOR;
        }

        // Sets a brighter color for the satellite base map to help with visibility.
        if (["Mapbox Satellite Streets"].includes(name)) {
          color = DEFAULT_SATELLITE_FEATURE_COLOR;
        }

        // setFog only on Light and Dark
        if (["Mapbox Light", "Mapbox Dark", "osm"].includes(name)) {
          theMap.setFog({
            range: [0.5, 10],
            color: "#ffffff",
            "high-color": "#245cdf",
            "space-color": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4,
              "#010b19",
              7,
              "#367ab9",
            ],
            "horizon-blend": [
              "interpolate",
              ["exponential", 1.2],
              ["zoom"],
              5,
              0.02,
              7,
              0.08,
            ],
            "star-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              5,
              0.35,
              6,
              0,
            ],
          });
        }

        theMap.addSource("map-data", {
          type: "geojson",
          data: dummyGeojson,
        });

        theMap.addLayer({
          id: "map-data-fill",
          type: "fill",
          source: "map-data",
          paint: {
            "fill-color": ["coalesce", ["get", "fill"], color],
            "fill-opacity": ["coalesce", ["get", "fill-opacity"], 0.3],
          },
          filter: ["==", ["geometry-type"], "Polygon"],
        });

        theMap.addLayer({
          id: "map-data-fill-outline",
          type: "line",
          source: "map-data",
          paint: {
            "line-color": ["coalesce", ["get", "stroke"], color],
            "line-width": ["coalesce", ["get", "stroke-width"], 2],
            "line-opacity": ["coalesce", ["get", "stroke-opacity"], 1],
          },
          filter: ["==", ["geometry-type"], "Polygon"],
        });

        theMap.addLayer({
          id: "map-data-line",
          type: "line",
          source: "map-data",
          paint: {
            "line-color": ["coalesce", ["get", "stroke"], color],
            "line-width": ["coalesce", ["get", "stroke-width"], 2],
            "line-opacity": ["coalesce", ["get", "stroke-opacity"], 1],
          },
          filter: ["==", ["geometry-type"], "LineString"],
        });
      }
    });

    setMap(theMap);
  }, []);

  // if map is loaded and data is available, update the map to reflect the data
  useEffect(() => {
    if (!data || !styleLoaded) return;

    const geojson = data;

    if (!geojson) return;

    const workingDatasetSource = map.getSource("map-data");

    if (workingDatasetSource) {
      const filteredFeatures = geojson.features.filter(
        (feature) => feature.geometry,
      );
      const filteredGeojson = {
        type: "FeatureCollection",
        features: filteredFeatures,
      };
      workingDatasetSource.setData(addIds(filteredGeojson));
      // addMarkers(filteredGeojson, context, writable);
      if (recovery) {
        zoomextent(filteredGeojson, map);
        setRecovery(false);
      }
    }
  }, [data, styleLoaded]);

  return <div ref={mapContainer} className="map-container h-full" />;
};

export default Map;
