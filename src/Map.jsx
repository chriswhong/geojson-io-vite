import React, { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import mapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import bbox from '@turf/bbox'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import accessToken from './access-token'
import {
    DEFAULT_STYLE,
    DEFAULT_PROJECTION,
    DEFAULT_DARK_FEATURE_COLOR,
    DEFAULT_LIGHT_FEATURE_COLOR,
    DEFAULT_SATELLITE_FEATURE_COLOR
} from './constants'

mapboxgl.accessToken = accessToken

const addIds = (geojson) => {
    return {
      ...geojson,
      features: geojson.features.map((feature, i) => {
        return {
          ...feature,
          id: i
        };
      })
    };
  };

  const zoomextent = function (geojson, map) {
    // if the data is a single point, flyTo()
    if (
      geojson.features.filter((feature) => feature.geometry).length === 1 &&
      geojson.features[0].geometry.type === 'Point'
    ) {
      map.flyTo({
        center: geojson.features[0].geometry.coordinates,
        zoom: 6,
        duration: 1000
      });
    } else {
      const bounds = bbox(geojson);
      map.fitBounds(bounds, {
        padding: 50,
        duration: 1000
      });
    }
  };
  
  

const dummyGeojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        }
      }
    ]
  };

const Map = ({ data, recovery }) => {
    console.log('DATA', data)
    const mapContainer = useRef(null)
    const geocoderRef = useRef(null)
    const [styleLoaded, setStyleLoaded] = useState(false)

    let mapRef = useRef(null)

    if (!mapRef) {
        mapRef = useRef(null)
    }

    useEffect(() => {
        console.log('mapeffect')
        const map = (mapRef.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [0, 0],
            zoom: 2,
            accessToken,
            hash: true
        }))

        const geocoder = new mapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl
        })
        map.addControl(geocoder)

        if (geocoderRef) {
            geocoderRef.current = geocoder
        }

        map.addControl(new mapboxgl.NavigationControl())

        map.on('load', () => {
            setStyleLoaded(true)

            if (
                !map.getSource('map-data')
            ) {
                const { name } = map.getStyle();

                let color = DEFAULT_DARK_FEATURE_COLOR; // Sets default dark color for lighter base maps

                // Sets a light color for dark base map
                if (['Mapbox Dark'].includes(name)) {
                    color = DEFAULT_LIGHT_FEATURE_COLOR;
                }

                // Sets a brighter color for the satellite base map to help with visibility.
                if (['Mapbox Satellite Streets'].includes(name)) {
                    color = DEFAULT_SATELLITE_FEATURE_COLOR;
                }

                // setFog only on Light and Dark
                if (['Mapbox Light', 'Mapbox Dark', 'osm'].includes(name)) {
                    map.setFog({
                        range: [0.5, 10],
                        color: '#ffffff',
                        'high-color': '#245cdf',
                        'space-color': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            4,
                            '#010b19',
                            7,
                            '#367ab9'
                        ],
                        'horizon-blend': [
                            'interpolate',
                            ['exponential', 1.2],
                            ['zoom'],
                            5,
                            0.02,
                            7,
                            0.08
                        ],
                        'star-intensity': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            5,
                            0.35,
                            6,
                            0
                        ]
                    });
                }

                map.addSource('map-data', {
                    type: 'geojson',
                    data: dummyGeojson
                });

                map.addLayer({
                    id: 'map-data-fill',
                    type: 'fill',
                    source: 'map-data',
                    paint: {
                        'fill-color': ['coalesce', ['get', 'fill'], color],
                        'fill-opacity': ['coalesce', ['get', 'fill-opacity'], 0.3]
                    },
                    filter: ['==', ['geometry-type'], 'Polygon']
                });

                map.addLayer({
                    id: 'map-data-fill-outline',
                    type: 'line',
                    source: 'map-data',
                    paint: {
                        'line-color': ['coalesce', ['get', 'stroke'], color],
                        'line-width': ['coalesce', ['get', 'stroke-width'], 2],
                        'line-opacity': ['coalesce', ['get', 'stroke-opacity'], 1]
                    },
                    filter: ['==', ['geometry-type'], 'Polygon']
                });

                map.addLayer({
                    id: 'map-data-line',
                    type: 'line',
                    source: 'map-data',
                    paint: {
                        'line-color': ['coalesce', ['get', 'stroke'], color],
                        'line-width': ['coalesce', ['get', 'stroke-width'], 2],
                        'line-opacity': ['coalesce', ['get', 'stroke-opacity'], 1]
                    },
                    filter: ['==', ['geometry-type'], 'LineString']
                });

            }
        });

    }, [])

    useEffect(() => {
        console.log('effect', data)

        if (!data || !styleLoaded) return
        

        const geojson = data
        console.log('effect2', geojson, mapRef.current.getSource('map-data'))

        if (!geojson) return;

        const workingDatasetSource = mapRef.current.getSource('map-data');

        if (workingDatasetSource) {
            const filteredFeatures = geojson.features.filter(
                (feature) => feature.geometry
            );
            const filteredGeojson = {
                type: 'FeatureCollection',
                features: filteredFeatures
            };
            workingDatasetSource.setData(addIds(filteredGeojson));
            // addMarkers(filteredGeojson, context, writable);
            if (recovery) {
                zoomextent(filteredGeojson, mapRef.current);
                // context.data.set({
                //     recovery: false
                // });
            }
        }
    }, [data, styleLoaded])

    return (
        <div ref={mapContainer} className='map-container h-full' />
    )
}

export default Map