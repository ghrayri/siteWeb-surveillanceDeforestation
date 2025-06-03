import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Breadcrumb, Spinner, Alert, Table } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { getRegionById } from '../services/api';
import { getSatelliteImages, getSatellites } from '../services/satellite';
import SatelliteImageViewer from '../components/SatelliteImageViewer';

const SatelliteImagesPage = () => {
  const { id } = useParams();
  const [region, setRegion] = useState(null);
  const [satellites, setSatellites] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedSatellite, setSelectedSatellite] = useState('');
  const [timeRange, setTimeRange] = useState('365'); // Default to 1 year
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch region data
        if (id) {
          const regionData = await getRegionById(id);
          setRegion(regionData);
        }
        
        // Fetch available satellites
        const satellitesData = await getSatellites();
        setSatellites(satellitesData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Erreur lors du chargement des données initiales');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  useEffect(() => {
    const fetchImages = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const params = {
          region: id,
          days: timeRange
        };
        
        if (selectedSatellite) {
          params.satellite = selectedSatellite;
        }
        
        const imagesData = await getSatelliteImages(params);
        setImages(imagesData);
        
        // Select the first image by default if available
        if (imagesData.length > 0 && !selectedImageId) {
          setSelectedImageId(imagesData[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching satellite images:', err);
        setError('Erreur lors du chargement des images satellites');
        setLoading(false);
      }
    };

    fetchImages();
  }, [id, selectedSatellite, timeRange]);

  const handleImageSelect = (imageId) => {
    setSelectedImageId(imageId);
  };

  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Accueil</Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/regions' }}>Régions</Breadcrumb.Item>
            {region && (
              <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/regions/${id}` }}>
                {region.name}
              </Breadcrumb.Item>
            )}
            <Breadcrumb.Item active>Images Satellites</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Images Satellites et Indices Environnementaux</h4>
            </Card.Header>
            <Card.Body>
              <p>
                Cette page vous permet de visualiser les images satellites disponibles pour la région sélectionnée
                et d'analyser les différents indices environnementaux calculés à partir de ces images.
              </p>
              
              <Row className="mb-4">
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Satellite</Form.Label>
                    <Form.Select 
                      value={selectedSatellite}
                      onChange={(e) => setSelectedSatellite(e.target.value)}
                    >
                      <option value="">Tous les satellites</option>
                      {satellites.map(satellite => (
                        <option key={satellite.id} value={satellite.id}>
                          {satellite.name} ({satellite.resolution}m)
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Période</Form.Label>
                    <Form.Select 
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                    >
                      <option value="30">30 jours</option>
                      <option value="90">3 mois</option>
                      <option value="180">6 mois</option>
                      <option value="365">1 an</option>
                      <option value="730">2 ans</option>
                      <option value="1095">3 ans</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button 
                    variant="primary" 
                    className="w-100"
                    onClick={() => {
                      // Reset selected image when applying new filters
                      setSelectedImageId(null);
                    }}
                  >
                    Appliquer les filtres
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p className="mt-2">Chargement des données...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header>
                  <h5>Images Satellites Disponibles</h5>
                </Card.Header>
                <Card.Body>
                  {images.length > 0 ? (
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Date d'acquisition</th>
                          <th>Satellite</th>
                          <th>Couverture nuageuse</th>
                          <th>Indices disponibles</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {images.map(image => (
                          <tr 
                            key={image.id} 
                            className={selectedImageId === image.id ? 'table-primary' : ''}
                          >
                            <td>{new Date(image.acquisition_date).toLocaleDateString()}</td>
                            <td>{image.satellite_name}</td>
                            <td>{image.cloud_cover}%</td>
                            <td>
                              {image.indices && image.indices.length > 0 ? (
                                <div className="d-flex flex-wrap gap-1">
                                  {image.indices.map(index => (
                                    <span 
                                      key={index.id} 
                                      className="badge bg-success me-1"
                                    >
                                      {index.index_type}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted">Aucun indice disponible</span>
                              )}
                            </td>
                            <td>
                              <Button 
                                size="sm" 
                                variant={selectedImageId === image.id ? "primary" : "outline-primary"}
                                onClick={() => handleImageSelect(image.id)}
                              >
                                {selectedImageId === image.id ? "Sélectionnée" : "Sélectionner"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Alert variant="info">
                      Aucune image satellite disponible pour les critères sélectionnés.
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {selectedImageId && (
            <Row className="mb-4">
              <Col>
                <SatelliteImageViewer imageId={selectedImageId} />
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default SatelliteImagesPage;