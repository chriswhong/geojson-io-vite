import React from 'react'
import { FileDrop } from 'react-file-drop'
import { readDrop } from './readfile'
import { useAppContext } from './AppContext'
import cloneDeep from 'lodash/cloneDeep';

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

const DropZone = ({ children }) => {
    const { mapData, setMapData } = useAppContext()

    return (
        <FileDrop
            className='App'
            onDrop={(files) => {
                readDrop(files, (err, gj, warning) => {
                    console.log('readDrop', gj, warning)
                    if (err && err.message) {
                        // flash(context.container, err.message).classed('error', 'true');
                    }
                    if (gj && gj.features) {
                        const newFC = dataHelpers.mergeFeatures(gj.features, mapData);

                        setMapData(newFC)

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
            {children}
        </FileDrop>
    )
}

export default DropZone