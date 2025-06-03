import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Breadcrumb, Table, Badge } from 'react-bootstrap';
import { getDataLayers } from '../services/api';

const DataLayerList = () => {
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLayers = async () => {
      try {
        const data = await getDataLayers();
        setLayers(data.features || []);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des couches de données');
        setLoading(false);
      }
    };

    fetchLayers();
  }, []);

  if (loading) return <div className="text-center my-5">Chargement...</div>;
  if (error) return <div className="alert alert-danger my-5">{error}</div>;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Accueil</Breadcrumb.Item>
            <Breadcrumb.Item active>Couches de données</Breadcrumb.Item>
          </Breadcrumb>
          <h2>Couches de données</h2>
          <p className="lead">Explorez les couches de données géospatiales disponibles</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Couches disponibles</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Catégorie</th>
                    <th>Date de création</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {layers.map(layer => (
                    <tr key={layer.id}>
                      <td>{layer.properties.name}</td>
                      <td>
                        <Badge bg="info">{layer.properties.category || 'Non catégorisé'}</Badge>
                      </td>
                      <td>{new Date(layer.properties.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <Link to={`/layers/${layer.id}`} className="btn btn-outline-info btn-sm">
                          Détails
                        </Link>
                      </td>
                    </tr>
                  ))}
                  
                  {layers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center">Aucune couche de données disponible</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">À propos des couches de données</h5>
            </Card.Header>
            <Card.Body>
              <p>
                Les couches de données géospatiales permettent de visualiser et d'analyser 
                différents types d'informations géographiques sur la Tunisie.
              </p>
              <p>
                Chaque couche peut être superposée sur une carte pour créer des visualisations 
                personnalisées et des analyses spatiales.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Utilisation</h5>
            </Card.Header>
            <Card.Body>
              <p>
                Cliquez sur "Détails" pour voir les informations complètes d'une couche et 
                la visualiser sur une carte interactive.
              </p>
              <p>
                Les couches peuvent être téléchargées dans différents formats pour une 
                utilisation dans des logiciels SIG comme QGIS ou ArcGIS.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DataLayerList;