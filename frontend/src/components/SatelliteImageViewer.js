import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { MapContainer, TileLayer, ImageOverlay, LayersControl, Tooltip } from 'react-leaflet';
import { getSatelliteImageById, getIndicesForImage } from '../services/satellite';
import 'leaflet/dist/leaflet.css';

const { BaseLayer, Overlay } = LayersControl;

const SatelliteImageViewer = ({ imageId }) => {
  const [satelliteImage, setSatelliteImage] = useState(null);
  const [indices, setIndices] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([34.0, 9.0]); // Default to Tunisia center
  const [mapZoom, setMapZoom] = useState(7);

  // Color scales for different indices
  const colorScales = {
    NDVI: [
      { value: -1, color: '#d73027' },   // Red (barren)
      { value: -0.2, color: '#f46d43' },  // Orange-red
      { value: 0, color: '#fdae61' },     // Light orange
      { value: 0.2, color: '#fee08b' },   // Yellow
      { value: 0.4, color: '#d9ef8b' },   // Light green
      { value: 0.6, color: '#a6d96a' },   // Medium green
      { value: 0.8, color: '#66bd63' },   // Green
      { value: 1, color: '#1a9850' }      // Dark green (dense vegetation)
    ],
    NDWI: [
      { value: -1, color: '#d73027' },   // Red (no water)
      { value: -0.5, color: '#f46d43' },  // Orange-red
      { value: -0.3, color: '#fdae61' },  // Light orange
      { value: -0.1, color: '#fee08b' },  // Yellow
      { value: 0, color: '#d9ef8b' },     // Light blue-green
      { value: 0.2, color: '#a6d96a' },   // Medium blue-green
      { value: 0.4, color: '#66bd63' },   // Blue-green
      { value: 1, color: '#1a9850' }      // Dark blue (water)
    ],
    NDMI: [
      { value: -1, color: '#d73027' },   // Red (very dry)
      { value: -0.5, color: '#f46d43' },  // Orange-red
      { value: -0.3, color: '#fdae61' },  // Light orange
      { value: -0.1, color: '#fee08b' },  // Yellow
      { value: 0, color: '#d9ef8b' },     // Light blue-green
      { value: 0.2, color: '#a6d96a' },   // Medium blue-green
      { value: 0.4, color: '#66bd63' },   // Blue-green
      { value: 1, color: '#1a9850' }      // Dark blue (very moist)
    ],
    NDBI: [
      { value: -1, color: '#1a9850' },   // Dark green (non-built-up)
      { value: -0.5, color: '#66bd63' },  // Green
      { value: -0.3, color: '#a6d96a' },  // Light green
      { value: -0.1, color: '#d9ef8b' },  // Very light green
      { value: 0, color: '#fee08b' },     // Yellow
      { value: 0.2, color: '#fdae61' },   // Light orange
      { value: 0.4, color: '#f46d43' },   // Orange-red
      { value: 1, color: '#d73027' }      // Red (built-up)
    ],
    BSI: [
      { value: -1, color: '#1a9850' },   // Dark green (non-bare soil)
      { value: -0.5, color: '#66bd63' },  // Green
      { value: -0.3, color: '#a6d96a' },  // Light green
      { value: -0.1, color: '#d9ef8b' },  // Very light green
      { value: 0, color: '#fee08b' },     // Yellow
      { value: 0.2, color: '#fdae61' },   // Light orange
      { value: 0.4, color: '#f46d43' },   // Orange-red
      { value: 1, color: '#d73027' }      // Red (bare soil)
    ]
  };

  // Index descriptions
  const indexDescriptions = {
    NDVI: 'Normalized Difference Vegetation Index - Mesure la densité de végétation',
    NDWI: 'Normalized Difference Water Index - Détecte la présence d\'eau et l\'humidité',
    NDMI: 'Normalized Difference Moisture Index - Mesure l\'humidité de la végétation',
    NDBI: 'Normalized Difference Built-up Index - Identifie les zones bâties',
    BSI: 'Bare Soil Index - Détecte les sols nus'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch satellite image data
        const imageData = await getSatelliteImageById(imageId);
        setSatelliteImage(imageData);

        // Fetch indices for this image
        const indicesData = await getIndicesForImage(imageId);
        setIndices(indicesData);
        
        // Set default selected index if available
        if (indicesData.length > 0) {
          const ndviIndex = indicesData.find(idx => idx.index_type === 'NDVI');
          setSelectedIndex(ndviIndex || indicesData[0]);
        }

        // Set map center based on region geometry if available
        if (imageData.region && imageData.region.geometry) {
          const center = calculateCenter(imageData.region.geometry);
          setMapCenter(center);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching satellite data:', err);
        setError('Erreur lors du chargement des données satellite');
        setLoading(false);
      }
    };

    if (imageId) {
      fetchData();
    }
  }, [imageId]);

  // Calculate center of geometry
  const calculateCenter = (geometry) => {
    if (!geometry || !geometry.coordinates) return [34.0, 9.0];
    
    try {
      // Simple calculation for polygon centroid (approximate)
      if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
        const coords = geometry.type === 'Polygon' ? 
          geometry.coordinates[0] : 
          geometry.coordinates[0][0];
        
        let lat = 0, lng = 0;
        coords.forEach(coord => {
          lat += coord[1];
          lng += coord[0];
        });
        return [lat / coords.length, lng / coords.length];
      }
      return [34.0, 9.0];
    } catch (e) {
      console.error('Error calculating center:', e);
      return [34.0, 9.0];
    }
  };

  // Generate legend for the selected index
  const renderLegend = () => {
    if (!selectedIndex) return null;
    
    const scale = colorScales[selectedIndex.index_type] || colorScales.NDVI;
    
    return (
      <div className="index-legend">
        <h6>Légende: {selectedIndex.index_type}</h6>
        <div className="d-flex justify-content-between">
          {scale.map((item, index) => (
            <div key={index} className="legend-item">
              <div 
                className="color-box" 
                style={{ 
                  backgroundColor: item.color,
                  width: '20px',
                  height: '20px',
                  display: 'inline-block',
                  marginRight: '5px'
                }}
              />
              <span>{item.value.toFixed(1)}</span>
            </div>
          ))}
        </div>
        <small className="text-muted">{indexDescriptions[selectedIndex.index_type]}</small>
      </div>
    );
  };

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!satelliteImage) return <Alert variant="warning">Image satellite non trouvée</Alert>;

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5>Image Satellite: {satelliteImage.satellite_name}</h5>
        <div className="text-muted">
          Date d'acquisition: {new Date(satelliteImage.acquisition_date).toLocaleDateString()}
          {satelliteImage.cloud_cover && (
            <span className="ms-3">Couverture nuageuse: {satelliteImage.cloud_cover}%</span>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Sélectionner un indice</Form.Label>
              <Form.Select 
                value={selectedIndex ? selectedIndex.id : ''}
                onChange={(e) => {
                  const selected = indices.find(idx => idx.id.toString() === e.target.value);
                  setSelectedIndex(selected);
                }}
              >
                {indices.map(index => (
                  <option key={index.id} value={index.id}>
                    {index.index_type} - {new Date(index.created_at).toLocaleDateString()}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            {selectedIndex && (
              <div className="mt-3">
                <h6>Statistiques</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <th>Valeur min</th>
                      <td>{selectedIndex.min_value.toFixed(3)}</td>
                    </tr>
                    <tr>
                      <th>Valeur max</th>
                      <td>{selectedIndex.max_value.toFixed(3)}</td>
                    </tr>
                    <tr>
                      <th>Valeur moyenne</th>
                      <td>{selectedIndex.mean_value.toFixed(3)}</td>
                    </tr>
                  </tbody>
                </table>
                {renderLegend()}
              </div>
            )}
          </Col>
          <Col md={9}>
            <div style={{ height: '500px', width: '100%' }}>
              <MapContainer 
                center={mapCenter} 
                zoom={mapZoom} 
                style={{ height: '100%', width: '100%' }}
              >
                <LayersControl position="topright">
                  <BaseLayer checked name="OpenStreetMap">
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                  </BaseLayer>
                  <BaseLayer name="Satellite">
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                    />
                  </BaseLayer>
                  
                  {/* Display selected index overlay if available */}
                  {selectedIndex && selectedIndex.raster_file && (
                    <Overlay checked name={selectedIndex.index_type}>
                      <ImageOverlay
                        url={selectedIndex.raster_file}
                        bounds={[[34.5, 8.0], [33.5, 10.0]]} // This should be dynamically calculated based on the actual bounds
                        opacity={0.7}
                      >
                        <Tooltip permanent>
                          {selectedIndex.index_type}
                        </Tooltip>
                      </ImageOverlay>
                    </Overlay>
                  )}
                </LayersControl>
              </MapContainer>
            </div>
          </Col>
        </Row>
        
        {/* Download buttons */}
        <div className="d-flex justify-content-end">
          {satelliteImage.download_url && (
            <Button 
              variant="outline-primary" 
              href={satelliteImage.download_url} 
              target="_blank" 
              className="me-2"
            >
              Télécharger l'image originale
            </Button>
          )}
          {selectedIndex && selectedIndex.raster_file && (
            <Button 
              variant="outline-success" 
              href={selectedIndex.raster_file} 
              target="_blank"
            >
              Télécharger l'indice {selectedIndex.index_type}
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default SatelliteImageViewer;