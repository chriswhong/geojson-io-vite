import React, { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import mapboxGeocoder from '@mapbox/mapbox-gl-geocoder'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import accessToken from './access-token'

mapboxgl.accessToken = accessToken

const Map = (
    { }
) => {
    const mapContainer = useRef(null)
    const geocoderRef = useRef(null)

    let mapRef = useRef(null)

    if (!mapRef) {
        mapRef = useRef(null)
    }

    useEffect(() => {
        console.log('mapeffect')
        const map = (mapRef.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [0,0],
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
            console.log('loaded')
        })

    }, [])
    return (
        <div ref={mapContainer} className='map-container h-full'/>
    )
}

export default Map