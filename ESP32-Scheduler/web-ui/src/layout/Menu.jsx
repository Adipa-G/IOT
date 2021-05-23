import { Link } from "react-router-dom";

import { Nav, Navbar } from "react-bootstrap";

const Menu = () => {
    return (
        <div>
            <Navbar collapseOnSelect bg="dark" variant="dark" expand="lg"
                data-testid="navbar">
                <Navbar.Brand>Water Timer</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link eventKey="1" as={Link} to="/dashboard" data-testid="menu-dashboard">
                            Dashboard
                        </Nav.Link>
                        <Nav.Link eventKey="2" as={Link} to="/pin-config" data-testid="menu-pin-config">
                            IO Schedule Configuration
                        </Nav.Link>
                        <Nav.Link eventKey="3" as={Link} to="/power-config" data-testid="menu-power-config">
                            Power Configuration
                        </Nav.Link>
                        <Nav.Link eventKey="4" as={Link} to="/wlan-config" data-testid="menu-connect-to-wifi">
                            Connect to Wifi
                        </Nav.Link>
                        <Nav.Link eventKey="5" as={Link} to="/admin" data-testid="menu-admin">
                            Admin
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </div>
    );
}

export default Menu;