import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Breadcrumb, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import UserZoneEditor from '../components/UserZoneEditor';
import IndexTrendChart from '../components/IndexTrendChart';

const UserZonesPage = () => {
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Accueil</Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/profile' }}>Mon compte</Breadcrumb.Item>
            <Breadcrumb.Item active>Mes zones d'analyse</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-info text-white">
              <h4 className="mb-0">Mes zones d'analyse personnalisées</h4>
            </Card.Header>
            <Card.Body>
              <p>
                Cette page vous permet de créer et gérer vos propres zones d'analyse pour suivre l'évolution
                des indices environnementaux (NDVI, NDWI, NDMI, etc.) dans des zones spécifiques qui vous intéressent.
              </p>
              <Alert variant="info">
                <strong>Comment ça marche :</strong>
                <ol className="mb-0">
                  <li>Créez une nouvelle zone en dessinant un polygone sur la carte</li>
                  <li>Donnez un nom et une description à votre zone</li>
                  <li>Le système analysera automatiquement cette zone avec les images satellites disponibles</li>
                  <li>Consultez l'évolution des indices environnementaux dans votre zone au fil du temps</li>
                </ol>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <UserZoneEditor />
        </Col>
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Informations</h5>
            </Card.Header>
            <Card.Body>
              <h6>Indices disponibles pour l'analyse</h6>
              <ul>
                <li><strong>NDVI</strong> - Indice de végétation qui mesure la densité et la santé de la végétation</li>
                <li><strong>NDWI</strong> - Indice d'eau qui détecte la présence d'eau et l'humidité</li>
                <li><strong>NDMI</strong> - Indice d'humidité qui mesure le contenu en eau de la végétation</li>
                <li><strong>NDBI</strong> - Indice de bâti qui identifie les zones urbaines et construites</li>
                <li><strong>BSI</strong> - Indice de sol nu qui détecte les zones sans végétation</li>
              </ul>
              
              <h6>Analyse de la déforestation</h6>
              <p>
                Pour analyser la déforestation dans une zone spécifique, créez une zone d'intérêt et suivez l'évolution
                de l'indice NDVI au fil du temps. Une diminution significative de l'indice NDVI peut indiquer une perte
                de couverture forestière ou une dégradation de la végétation.
              </p>
              
              <h6>Fréquence des mises à jour</h6>
              <p>
                Les analyses sont mises à jour automatiquement lorsque de nouvelles images satellites sont disponibles
                et traitées par le système, généralement tous les 5 à 16 jours selon les satellites utilisés.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserZonesPage;