import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import AppContext from "./AppContext.jsx";
import store from "store";

export const AppContextProvider = ({ children }) => {
  const [dirty, setDirty] = useState(false);
  const [map, setMap] = useState();
  const [styleLoaded, setStyleLoaded] = useState(false);
  const [mapData, setMapData] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [meta, setMeta] = useState();
  const [recovery, setRecovery] = useState(false);
  const [source, setSource] = useState();
  const [type, setType] = useState("local");

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

  const value = {
    dirty,
    setDirty,
    map,
    setMap,
    styleLoaded,
    setStyleLoaded,
    mapData,
    setMapData,
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
