
"use client"
import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { getArea, getLength } from 'ol/sphere';

// Define an interface for measurement
interface Measurement {
    type: string;
    value: string;
}

const MapComponent = () => {
    const mapRef = useRef(null);
    const [measurement, setMeasurement] = useState<Measurement | null>(null); // Use Measurement or null

    useEffect(() => {
        const map = new Map({
            target: mapRef.current ?? "",
            layers: [
                new TileLayer({
                    source: new OSM()
                })
            ],
            view: new View({
                center: [0, 0],
                zoom: 2
            })
        });

        const vectorSource = new VectorSource();
        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)',
                }),
                stroke: new Stroke({
                    color: '#ffcc33',
                    width: 2,
                }),
                image: new CircleStyle({
                    radius: 7,
                    fill: new Fill({
                        color: '#ffcc33',
                    }),
                }),
            }),
        });
        map.addLayer(vectorLayer);

        // Draw interaction for polygon
        const drawPolygon = new Draw({
            source: vectorSource,
            type: 'Polygon',
        });

        // Draw interaction for line
        const drawLine = new Draw({
            source: vectorSource,
            type: 'LineString',
        });

        map.addInteraction(drawPolygon);
        map.addInteraction(drawLine);

        // Modify interaction to modify drawn features
        const modify = new Modify({ source: vectorSource });
        map.addInteraction(modify);

        // Snap interaction to snap to nearby features
        const snap = new Snap({ source: vectorSource });
        map.addInteraction(snap);

        // Event listeners for measurement calculation
        drawLine.on('drawend', function (event) {
            const geometry = event.feature.getGeometry();
            const length = getLength(geometry!);
            setMeasurement({
                type: 'Line',
                value: length.toFixed(2),
            });
        });

        drawPolygon.on('drawend', function (event) {
            const geometry = event.feature.getGeometry();
            const area = getArea(geometry!);
            setMeasurement({
                type: 'Polygon',
                value: area.toFixed(2),
            });
        });

        return () => {
            map.dispose(); // Dispose the map instance to prevent memory leaks
        };
    }, [mapRef.current]);

    return (
        <div>
            <div ref={mapRef} style={{ width: '100%', height: '500px' }}></div>
            {measurement && (
                <div>
                    <p>{`Measurement Type: ${measurement.type}`}</p>
                    <p>{`Value: ${measurement.value}`}</p>
                </div>  
            )}
        </div>
    );
};

export default MapComponent;
