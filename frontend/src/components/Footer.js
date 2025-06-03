import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-light py-3 mt-4">
      <Container className="text-center">
        <p className="text-muted mb-0">
           Entre mer, désert et médina — la Tunisie vue d'en haut, pensée en profondeur
        </p>
      </Container>
    </footer>
  );
};

export default Footer;