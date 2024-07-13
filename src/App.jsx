import { useState, useEffect } from 'react'
import { FileDrop } from 'react-file-drop'
import cloneDeep from 'lodash/cloneDeep';

import { readDrop } from './readfile'
import './App.css'
import Map from './Map.jsx'
import qs from 'qs-hash'


const dataHelpers = {
  mergeFeatures: (features, featureCollection, src) => {
    const FC = cloneDeep(featureCollection)
    function coerceNum(feature) {
      const props = feature.properties,
        keys = Object.keys(props),
        length = keys.length;

      for (let i = 0; i < length; i++) {
        const key = keys[i];
        const value = props[key];
        feature.properties[key] = losslessNumber(value);
      }

      return feature;
    }

    function losslessNumber(x) {
      const fl = parseFloat(x);
      if (fl.toString() === x) return fl;
      else return x;
    }

    FC.features = FC.features.concat(
      features.map(coerceNum)
    );

    return FC
  }
}

function App() {

  const [data, setData] = useState()

  useEffect(() => {
    const query = qs.stringQs(location.hash.split('#')[1] || '');

    if (location.hash !== '#new' && !query.id && !query.data) {
      const rec = JSON.parse(localStorage.getItem('recover'))
      if (rec && confirm('recover your map from the last time you edited?')) {
        setData({
          ...rec,
          recovery: true
        });
      } else {
        localStorage.removeItem('recover');
      }
    }
  }, [])

  console.log(data)

  return (
    <FileDrop
      className='App'
      onDrop={(files) => {
        readDrop(files, (err, gj, warning) => {
          if (err && err.message) {
            // flash(context.container, err.message).classed('error', 'true');
          }
          if (gj && gj.features) {
            const newFC = dataHelpers.mergeFeatures(gj.features, featureCollection);
            setFeatureCollection(newFC)
            
            if (warning) {
              // flash(context.container, warning.message);
            } else {
              // flash(
              //   context.container,
              //   'Imported ' + gj.features.length + ' features.'
              // ).classed('success', 'true');
            }
            // zoomextent(context);
          }
        })()
      }} >
      <div className="geojsonio flex flex-col h-full">
        <div className="text-white bg-mb-gray-dark font-sans px-3 flex">
          <div className="font-extrabold flex items-center tracking-wide text-base">
            geojson.io
          </div>
          <div className="flex-grow flex justify-end">
            <div style={{ height: 42 }}></div>
            <div className="flex items-center bg-pink" style={{ fontSize: 10 }}>
              powered by
              <div className="pr-3">
                <div className="bg-no-repeat bg-center ml-2" style={{
                  height: 18,
                  width: 76,
                  backgroundImage: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3OTAgMTgwIj48cGF0aCBkPSJNODkuMSAxLjhDMzkuOSAxLjggMCA0MS43IDAgOTAuOSAwIDE0MC4xIDM5LjkgMTgwIDg5LjEgMTgwYzQ5LjIgMCA4OS4xLTM5LjkgODkuMS04OS4xIDAtNDkuMi0zOS45LTg5LjEtODkuMS04OS4xem00NTcuOCAxOS43Yy0xLjIgMC0yLjIgMS0yLjIgMi4ydjEwMy4yYzAgMS4yIDEgMi4yIDIuMiAyLjJoMTMuNGMxLjIgMCAyLjItMSAyLjItMi4ydi03LjFjNi45IDcuMiAxNi40IDExLjMgMjYuMyAxMS4zIDIwLjkgMCAzNy45LTE4IDM3LjktNDAuMyAwLTIyLjMtMTctNDAuMi0zNy45LTQwLjItMTAgMC0xOS41IDQuMS0yNi4zIDExLjNWMjMuN2MwLTEuMi0xLTIuMi0yLjItMi4yaC0xMy40ek05OC4zIDM2LjRjMTEuNC4zIDIyLjkgNC44IDMxLjcgMTMuNyAxNy43IDE3LjcgMTguMyA0NS43IDEuNCA2Mi43LTMwLjUgMzAuNS04NC44IDIwLjctODQuOCAyMC43cy05LjgtNTQuMyAyMC43LTg0LjhjOC41LTguNCAxOS43LTEyLjUgMzEtMTIuM3ptMTYwLjMgMTQuMmMtOC4yIDAtMTUuOSA0LTIwLjggMTAuNnYtNi40YzAtMS4yLTEtMi4yLTIuMi0yLjJoLTEzLjRjLTEuMiAwLTIuMiAxLTIuMiAyLjJWMTI3YzAgMS4yIDEgMi4yIDIuMiAyLjJoMTMuNGMxLjIgMCAyLjItMSAyLjItMi4yVjgzLjhjLjUtOS43IDcuMi0xNy4zIDE1LjQtMTcuMyA4LjUgMCAxNS42IDcuMSAxNS42IDE2LjV2NDRjMCAxLjIgMSAyLjIgMi4yIDIuMmgxMy41YzEuMiAwIDIuMi0xIDIuMi0yLjJsLS4xLTQ0LjljMS4yLTguOCA3LjYtMTUuNiAxNS4zLTE1LjYgOC41IDAgMTUuNiA3LjEgMTUuNiAxNi41djQ0YzAgMS4yIDEgMi4yIDIuMiAyLjJoMTMuNWMxLjIgMCAyLjItMSAyLjItMi4ybC0uMS00OS42Yy4zLTE0LjgtMTIuMy0yNi44LTI3LjktMjYuOC0xMCAuMS0xOS4yIDUuOS0yMy41IDE1LTUtOS4zLTE0LjctMTUuMS0yNS4zLTE1em0xMjcuOSAwYy0yMC45IDAtMzcuOSAxOC0zNy45IDQwLjMgMCAyMi4zIDE3IDQwLjMgMzcuOSA0MC4zIDEwIDAgMTkuNS00LjEgMjYuMy0xMS4zdjcuMWMwIDEuMiAxIDIuMiAyLjIgMi4yaDEzLjRjMS4yIDAgMi4yLTEgMi4yLTIuMlY1NC44Yy4xLTEuMi0uOS0yLjItMi4yLTIuMkg0MTVjLTEuMiAwLTIuMiAxLTIuMiAyLjJ2Ny4xYy02LjktNy4yLTE2LjQtMTEuMy0yNi4zLTExLjN6bTEwNi4xIDBjLTEwIDAtMTkuNSA0LjEtMjYuMyAxMS4zdi03LjFjMC0xLjItMS0yLjItMi4yLTIuMmgtMTMuNGMtMS4yIDAtMi4yIDEtMi4yIDIuMlYxNThjMCAxLjIgMSAyLjIgMi4yIDIuMmgxMy40YzEuMiAwIDIuMi0xIDIuMi0yLjJ2LTM4LjJjNi45IDcuMiAxNi40IDExLjMgMjYuMyAxMS4zIDIwLjkgMCAzNy45LTE4IDM3LjktNDAuMyAwLTIyLjMtMTctNDAuMi0zNy45LTQwLjJ6bTE4NS41IDBjLTIyLjcgMC00MSAxOC00MSA0MC4zIDAgMjIuMyAxOC40IDQwLjMgNDEgNDAuM3M0MS0xOCA0MS00MC4zYzAtMjIuMy0xOC4zLTQwLjMtNDEtNDAuM3ptNDUuNCAyYy0xLjEgMC0yIC45LTIgMiAwIC40LjEuOC4zIDEuMWwyMyAzNS0yMy4zIDM1LjRjLS42LjktLjQgMi4yLjYgMi44LjMuMi43LjMgMS4xLjNoMTUuNWMxLjIgMCAyLjMtLjYgMi45LTEuNmwxMy44LTIzLjEgMTMuOCAyMy4xYy42IDEgMS43IDEuNiAyLjkgMS42aDE1LjVjMS4xIDAgMi0uOSAyLTIgMC0uNC0uMS0uNy0uMy0xLjFMNzY2IDkwLjdsMjMtMzVjLjYtLjkuNC0yLjItLjYtMi44LS4zLS4yLS43LS4zLTEuMS0uM2gtMTUuNWMtMS4yIDAtMi4zLjYtMi45IDEuNmwtMTMuNSAyMi43LTEzLjUtMjIuN2MtLjYtMS0xLjctMS42LTIuOS0xLjZoLTE1LjV6TTk5LjMgNTRsLTguNyAxOC0xNy45IDguNyAxNy45IDguNyA4LjcgMTggOC44LTE4IDE3LjktOC43LTE3LjktOC43LTguOC0xOHptMjkwLjMgMTIuN2MxMi43IDAgMjMgMTAuNyAyMy4yIDIzLjl2LjZjLS4xIDEzLjItMTAuNSAyMy45LTIzLjIgMjMuOS0xMi44IDAtMjMuMi0xMC44LTIzLjItMjQuMiAwLTEzLjQgMTAuNC0yNC4yIDIzLjItMjQuMnptOTkuOCAwYzEyLjggMCAyMy4yIDEwLjggMjMuMiAyNC4yIDAgMTMuNC0xMC40IDI0LjItMjMuMiAyNC4yLTEyLjcgMC0yMy0xMC43LTIzLjItMjMuOXYtLjZjLjItMTMuMiAxMC41LTIzLjkgMjMuMi0yMy45em05Ni4zIDBjMTIuOCAwIDIzLjIgMTAuOCAyMy4yIDI0LjIgMCAxMy40LTEwLjQgMjQuMi0yMy4yIDI0LjItMTIuNyAwLTIzLTEwLjctMjMuMi0yMy45di0uNmMuMi0xMy4yIDEwLjUtMjMuOSAyMy4yLTIzLjl6bTkyLjIgMGMxMi44IDAgMjMuMiAxMC44IDIzLjIgMjQuMiAwIDEzLjQtMTAuNCAyNC4yLTIzLjIgMjQuMi0xMi44IDAtMjMuMi0xMC44LTIzLjItMjQuMiAwLTEzLjQgMTAuNC0yNC4yIDIzLjItMjQuMnoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=)'
                }}></div>
              </div>
              <div className="hidden md:flex pl-3 border-l border-solid border-gray-700 h-full  items-center">
                <a className="bg-mb-purple-500 hover:bg-mb-purple-700 hover:text-white text-white text-xs font-bold py-1 px-4 rounded transition-all duration-200"
                  href="https://account.mapbox.com/auth/signup/">
                  Sign up for Mapbox
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className='ui-container flex-grow flex'>
          <div className='flex-grow'>
            <Map data={data} />
          </div>
          <div className='right w-1/3'>
            {JSON.stringify(data?.map, null, 2)}
          </div>
        </div>
      </div>

    </FileDrop>
  )
}

export default App
