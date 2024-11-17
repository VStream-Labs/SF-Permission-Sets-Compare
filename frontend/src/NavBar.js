import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';

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
        {/* Add other Nav items here if needed */}
      </Nav>
    </Navbar>
  );
};

export default NavBar;