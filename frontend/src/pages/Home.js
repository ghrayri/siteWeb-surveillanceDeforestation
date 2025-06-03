import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Home = () => {
  return (
    <Container>
      <div className="banner-sentinel">
        <h1 className="display-4" style={{fontWeight:700, letterSpacing:'1px'}}>Bienvenue sur GeoX</h1>
        <p className="lead" style={{fontSize:'1.3rem', maxWidth:'700px', margin:'0 auto'}}>
          Plateforme moderne pour explorer les données géospatiales de la Tunisie.
        </p>
        <Button as={Link} to="/regions" className="btn-sentinel mt-3" size="lg">
          Explorer les régions
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-primary text-white">Régions</Card.Header>
            <Card.Body>
              <Card.Text>
                Explorez les différentes régions de la Tunisie avec leurs caractéristiques géographiques et démographiques.
              </Card.Text>
              <Button as={Link} to="/regions" variant="outline-primary" className="btn-sentinel">
                Voir les régions
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-secondary text-white">Données EO</Card.Header>
            <Card.Body>
              <Card.Text>
                Accédez aux données d'observation de la Terre pour analyse et visualisation.
              </Card.Text>
              <Button as={Link} to="/eodata" variant="outline-secondary" className="btn-sentinel">
                Voir les données EO
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-success text-white">Points d'intérêt</Card.Header>
            <Card.Body>
              <Card.Text>
                Découvrez les points d'intérêt géolocalisés à travers le pays, avec descriptions et images.
              </Card.Text>
              <Button as={Link} to="/points" variant="outline-success" className="btn-sentinel">
                Voir les points d'intérêt
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-info text-white">Couches de données</Card.Header>
            <Card.Body>
              <Card.Text>
                Accédez à des couches de données géospatiales pour analyse et visualisation avancées.
              </Card.Text>
              <Button as={Link} to="/layers" variant="outline-info" className="btn-sentinel">
                Voir les couches de données
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-warning text-white">IoT</Card.Header>
            <Card.Body>
              <Card.Text>
                Visualisez et analysez les données des capteurs IoT déployés à travers la Tunisie.
              </Card.Text>
              <Button as={Link} to="/iot" variant="outline-warning" className="btn-sentinel">
                Voir les données IoT
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-danger text-white">Temps réel</Card.Header>
            <Card.Body>
              <Card.Text>
                Accédez aux données géospatiales en temps réel et aux alertes environnementales.
              </Card.Text>
              <Button as={Link} to="/realtime" variant="outline-danger" className="btn-sentinel">
                Voir les données temps réel
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="data-sections mt-5">
        <h2 style={{fontWeight:600, fontSize:'1.5rem', marginBottom:'1.5rem'}}>Visualisation des données</h2>
        
        <Row className="mb-4">
          <Col md={4} className="mb-3">
            <Card className="h-100 shadow-sm">
              <Card.Header className="bg-primary text-white">Données EO</Card.Header>
              <Card.Body>
                <div style={{height:'200px'}}>
                  <MapContainer center={[34.0, 9.0]} zoom={7} style={{height:'100%', width:'100%'}}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                  </MapContainer>
                </div>
                <Button as={Link} to="/eodata" variant="outline-primary" className="btn-sentinel mt-3">
                  Explorer les données EO
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-3">
            <Card className="h-100 shadow-sm">
              <Card.Header className="bg-success text-white">Données IoT</Card.Header>
              <Card.Body>
                <div style={{height:'200px'}}>
                  <MapContainer center={[34.0, 9.0]} zoom={7} style={{height:'100%', width:'100%'}}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                  </MapContainer>
                </div>
                <Button as={Link} to="/iot" variant="outline-success" className="btn-sentinel mt-3">
                  Explorer les données IoT
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-3">
            <Card className="h-100 shadow-sm">
              <Card.Header className="bg-danger text-white">Données temps réel</Card.Header>
              <Card.Body>
                <div style={{height:'200px'}}>
                  <MapContainer center={[34.0, 9.0]} zoom={7} style={{height:'100%', width:'100%'}}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                  </MapContainer>
                </div>
                <Button as={Link} to="/realtime" variant="outline-danger" className="btn-sentinel mt-3">
                  Explorer les données temps réel
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
      
      <div className="section-info">
        <h2 style={{fontWeight:600, fontSize:'1.5rem'}}>À propos de notre plateforme</h2>
        <p style={{marginBottom:0}}>
          Notre plateforme offre la visualisation et l'analyse des données géospatiales adaptée à la Tunisie.
        </p>
      </div>
    </Container>
  );
};

export default Home;