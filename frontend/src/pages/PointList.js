import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Breadcrumb, Form, Button } from 'react-bootstrap';
import { getPoints } from '../services/api';

const PointList = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Get unique categories from points
  const categories = [...new Set(points.map(point => 
    point.properties.category).filter(Boolean))];

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const data = await getPoints();
        setPoints(data.features || []);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des points d\'intérêt');
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);

  const filteredPoints = points.filter(point => {
    const matchesSearch = point.properties.name.toLowerCase().includes(filter.toLowerCase()) ||
                         (point.properties.description && 
                          point.properties.description.toLowerCase().includes(filter.toLowerCase()));
    
    const matchesCategory = categoryFilter === '' || 
                           point.properties.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="text-center my-5">Chargement...</div>;
  if (error) return <div className="alert alert-danger my-5">{error}</div>;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Accueil</Breadcrumb.Item>
            <Breadcrumb.Item active>Points d'intérêt</Breadcrumb.Item>
          </Breadcrumb>
          <h2>Points d'intérêt</h2>
          <p className="lead">Découvrez les points d'intérêt à travers la Tunisie</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={8}>
          <Form.Control
            type="text"
            placeholder="Rechercher un point d'intérêt..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Row>
        {filteredPoints.map(point => (
          <Col md={6} lg={4} className="mb-4" key={point.id}>
            <Card className="h-100">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">{point.properties.name}</h5>
              </Card.Header>
              {point.properties.image && (
                <div style={{ height: '150px', overflow: 'hidden' }}>
                  <img 
                    src={point.properties.image} 
                    alt={point.properties.name} 
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
              )}
              <Card.Body>
                <div className="mb-2">
                  <span className="badge bg-primary me-2">{point.properties.category || 'Non catégorisé'}</span>
                  <span className="badge bg-secondary">
                    {point.properties.region ? point.properties.region.name : 'Région inconnue'}
                  </span>
                </div>
                {point.properties.description && (
                  <p className="mb-0">{point.properties.description.substring(0, 100)}...</p>
                )}
              </Card.Body>
              <Card.Footer className="bg-light">
                <Link to={`/points/${point.id}`} className="btn btn-outline-success btn-sm">
                  Voir les détails
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        ))}
        
        {filteredPoints.length === 0 && (
          <Col>
            <div className="alert alert-info">Aucun point d'intérêt trouvé</div>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default PointList;