import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Card, Alert, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';

const Activate = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const activateAccount = async () => {
      const uid = searchParams.get('uid');
      const token = searchParams.get('token');

      if (!uid || !token) {
        setStatus('error');
        setMessage('Lien d\'activation invalide. Veuillez vérifier votre email et réessayer.');
        return;
      }

      try {
        // Call the backend activation endpoint
        const response = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/activate/`, {
          params: { uid, token }
        });

        setStatus('success');
        setMessage(response.data.message || 'Votre compte a été activé avec succès!');
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
          'Une erreur s\'est produite lors de l\'activation de votre compte. Veuillez réessayer.'
        );
      }
    };

    activateAccount();
  }, [searchParams]);

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Activation de compte</h4>
            </Card.Header>
            <Card.Body className="text-center">
              {status === 'loading' && (
                <div className="py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Activation de votre compte en cours...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="py-4">
                  <div className="mb-4">
                    <i className="bi bi-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <Alert variant="success">{message}</Alert>
                  <p>Vous pouvez maintenant vous connecter à votre compte.</p>
                  <Button as={Link} to="/login" variant="primary" className="mt-3">
                    Se connecter
                  </Button>
                </div>
              )}

              {status === 'error' && (
                <div className="py-4">
                  <div className="mb-4">
                    <i className="bi bi-x-circle text-danger" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <Alert variant="danger">{message}</Alert>
                  <p>Si vous continuez à rencontrer des problèmes, veuillez contacter notre support.</p>
                  <Button as={Link} to="/register" variant="outline-primary" className="mt-3">
                    Retour à l'inscription
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Activate;