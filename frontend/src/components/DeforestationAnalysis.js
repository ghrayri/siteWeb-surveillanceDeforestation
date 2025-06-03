import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { MapContainer, TileLayer, GeoJSON, LayersControl, ImageOverlay, Tooltip } from 'react-leaflet';
import { getLatestIndices, getSatelliteImages } from '../services/satellite';
import { getRegionById } from '../services/api';
import 'leaflet/dist/leaflet.css';

const { BaseLayer, Overlay } = LayersControl;

const DeforestationAnalysis = ({ regionId }) => {
  const [region, setRegion] = useState(null);
  const [indices, setIndices] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [timeRange, setTimeRange] = useState('1');
  const [indexType, setIndexType] = useState('NDVI');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([34.0, 9.0]); // Default to Tunisia center
  const [mapZoom, setMapZoom] = useState(7);
  const [comparisonData, setComparisonData] = useState(null);

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
        
        // Fetch region data
        if (regionId) {
          const regionData = await getRegionById(regionId);
          setRegion(regionData);
          
          // Set map center based on region geometry
          if (regionData.geometry) {
            const center = calculateCenter(regionData.geometry);
            setMapCenter(center);
          }
        }
        
        // Fetch indices based on selected parameters
        const params = {
          type: indexType,
          days: timeRange * 365, // Convert years to days
          region: regionId
        };
        
        const indicesData = await getLatestIndices(params);
        setIndices(indicesData);
        
        // Select the two most recent indices for comparison if available
        if (indicesData.length >= 2) {
          setSelectedIndices([indicesData[0], indicesData[1]]);
          
          // Calculate comparison data
          calculateComparison(indicesData[0], indicesData[1]);
        } else if (indicesData.length === 1) {
          setSelectedIndices([indicesData[0]]);
          setComparisonData(null);
        } else {
          setSelectedIndices([]);
          setComparisonData(null);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    fetchData();
  }, [regionId, timeRange, indexType]);

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

  // Calculate comparison between two indices
  const calculateComparison = (newer, older) => {
    if (!newer || !older) return;
    
    const meanDiff = newer.mean_value - older.mean_value;
    const percentChange = (meanDiff / Math.abs(older.mean_value)) * 100;
    
    let interpretation = '';
    let status = '';
    
    // Interpret the change based on index type
    switch (indexType) {
      case 'NDVI':
        if (percentChange < -10) {
          interpretation = 'Diminution significative de la végétation';
          status = 'danger';
        } else if (percentChange < -5) {
          interpretation = 'Légère diminution de la végétation';
          status = 'warning';
        } else if (percentChange > 10) {
          interpretation = 'Augmentation significative de la végétation';
          status = 'success';
        } else if (percentChange > 5) {
          interpretation = 'Légère augmentation de la végétation';
          status = 'info';
        } else {
          interpretation = 'Pas de changement significatif';
          status = 'secondary';
        }
        break;
      
      case 'NDWI':
        if (percentChange < -10) {
          interpretation = 'Diminution significative des surfaces d\'eau';
          status = 'danger';
        } else if (percentChange < -5) {
          interpretation = 'Légère diminution des surfaces d\'eau';
          status = 'warning';
        } else if (percentChange > 10) {
          interpretation = 'Augmentation significative des surfaces d\'eau';
          status = 'success';
        } else if (percentChange > 5) {
          interpretation = 'Légère augmentation des surfaces d\'eau';
          status = 'info';
        } else {
          interpretation = 'Pas de changement significatif';
          status = 'secondary';
        }
        break;
      
      case 'NDMI':
        if (percentChange < -10) {
          interpretation = 'Diminution significative de l\'humidité';
          status = 'danger';
        } else if (percentChange < -5) {
          interpretation = 'Légère diminution de l\'humidité';
          status = 'warning';
        } else if (percentChange > 10) {
          interpretation = 'Augmentation significative de l\'humidité';
          status = 'success';
        } else if (percentChange > 5) {
          interpretation = 'Légère augmentation de l\'humidité';
          status = 'info';
        } else {
          interpretation = 'Pas de changement significatif';
          status = 'secondary';
        }
        break;
      
      default:
        interpretation = 'Analyse non disponible pour cet indice';
        status = 'secondary';
    }
    
    setComparisonData({
      meanDiff,
      percentChange,
      interpretation,
      status,
      newerDate: new Date(newer.acquisition_date).toLocaleDateString(),
      olderDate: new Date(older.acquisition_date).toLocaleDateString()
    });
  };

  // Generate legend for the selected index
  const renderLegend = () => {
    const scale = colorScales[indexType] || colorScales.NDVI;
    
    return (
      <div className="index-legend">
        <h6>Légende: {indexType}</h6>
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
        <small className="text-muted">{indexDescriptions[indexType]}</small>
      </div>
    );
  };

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!region) return <Alert variant="warning">Région non trouvée</Alert>;

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5>Analyse de Déforestation: {region.name}</h5>
        <div className="text-muted">
          Superficie: {region.area} km² | Population: {region.population}
        </div>
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Type d'indice</Form.Label>
              <Form.Select 
                value={indexType}
                onChange={(e) => setIndexType(e.target.value)}
              >
                <option value="NDVI">NDVI - Végétation</option>
                <option value="NDWI">NDWI - Eau</option>
                <option value="NDMI">NDMI - Humidité</option>
                <option value="NDBI">NDBI - Zones bâties</option>
                <option value="BSI">BSI - Sols nus</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Période d'analyse (années)</Form.Label>
              <Form.Select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="1">1 an</option>
                <option value="2">2 ans</option>
                <option value="3">3 ans</option>
                <option value="5">5 ans</option>
                <option value="10">10 ans</option>
              </Form.Select>
            </Form.Group>
            
            {renderLegend()}
            
            {comparisonData && (
              <div className="mt-4">
                <h6>Analyse comparative</h6>
                <Alert variant={comparisonData.status}>
                  {comparisonData.interpretation}
                </Alert>
                <Table size="sm" bordered>
                  <tbody>
                    <tr>
                      <th>Période</th>
                      <td>{comparisonData.olderDate} à {comparisonData.newerDate}</td>
                    </tr>
                    <tr>
                      <th>Changement</th>
                      <td>{comparisonData.percentChange.toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </Table>
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
                  
                  {/* Display region boundary */}
                  {region.geometry && (
                    <Overlay checked name="Limites de la région">
                      <GeoJSON 
                        data={region.geometry}
                        style={() => ({
                          color: '#ff7800',
                          weight: 2,
                          opacity: 0.65,
                          fillOpacity: 0.1
                        })}
                      />
                    </Overlay>
                  )}
                  
                  {/* Display selected indices overlays if available */}
                  {selectedIndices.map((index, idx) => (
                    index.raster_file && (
                      <Overlay 
                        key={index.id} 
                        checked 
                        name={`${indexType} - ${new Date(index.acquisition_date).toLocaleDateString()}`}
                      >
                        <ImageOverlay
                          url={index.raster_file}
                          bounds={[[34.5, 8.0], [33.5, 10.0]]} // This should be dynamically calculated
                          opacity={0.7}
                        >
                          <Tooltip permanent>
                            {indexType} - {new Date(index.acquisition_date).toLocaleDateString()}
                          </Tooltip>
                        </ImageOverlay>
                      </Overlay>
                    )
                  ))}
                </LayersControl>
              </MapContainer>
            </div>
          </Col>
        </Row>
        
        {/* Index data table */}
        <h6 className="mt-4">Historique des indices {indexType}</h6>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Valeur min</th>
              <th>Valeur max</th>
              <th>Valeur moyenne</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {indices.length > 0 ? (
              indices.map(index => (
                <tr key={index.id}>
                  <td>{new Date(index.acquisition_date).toLocaleDateString()}</td>
                  <td>{index.min_value.toFixed(3)}</td>
                  <td>{index.max_value.toFixed(3)}</td>
                  <td>{index.mean_value.toFixed(3)}</td>
                  <td>
                    {index.raster_file && (
                      <Button 
                        size="sm" 
                        variant="outline-primary" 
                        href={index.raster_file} 
                        target="_blank"
                      >
                        Télécharger
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">Aucune donnée disponible</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default DeforestationAnalysis;