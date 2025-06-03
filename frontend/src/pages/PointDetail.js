import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Breadcrumb } from 'react-bootstrap';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, LayersControl } from 'react-leaflet';
import { getPointById } from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const PointDetail = () => {
  const { id } = useParams();
  const [point, setPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPoint = async () => {
      try {
        const data = await getPointById(id);
        setPoint(data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    fetchPoint();
  }, [id]);

  if (loading) return <div className="text-center my-5">Chargement...</div>;
  if (error) return <div className="alert alert-danger my-5">{error}</div>;
  if (!point) return <div className="alert alert-warning my-5">Point d'intérêt non trouvé</div>;

  return (
    <Container>
      <Row className="mb-4">
        <Col md={12}>
          <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Accueil</Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/points" }}>Points d'intérêt</Breadcrumb.Item>
            <Breadcrumb.Item active>{point.name}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">{point.name}</h5>
            </Card.Header>
            <Card.Body>
              <Table bordered>
                <tbody>
                  <tr>
                    <th style={{ width: '30%' }}>Catégorie</th>
                    <td>{point.category || '-'}</td>
                  </tr>
                  <tr>
                    <th>Région</th>
                    <td>
                      <Link to={`/regions/${point.region.id}`}>{point.region.name}</Link>
                    </td>
                  </tr>
                  <tr>
                    <th>Coordonnées</th>
                    <td>
                      {point.location ? 
                        `${point.location.coordinates[0].toFixed(6)}, ${point.location.coordinates[1].toFixed(6)}` : 
                        'Non disponible'}
                    </td>
                  </tr>
                  <tr>
                    <th>Date de création</th>
                    <td>{new Date(point.created_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                </tbody>
              </Table>
              
              {point.description && (
                <div className="mt-3">
                  <h6>Description</h6>
                  <p>{point.description}</p>
                </div>
              )}
            </Card.Body>
          </Card>
          
          {point.image && (
            <Card className="mt-4">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">Image</h5>
              </Card.Header>
              <Card.Body className="text-center">
                <img src={point.image} alt={point.name} className="img-fluid rounded" />
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Localisation</h5>
            </Card.Header>
            <Card.Body>
              {point.location && (
                <MapContainer 
                  center={[point.location.coordinates[1], point.location.coordinates[0]]} 
                  zoom={13} 
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
                  
                  <Marker position={[point.location.coordinates[1], point.location.coordinates[0]]}>
                    <Popup>
                      <strong>{point.name}</strong><br />
                      Catégorie: {point.category || '-'}
                    </Popup>
                  </Marker>
                  
                  {point.region.geometry && (
                    <GeoJSON 
                      data={point.region.geometry} 
                      style={{
                        color: '#6c757d',
                        weight: 2,
                        opacity: 0.6,
                        fillColor: '#6c757d',
                        fillOpacity: 0.2
                      }}
                    />
                  )}
                </MapContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="bg-secondary text-white">
              <h5 className="mb-0">Contexte régional</h5>
            </Card.Header>
            <Card.Body>
              <p>Ce point d'intérêt est situé dans la région <strong>{point.region.name}</strong>.</p>
              
              <Row>
                <Col md={6}>
                  <h6>Informations sur la région</h6>
                  <Table bordered>
                    <tbody>
                      <tr>
                        <th>Population</th>
                        <td>{point.region.population || '-'}</td>
                      </tr>
                      <tr>
                        <th>Superficie</th>
                        <td>{point.region.area ? `${point.region.area} km²` : '-'}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h6>Autres points d'intérêt dans la région</h6>
                  {point.region.other_points && point.region.other_points.length > 0 ? (
                    <ul className="list-group">
                      {point.region.other_points.slice(0, 5).map(otherPoint => (
                        otherPoint.id !== point.id && (
                          <li key={otherPoint.id} className="list-group-item">
                            <Link to={`/points/${otherPoint.id}`}>{otherPoint.name}</Link>
                            <Badge bg="primary" className="float-end">{otherPoint.category}</Badge>
                          </li>
                        )
                      ))}
                    </ul>
                  ) : (
                    <p>Aucun autre point d'intérêt dans cette région</p>
                  )}
                  {point.region.other_points && point.region.other_points.length > 6 && (
                    <div className="mt-2 text-end">
                      <Link to={`/regions/${point.region.id}`} className="btn btn-sm btn-outline-primary">
                        Voir tous les points
                      </Link>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PointDetail;