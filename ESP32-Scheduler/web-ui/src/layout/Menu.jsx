import { Link } from "react-router";

const Menu = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark" data-testid="navbar">
            <div className="container-fluid">
                <span className="navbar-brand">Water Timer</span>
                
                <button className="navbar-toggler" type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav" 
                    aria-controls="navbarNav" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link to="/dashboard" className="nav-link" data-testid="menu-dashboard">
                                Dashboard
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/pin-config" className="nav-link" data-testid="menu-pin-config">
                                IO Schedule Configuration
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/power-config" className="nav-link" data-testid="menu-power-config">
                                Power Configuration
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/wlan-config" className="nav-link" data-testid="menu-connect-to-wifi">
                                Connect to Wifi
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin" className="nav-link" data-testid="menu-admin">
                                Admin
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Menu;