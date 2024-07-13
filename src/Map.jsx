import React, { useRef, useEffect, useState, useContext } from "react";
import mapboxgl from "mapbox-gl";
import mapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import accessToken from "./access-token";
import {
  DEFAULT_STYLE,
  DEFAULT_PROJECTION,
  DEFAULT_DARK_FEATURE_COLOR,
  DEFAULT_LIGHT_FEATURE_COLOR,
  DEFAULT_SATELLITE_FEATURE_COLOR,
} from "./constants";
import { useAppContext } from "./AppContext";
import { addIds, zoomextent, dummyGeojson } from "./map-utils";

mapboxgl.accessToken = accessToken;

const Map = () => {
  const mapContainer = useRef(null);
  const geocoderRef = useRef(null);

  const {
    mapData: data,
    recovery,
    setRecovery,
    map,
    setMap,
    styleLoaded,
    setStyleLoaded,
  } = useAppContext();

  useEffect(() => {
    const theMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [0, 0],
      zoom: 2,
      accessToken,
      hash: true,
    });

    const geocoder = new mapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
    });
    theMap.addControl(geocoder);

    if (geocoderRef) {
      geocoderRef.current = geocoder;
    }

    theMap.addControl(new mapboxgl.NavigationControl());

    theMap.on("load", () => {
      setStyleLoaded(true);

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
