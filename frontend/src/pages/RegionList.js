import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Table, Breadcrumb } from "react-bootstrap";
import { getRegions } from "../services/api";

const RegionList = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const data = await getRegions();
        console.log("Fetched regions data:", data);
        let regionsArray = [];
        if (Array.isArray(data)) {
          regionsArray = data;
        } else if (data && Array.isArray(data.results)) {
          regionsArray = data.results;
        } else if (data && Array.isArray(data.data)) {
          regionsArray = data.data;
        } else {
          console.warn("Unexpected regions data format:", data);
        }
        setRegions(regionsArray);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des régions");
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  if (loading) return <div className="text-center my-5">Chargement...</div>;
  if (error) return <div className="alert alert-danger my-5">{error}</div>;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
              Accueil
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Régions</Breadcrumb.Item>
          </Breadcrumb>
          <h2>Régions</h2>
          <p className="lead">Explorez les différentes régions de la Tunisie</p>
        </Col>
      </Row>

      <Row>
        {regions.map((region) => (
          <Col md={6} lg={4} className="mb-4" key={region.id}>
            <Card className="h-100">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">{region.name}</h5>
              </Card.Header>
              <Card.Body>
                <Table bordered size="sm">
                  <tbody>
                    <tr>
                      <th>Code</th>
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
                  </tbody>
                </Table>
                {region.description && (
                  <p className="mt-3 mb-0">
                    {region.description.substring(0, 100)}...
                  </p>
                )}
              </Card.Body>
              <Card.Footer className="bg-light">
                <Link
                  to={`/regions/${region.id}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  Voir les détails
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        ))}

        {regions.length === 0 && (
          <Col>
            <div className="alert alert-info text-center my-5">
              Aucune région disponible.
            </div>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default RegionList;
