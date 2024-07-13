import bbox from "@turf/bbox";

export const addIds = (geojson) => {
  return {
    ...geojson,
    features: geojson.features.map((feature, i) => {
      return {
        ...feature,
        id: i,
      };
    }),
  };
};

export const zoomextent = function (geojson, map) {
  // if the data is a single point, flyTo()
  if (
    geojson.features.filter((feature) => feature.geometry).length === 1 &&
    geojson.features[0].geometry.type === "Point"
  ) {
    map.flyTo({
      center: geojson.features[0].geometry.coordinates,
      zoom: 6,
      duration: 1000,
    });
  } else {
    const bounds = bbox(geojson);
    map.fitBounds(bounds, {
      padding: 50,
      duration: 1000,
    });
  }
};

export const dummyGeojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [0, 0],
      },
    },
  ],
};

export const hasFeatures = (mapData) => {
  return !!(mapData && mapData.features && mapData.features.length);
};
