import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.password2) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      // Create a simple user object without the password confirmation
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name || '',
        last_name: formData.last_name || ''
      };
      
      console.log('Sending registration data:', userData);
      
      // Make a direct API call to Django
      const response = await axios.post('http://127.0.0.1:8000/api/register/', userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Registration successful:', response.data);
      setSuccess(true);
      setMessage(response.data.message || 'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.');
      
      // Don't redirect immediately, let the user see the success message
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response?.data) {
        // Try to extract error message
        let errorMessage = '';
        
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (typeof err.response.data === 'object') {
          // Handle object with error fields
          errorMessage = Object.entries(err.response.data)
            .map(([key, value]) => {
              const errorText = Array.isArray(value) ? value.join(' ') : String(value);
              return `${key}: ${errorText}`;
            })
            .join('. ');
        }
        
        setError(errorMessage || 'Erreur lors de l\'inscription');
      } else {
        setError('Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Inscription</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && (
                <Alert variant="success">
                  {message}
                </Alert>
              )}
              
              {!success && (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nom d'utilisateur</Form.Label>
                        <Form.Control
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Prénom</Form.Label>
                        <Form.Control
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nom</Form.Label>
                        <Form.Control
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Mot de passe</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirmer le mot de passe</Form.Label>
                        <Form.Control
                          type="password"
                          name="password2"
                          value={formData.password2}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                    </Button>
                  </div>
                </Form>
              )}
              
              {success && (
                <div className="text-center mt-3">
                  <Button variant="outline-primary" onClick={() => navigate('/login')}>
                    Aller à la page de connexion
                  </Button>
                </div>
              )}
            </Card.Body>
            <Card.Footer className="text-center">
              <p className="mb-0">
                Déjà inscrit ? <Link to="/login">Se connecter</Link>
              </p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;