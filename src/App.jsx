import React, { useEffect, useCallback } from 'react'

import './App.css'
import Map from './Map.jsx'
import qs from 'qs-hash'
import { useAppContext } from './AppContext.jsx';
import Header from './Header.jsx';
import DropZone from './DropZone.jsx';
import Sidebar from './Sidebar.jsx';
import { hasFeatures } from './map-utils.js';

function App() {

  const {
    setDirty,
    mapData,
    setMapData,
    setMeta,
    setSource,
    type,
    setType,
    setRecovery,
    allData,
    store
  } = useAppContext()

  const handleUnload = useCallback(() => {
    console.log('handleUnload', type === 'local', hasFeatures(mapData), allData())
    if (type === 'local' && hasFeatures(mapData)) {
      try {
        store.set('recover', allData());
      } catch (e) {
        // QuotaStorageExceeded
      }
    } else {
      store.remove('recover');
    }
  }, [mapData])

  useEffect(() => {
    const query = qs.stringQs(location.hash.split('#')[1] || '');

    if (location.hash !== '#new' && !query.id && !query.data) {
      const rec = store.get('recover')
      if (rec && confirm('recover your map from the last time you edited?')) {
        setDirty(rec.dirty)
        setMapData(rec.map)
        setMeta(rec.meta)
        setSource(rec.source)
        setType(rec.type)

        setRecovery(true)
      } else {
        store.remove('recover');
      }
    }

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [])

  return (
    <DropZone>
      <div className="geojsonio flex flex-col h-full">
       <Header/>
        <div className='ui-container flex-grow flex'>
          <div className='flex-grow'>
            <Map />
          </div>
          <div className='right w-1/3'>
            <Sidebar/>
          </div>
        </div>
      </div>

    </DropZone>
  )
}

export default App
