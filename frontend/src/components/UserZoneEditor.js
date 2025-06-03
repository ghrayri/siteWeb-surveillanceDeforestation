import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { MapContainer, TileLayer, FeatureGroup, Polygon } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { createUserZone, getUserZones, getZoneAnalyses } from '../services/satellite';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

const UserZoneEditor = ({ regionId }) => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [zoneDescription, setZoneDescription] = useState('');
  const [drawnItems, setDrawnItems] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [zoneAnalyses, setZoneAnalyses] = useState([]);
  const [showAnalysesModal, setShowAnalysesModal] = useState(false);
  
  const featureGroupRef = useRef(null);

  useEffect(() => {
    const fetchUserZones = async () => {
      try {
        setLoading(true);
        const zonesData = await getUserZones();
        
        // Filter zones by region if regionId is provided
        const filteredZones = regionId 
          ? zonesData.filter(zone => zone.properties.region_id === parseInt(regionId))
          : zonesData;
          
        setZones(filteredZones);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user zones:', err);
        setError('Erreur lors du chargement des zones utilisateur');
        setLoading(false);
      }
    };

    fetchUserZones();
  }, [regionId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!drawnItems) {
      setError('Veuillez dessiner une zone sur la carte');
      return;
    }
    
    try {
      setLoading(true);
      
      // Extract GeoJSON from drawn items
      const geoJson = drawnItems.toGeoJSON();
      
      // Create zone data object
      let geometry = geoJson.features[0].geometry;
      if (geometry.type === 'Polygon') {
        geometry = {
          type: 'MultiPolygon',
          coordinates: [geometry.coordinates]
        };
      }
      const zoneData = {
        name: zoneName,
        description: zoneDescription,
        geometry: geometry,
        region: regionId
      };
      
      // Send to API
      const newZone = await createUserZone(zoneData);
      
      // Update local state
      setZones([...zones, newZone]);
      
      // Reset form
      setZoneName('');
      setZoneDescription('');
      setDrawnItems(null);
      setShowForm(false);
      
      // Clear drawn items from map
      if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers();
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error creating user zone:', err);
      
      // Improved error handling with specific validation messages
      if (!drawnItems) {
        setError('Veuillez dessiner une zone valide sur la carte');
      } else if (!zoneName) {
        setError('Veuillez donner un nom à votre zone');
      } else if (err.response?.status === 400) {
        // Handle backend validation errors
        const errors = err.response?.data?.errors || {};
        const errorMessages = Object.values(errors).flat();
        setError(errorMessages.join('\n') || 'Données de zone invalides');
      } else {
        setError(err.response?.data?.detail || err.response?.data?.error || 
               JSON.stringify(err.response?.data) || 'Erreur lors de la création de la zone');
      }
      
      setLoading(false);
    }
  };

  const handleDrawCreated = (e) => {
    setDrawnItems(e.layer);
  };

  const viewZoneAnalyses = async (zone) => {
    try {
      setLoading(true);
      setSelectedZone(zone);
      
      // Fetch analyses for this zone
      const analyses = await getZoneAnalyses(zone.id);
      setZoneAnalyses(analyses);
      
      setShowAnalysesModal(true);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching zone analyses:', err);
      setError('Erreur lors du chargement des analyses de la zone');
      setLoading(false);
    }
  };

  // Get color based on index type
  const getIndexColor = (indexType) => {
    switch (indexType) {
      case 'NDVI':
        return '#1a9850'; // Green
      case 'NDWI':
        return '#4575b4'; // Blue
      case 'NDMI':
        return '#91bfdb'; // Light blue
      case 'NDBI':
        return '#d73027'; // Red
      case 'BSI':
        return '#fdae61'; // Orange
      default:
        return '#1a9850';
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5>Mes Zones d'Analyse</h5>
        <Button 
          variant="success" 
          size="sm" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Annuler' : 'Créer une nouvelle zone'}
        </Button>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {showForm && (
          <div className="mb-4">
            <h6>Dessiner une nouvelle zone</h6>
            <p className="text-muted small">Utilisez les outils de dessin pour créer un polygone sur la carte.</p>
            
            <div style={{ height: '400px', marginBottom: '1rem' }}>
              <MapContainer 
                center={[34.0, 9.0]} 
                zoom={7} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <FeatureGroup ref={featureGroupRef}>
                  <EditControl
                    position="topright"
                    onCreated={handleDrawCreated}
                    draw={{
                      rectangle: false,
                      circle: false,
                      circlemarker: false,
                      marker: false,
                      polyline: false,
                      polygon: true
                    }}
                  />
                </FeatureGroup>
              </MapContainer>
            </div>
            
            <Form onSubmit={handleCreate}>
              <Form.Group className="mb-3">
                <Form.Label>Nom de la zone</Form.Label>
                <Form.Control 
                  type="text" 
                  value={zoneName} 
                  onChange={(e) => setZoneName(e.target.value)} 
                  required 
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  value={zoneDescription} 
                  onChange={(e) => setZoneDescription(e.target.value)} 
                />
              </Form.Group>
              
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading || !drawnItems}
              >
                {loading ? <Spinner animation="border" size="sm" /> : 'Enregistrer la zone'}
              </Button>
            </Form>
          </div>
        )}
        
        <h6>Mes zones ({zones.length})</h6>
        {loading ? (
          <div className="text-center my-3">
            <Spinner animation="border" size="sm" />
          </div>
        ) : zones.length > 0 ? (
          <div className="list-group">
            {zones.map(zone => (
              <div 
                key={zone.id} 
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              >
                <div>
                  <h6 className="mb-1">{zone.properties.name}</h6>
                  <p className="mb-1 text-muted small">{zone.properties.description}</p>
                  <small>Créée le {new Date(zone.properties.created_at).toLocaleDateString()}</small>
                </div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={() => viewZoneAnalyses(zone)}
                >
                  Voir les analyses
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Alert variant="info">Vous n'avez pas encore créé de zones d'analyse.</Alert>
        )}
      </Card.Body>
      
      {/* Modal for zone analyses */}
      <Modal 
        show={showAnalysesModal} 
        onHide={() => setShowAnalysesModal(false)} 
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedZone && `Analyses pour ${selectedZone.properties.name}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center my-3">
              <Spinner animation="border" />
            </div>
          ) : zoneAnalyses.length > 0 ? (
            <div>
              <div className="mb-4">
                <h6>Résumé des analyses</h6>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {['NDVI', 'NDWI', 'NDMI', 'NDBI', 'BSI'].map(indexType => {
                    const analyses = zoneAnalyses.filter(a => a.index_type === indexType);
                    if (analyses.length === 0) return null;
                    
                    // Calculate average value
                    const avgValue = analyses.reduce((sum, a) => sum + a.mean_value, 0) / analyses.length;
                    
                    return (
                      <div 
                        key={indexType} 
                        className="p-2 rounded" 
                        style={{ 
                          backgroundColor: getIndexColor(indexType), 
                          color: 'white',
                          minWidth: '120px'
                        }}
                      >
                        <div className="fw-bold">{indexType}</div>
                        <div>Moy: {avgValue.toFixed(2)}</div>
                        <div className="small">{analyses.length} mesures</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <h6>Historique des analyses</h6>
              <div className="table-responsive">
                <table className="table table-striped table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Indice</th>
                      <th>Min</th>
                      <th>Max</th>
                      <th>Moyenne</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zoneAnalyses.map(analysis => (
                      <tr key={analysis.id}>
                        <td>{new Date(analysis.acquisition_date).toLocaleDateString()}</td>
                        <td>
                          <span 
                            className="badge" 
                            style={{ 
                              backgroundColor: getIndexColor(analysis.index_type),
                              color: 'white'
                            }}
                          >
                            {analysis.index_type}
                          </span>
                        </td>
                        <td>{analysis.min_value.toFixed(3)}</td>
                        <td>{analysis.max_value.toFixed(3)}</td>
                        <td>{analysis.mean_value.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <Alert variant="info">
              Aucune analyse disponible pour cette zone. Les analyses sont générées automatiquement lorsque de nouvelles images satellite sont traitées.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAnalysesModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default UserZoneEditor;