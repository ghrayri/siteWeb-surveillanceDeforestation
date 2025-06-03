import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function IndexAnalysisVisualizer({ indexAnalysis }) {
  return (
    <div className="index-analysis-visualizer">
      <h3>Analyse d'indice</h3>
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
          {indexAnalysis.user_zone && indexAnalysis.user_zone.geometry && (
            <GeoJSON 
              data={indexAnalysis.user_zone.geometry} 
              style={{ color: '#3388ff', weight: 2 }}
            />
          )}
        </MapContainer>
      </div>
      <div className="analysis-values">
        <p>Résultat: {indexAnalysis.analysis_result}</p>
        <p>Valeur min: {indexAnalysis.min_value}</p>
        <p>Valeur max: {indexAnalysis.max_value}</p>
        <p>Valeur moyenne: {indexAnalysis.mean_value}</p>
        <p>Créé le: {new Date(indexAnalysis.created_at).toLocaleDateString()}</p>
        <p>Mis à jour le: {new Date(indexAnalysis.updated_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}