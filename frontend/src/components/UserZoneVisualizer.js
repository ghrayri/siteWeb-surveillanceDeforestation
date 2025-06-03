import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function UserZoneVisualizer({ userZone }) {
  return (
    <div className="user-zone-visualizer">
      <h3>{userZone.name}</h3>
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
          {userZone.geometry && (
            <GeoJSON 
              data={userZone.geometry} 
              style={{ color: '#3388ff', weight: 2 }}
            />
          )}
        </MapContainer>
      </div>
      <div className="zone-info">
        <p>Créé le: {new Date(userZone.created_at).toLocaleDateString()}</p>
        <p>Mis à jour le: {new Date(userZone.updated_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}