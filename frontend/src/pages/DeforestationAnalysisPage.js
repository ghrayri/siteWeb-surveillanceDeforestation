import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Breadcrumb } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { getRegionById } from '../services/api';
import DeforestationAnalysis from '../components/DeforestationAnalysis';
import IndexTrendChart from '../components/IndexTrendChart';
import SatelliteImageViewer from '../components/SatelliteImageViewer';

const DeforestationAnalysisPage = () => {
  const { id } = useParams();
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);

  useEffect(() => {
    const fetchRegion = async () => {
      try {
        setLoading(true);
        const data = await getRegionById(id);
        setRegion(data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données de la région');
        setLoading(false);
      }
    };

    if (id) {
      fetchRegion();
    }
  }, [id]);

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
            <Breadcrumb.Item active>Analyse de déforestation</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-success text-white">
              <h4 className="mb-0">Analyse de déforestation et indices environnementaux</h4>
            </Card.Header>
            <Card.Body>
              <p>
                Cette page vous permet d'analyser les changements environnementaux dans la région sélectionnée
                en utilisant différents indices de télédétection. Ces indices sont calculés à partir d'images
                satellites et permettent de quantifier les changements dans la végétation, l'eau, l'humidité
                et d'autres caractéristiques environnementales.
              </p>
              <Row>
                <Col md={6}>
                  <h5>Indices disponibles :</h5>
                  <ul>
                    <li><strong>NDVI</strong> (Normalized Difference Vegetation Index) - Mesure la densité de végétation</li>
                    <li><strong>NDWI</strong> (Normalized Difference Water Index) - Détecte la présence d'eau et l'humidité</li>
                    <li><strong>NDMI</strong> (Normalized Difference Moisture Index) - Mesure l'humidité de la végétation</li>
                    <li><strong>NDBI</strong> (Normalized Difference Built-up Index) - Identifie les zones bâties</li>
                    <li><strong>BSI</strong> (Bare Soil Index) - Détecte les sols nus</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h5>Comment interpréter les résultats :</h5>
                  <ul>
                    <li>Une <strong>diminution du NDVI</strong> peut indiquer une déforestation ou une dégradation de la végétation</li>
                    <li>Une <strong>diminution du NDWI</strong> peut indiquer un assèchement des plans d'eau</li>
                    <li>Une <strong>diminution du NDMI</strong> peut indiquer un stress hydrique de la végétation</li>
                    <li>Une <strong>augmentation du NDBI</strong> peut indiquer une expansion urbaine</li>
                    <li>Une <strong>augmentation du BSI</strong> peut indiquer une désertification ou une érosion des sols</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {id && (
        <>
          <Row className="mb-4">
            <Col>
              <DeforestationAnalysis regionId={id} />
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <IndexTrendChart regionId={id} />
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

export default DeforestationAnalysisPage;