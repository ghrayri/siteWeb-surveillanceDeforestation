import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Breadcrumb,
  ListGroup,
  Badge,
  Button,
} from "react-bootstrap";
import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import { getRegionById } from "../services/api";
import "leaflet/dist/leaflet.css";

const RegionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegion = async () => {
      try {
        const data = await getRegionById(id);
        console.log("Fetched region data:", data);
        setRegion(data);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        setLoading(false);
      }
    };

    fetchRegion();
  }, [id]);

  if (loading) return <div className="text-center my-5">Chargement...</div>;
  if (error) return <div className="alert alert-danger my-5">{error}</div>;
  if (!region)
    return <div className="alert alert-warning my-5">Région non trouvée</div>;

  // Calculate center of region for map
  const getBoundsCenter = (geometry) => {
    if (!geometry || !geometry.coordinates) return [34.0, 9.0]; // Default to Tunisia center

    try {
      // Simple calculation for polygon centroid (approximate)
      const coords = geometry.coordinates[0];
      if (!Array.isArray(coords) || coords.length === 0) return [34.0, 9.0];
      let lat = 0,
        lng = 0;
      coords.forEach((coord) => {
        if (!Array.isArray(coord) || coord.length < 2)
          throw new Error("Invalid coordinate");
        lat += coord[1];
        lng += coord[0];
      });
      return [lat / coords.length, lng / coords.length];
    } catch (e) {
      return [34.0, 9.0]; // Default to Tunisia center
    }
  };

  // Navigate to deforestation analysis page
  const goToDeforestationAnalysis = () => {
    navigate(`/regions/${id}/deforestation`);
  };

  // Navigate to satellite images page
  const goToSatelliteImages = () => {
    navigate(`/regions/${id}/satellite-images`);
  };

  const center = getBoundsCenter(region.geometry);

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
              Accueil
            </Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/regions" }}>
              Régions
            </Breadcrumb.Item>
            <Breadcrumb.Item active>{region.name}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={5}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">{region.name}</h5>
            </Card.Header>
            <Card.Body>
              <Table bordered>
                <tbody>
                  <tr>
                    <th style={{ width: "30%" }}>Code</th>
                    <td>{region.code || "-"}</td>
                  </tr>
                  <tr>
                    <th>Population</th>
                    <td>{region.population?.toLocaleString() || "-"}</td>
                  </tr>
                  <tr>
                    <th>Superficie</th>
                    <td>{region.area ? `${region.area} km²` : "-"}</td>
                  </tr>
                  <tr>
                    <th>Date de création</th>
                    <td>
                      {new Date(region.created_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                </tbody>
              </Table>

              {region.description && (
                <div className="mt-3">
                  <h6>Description</h6>
                  <p>{region.description}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={7}>
          <Card>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Carte</h5>
            </Card.Header>
            <Card.Body>
              <MapContainer center={center} zoom={8} className="map-container">
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
                      attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>

                {region.geometry && (
                  <GeoJSON
                    data={region.geometry}
                    style={{
                      color: "#0d6efd",
                      weight: 2,
                      opacity: 0.8,
                      fillColor: "#0d6efd",
                      fillOpacity: 0.2,
                    }}
                  />
                )}
              </MapContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Points d'intérêt dans cette région</h5>
            </Card.Header>
            <Card.Body>
              {region.points && region.points.length > 0 ? (
                <ListGroup>
                  {region.points.map((point) => (
                    <ListGroup.Item
                      key={point.id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <Link to={`/points/${point.id}`}>{point.name}</Link>
                      </div>
                      <Badge bg="primary" pill>
                        {point.category}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p>Aucun point d'intérêt dans cette région</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Analyses environnementales</h5>
            </Card.Header>
            <Card.Body>
              <p>
                Explorez les données environnementales de cette région à travers
                nos outils d'analyse spécialisés. Visualisez les tendances de
                déforestation et consultez les images satellite pour mieux
                comprendre les changements environnementaux au fil du temps.
              </p>
              <Row className="mt-3">
                <Col md={6} className="mb-3 mb-md-0">
                  <Card className="h-100">
                    <Card.Body>
                      <h5>Analyse de déforestation</h5>
                      <p>
                        Visualisez les tendances de déforestation et les
                        changements dans les indices environnementaux (NDVI,
                        NDWI, NDMI, NDBI, BSI) pour cette région au fil du
                        temps.
                      </p>
                      <Button
                        variant="outline-success"
                        className="w-100"
                        onClick={goToDeforestationAnalysis}
                      >
                        Voir l'analyse de déforestation
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <h5>Images satellite</h5>
                      <p>
                        Consultez les images satellite récentes et historiques
                        pour cette région et observez les changements
                        environnementaux visuellement.
                      </p>
                      <Button
                        variant="outline-primary"
                        className="w-100"
                        onClick={goToSatelliteImages}
                      >
                        Voir les images satellite
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegionDetail;
