import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const { Overlay } = LayersControl;

const EODataDetail = () => {
  const { id } = useParams();
  const [eoData, setEoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/eo-data/${id}/`)
      .then(res => {
        setEoData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch EO data detail.");
        setLoading(false);
      });
  }, [id]);

  // Center on Tunisia
  const mapCenter = [34.0, 9.0];
  const mapZoom = 7;

  return (
    <div>
      <h2>Détail EOData</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {eoData && (
        <>
          <p><strong>ID:</strong> {eoData.id}</p>
          <p><strong>Name:</strong> {eoData.name || "N/A"}</p>
          {/* Add more EO data fields as needed */}
          <div style={{ height: "400px", marginBottom: "1rem" }}>
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {eoData.geometry && (
                <LayersControl position="topright">
                  <Overlay checked name="EO Layer">
                    <GeoJSON data={eoData.geometry} style={{ color: "#3388ff", weight: 2, fillOpacity: 0.2 }} />
                  </Overlay>
                </LayersControl>
              )}
            </MapContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default EODataDetail;