import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/auth';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          // Unauthorized, redirect to login
          navigate('/login');
        } else {
          setError('Erreur lors du chargement du profil');
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <div className="text-center my-5">Chargement...</div>;
  if (error) return <div className="alert alert-danger my-5">{error}</div>;
  if (!profile) return <div className="alert alert-warning my-5">Profil non trouvé</div>;

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Mon profil</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="text-center mb-4">
                  <div className="bg-light p-3 rounded-circle mx-auto mb-3" style={{ width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="display-4 text-secondary">{profile.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <h5>{profile.username}</h5>
                </Col>
                <Col md={8}>
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Prénom</Form.Label>
                          <Form.Control
                            type="text"
                            value={profile.first_name || ''}
                            readOnly
                            plaintext
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nom</Form.Label>
                          <Form.Control
                            type="text"
                            value={profile.last_name || ''}
                            readOnly
                            plaintext
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={profile.email || ''}
                        readOnly
                        plaintext
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Nom d'utilisateur</Form.Label>
                      <Form.Control
                        type="text"
                        value={profile.username}
                        readOnly
                        plaintext
                      />
                    </Form.Group>
                  </Form>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="justify-content-center mt-4">
        <Col md={8}>
          <Card>
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Activité</h5>
            </Card.Header>
            <Card.Body>
              <p>Fonctionnalité à venir : historique des contributions et des activités.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;