import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function RealTimeVisualizer({ RealTime }) {
  return (
    <div className="realtime-data-visualizer">
      <h3>{RealTime.source}</h3>
      <div className="map-container">
        <MapContainer 
          center={[0, 0]} 
          zoom={2} 
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {RealTime.region && (
            <GeoJSON 
              data={RealTime.region.geometry} 
              style={{ color: '#3388ff', weight: 2 }}
            />
          )}
        </MapContainer>
      </div>
      <div className="data-values">
        <p>Source: {RealTime.source}</p>
        <p>Payload: {JSON.stringify(RealTime.payload)}</p>
        <p>Timestamp: {new Date(RealTime.timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
}