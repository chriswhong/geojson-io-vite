import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback, useRef } from "react";
import AppContext from "./AppContext.jsx";
import store from "store";
import geojsonRewind from "@mapbox/geojson-rewind";

export const AppContextProvider = ({ children }) => {
  const [dirty, setDirty] = useState(false);
  const [map, setMap] = useState();
  const [styleLoaded, setStyleLoaded] = useState(false);
  const [mapData, _setMapData] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [meta, setMeta] = useState();
  const [recovery, setRecovery] = useState(false);
  const [source, setSource] = useState();
  const [type, setType] = useState("local");

  const mapDataRef = useRef(mapData);

  // use a ref so appendMapData can always get ahold of the latest mapData
  const setMapData = (d) => {
    mapDataRef.current = d
    _setMapData(d)
  }

  const allData = () => {
    return {
      dirty,
      map,
      styleLoaded,
      mapData,
      meta,
      recovery,
      source,
      type,
    };
  };

  const appendMapData = useCallback((features) => {
    let FC = {
      type: "FeatureCollection",
      features: [...mapDataRef.current.features, ...features],
    };

    FC = geojsonRewind(FC);
    setMapData(FC);
  }, [mapData])

  const value = {
    dirty,
    setDirty,
    map,
    setMap,
    styleLoaded,
    setStyleLoaded,
    mapData,
    setMapData,
    appendMapData,
    meta,
    setMeta,
    recovery,
    setRecovery,
    source,
    setSource,
    type,
    setType,
    allData,
    store,
  };

  useEffect(() => {
    console.log("appcontext updated", allData());
  }, [dirty, map, styleLoaded, mapData, meta, recovery, source, type]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

AppContextProvider.propTypes = {
  children: PropTypes.any,
};
