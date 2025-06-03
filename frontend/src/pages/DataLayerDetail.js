import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Breadcrumb, Button } from 'react-bootstrap';
import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import { getDataLayerById } from '../services/api';
import 'leaflet/dist/leaflet.css';

const DataLayerDetail = () => {
  const { id } = useParams();
  const [layer, setLayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLayer = async () => {
      try {
        const data = await getDataLayerById(id);
        setLayer(data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    fetchLayer();
  }, [id]);

  if (loading) return <div className="text-center my-5">Chargement...</div>;
  if (error) return <div className="alert alert-danger my-5">{error}</div>;
  if (!layer) return <div className="alert alert-warning my-5">Couche de données non trouvée</div>;

  // Calculate center of geometry for map
  const getBoundsCenter = (geometry) => {
    if (!geometry || !geometry.coordinates) return [34.0, 9.0]; // Default to Tunisia center
    
    try {
      // Simple calculation for polygon centroid (approximate)
      if (geometry.type === 'Polygon') {
        const coords = geometry.coordinates[0];
        let lat = 0, lng = 0;
        coords.forEach(coord => {
          lat += coord[1];
          lng += coord[0];
        });
        return [lat / coords.length, lng / coords.length];
      } else {
        return [34.0, 9.0]; // Default for other geometry types
      }
    } catch (e) {
      return [34.0, 9.0]; // Default to Tunisia center
    }
  };

  const center = getBoundsCenter(layer.geometry);

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Accueil</Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/layers" }}>Couches de données</Breadcrumb.Item>
            <Breadcrumb.Item active>{layer.properties.name}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={5}>
          <Card>
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">{layer.properties.name}</h5>
            </Card.Header>
            <Card.Body>
              <Table bordered>
                <tbody>
                  <tr>
                    <th style={{ width: '30%' }}>Catégorie</th>
                    <td>{layer.properties.category || '-'}</td>
                  </tr>
                  <tr>
                    <th>Type de géométrie</th>
                    <td>{layer.geometry?.type || '-'}</td>
                  </tr>
                  <tr>
                    <th>Date de création</th>
                    <td>{new Date(layer.properties.created_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                  <tr>
                    <th>Dernière mise à jour</th>
                    <td>{new Date(layer.properties.updated_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                </tbody>
              </Table>
              
              {layer.properties.description && (
                <div className="mt-3">
                  <h6>Description</h6>
                  <p>{layer.properties.description}</p>
                </div>
              )}
              
              {layer.properties.file && (
                <div className="mt-3">
                  <Button variant="outline-primary" href={layer.properties.file} download>
                    Télécharger les données
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={7}>
          <Card>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Visualisation</h5>
            </Card.Header>
            <Card.Body>
              <MapContainer 
                center={center} 
                zoom={8} 
                className="map-container"
              >
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="OpenStreetMap">
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Satellite">
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
                
                {layer.geometry && (
                  <GeoJSON 
                    data={layer.geometry} 
                    style={{
                      color: '#17a2b8',
                      weight: 2,
                      opacity: 0.8,
                      fillColor: '#17a2b8',
                      fillOpacity: 0.2
                    }}
                  />
                )}
              </MapContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-secondary text-white">
              <h5 className="mb-0">Informations techniques</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Métadonnées</h6>
                  <Table bordered size="sm">
                    <tbody>
                      <tr>
                        <th>Format</th>
                        <td>GeoJSON</td>
                      </tr>
                      <tr>
                        <th>Système de coordonnées</th>
                        <td>WGS84 (EPSG:4326)</td>
                      </tr>
                      <tr>
                        <th>ID</th>
                        <td>{layer.id}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h6>Utilisation</h6>
                  <p>
                    Cette couche de données peut être utilisée pour des analyses spatiales 
                    et des visualisations cartographiques. Vous pouvez télécharger les données 
                    pour les utiliser dans des logiciels SIG comme QGIS ou ArcGIS.
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DataLayerDetail;