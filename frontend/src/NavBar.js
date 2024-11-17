import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { FaBars, FaRocket } from 'react-icons/fa';

const NavBar = ({ toggleSidePanel, sidePanelVisible }) => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="navbar">
      <Nav className="mr-auto">
        {!sidePanelVisible && (
          <FaBars className="mr-3 hamburger-icon" onClick={toggleSidePanel} />
        )}
      </Nav>
      <Navbar.Brand className="mx-auto text-center font-weight-bold" style={{ fontSize: '1.5rem' }}>
        Permission Sets Compare: Utility
      </Navbar.Brand>
      <Nav className="ml-auto">
        <FaRocket className="animated-icon" />
      </Nav>
    </Navbar>
  );
};

export default NavBar;