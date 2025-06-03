import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { getToken, removeToken } from '../services/auth';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">GeoX</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="navbar-nav" />
        <BootstrapNavbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Accueil</Nav.Link>
            <NavDropdown title="Régions" id="regions-dropdown">
              <NavDropdown.Item as={Link} to="/regions">Liste des régions</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Header>Analyses</NavDropdown.Header>
              <NavDropdown.Item as={Link} to="/regions">Sélectionner une région pour analyse</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Analyses" id="analyses-dropdown">
              <NavDropdown.Item as={Link} to="/user-zones">Mes zones d'analyse</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Header>Indices environnementaux</NavDropdown.Header>
              <NavDropdown.Item>NDVI - Végétation</NavDropdown.Item>
              <NavDropdown.Item>NDWI - Eau</NavDropdown.Item>
              <NavDropdown.Item>NDMI - Humidité</NavDropdown.Item>
              <NavDropdown.Item>NDBI - Zones bâties</NavDropdown.Item>
              <NavDropdown.Item>BSI - Sols nus</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/points">Points d'intérêt</Nav.Link>
            <Nav.Link as={Link} to="/layers">Couches de données</Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <NavDropdown title="Mon compte" id="account-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">Profil</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/user-zones">Mes zones d'analyse</NavDropdown.Item>
                </NavDropdown>
                <Button 
                  variant="link" 
                  className="nav-link border-0 bg-transparent" 
                  onClick={handleLogout}
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Connexion</Nav.Link>
                <Nav.Link as={Link} to="/register">Inscription</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;