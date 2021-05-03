import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Nav, Navbar } from "react-bootstrap";

import ApiService from './../services/ApiService';

const Menu = () => {
    const [health, setHealth] = useState({});

    useEffect(() => {
        ApiService.getHealth().then((result) => {
            setHealth(result);
        });
    }, []);

    return (
        <div>
            <Navbar collapseOnSelect bg="dark" variant="dark" expand="lg"
                data-testid="navbar">
                <Navbar.Brand>Water Timer</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link eventKey="1" as={Link} to="/timer-status">
                            Status
                        </Nav.Link>
                        {
                            health.wlanConfigMode ?
                                <Nav.Link eventKey="2" as={Link} to="/connect-to-wifi" data-testid="menu-connect-to-wifi">
                                    Connect to Wifi
                                </Nav.Link>
                                : null
                        }
                        <Nav.Link eventKey="100" as={Link} to="/game-select" data-testid="menu-game-select">
                            Select Game
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </div>
    );
}

export default Menu;