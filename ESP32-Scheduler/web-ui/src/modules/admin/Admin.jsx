import './Admin.css'
import { useState, useEffect, useRef } from 'react';
import ApiService from '../../services/ApiService';

const Admin = () => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!timerRef.current) {
            timerRef.current = setInterval(() => {
                ApiService.getHealth().then(() => {
                    setLoading(false);
                    setError(false);
                    if (!timerRef.current) {
                        clearTimeout(timerRef.current);
                    }
                });
            }, 10000);
        }

        if (!timerRef.current) {
            clearTimeout(timerRef.current);
        }
    }, []);

    const onReboot = () => {
        setLoading(true);
        ApiService.reboot();
    };

    return (
        <div className="container">
            {loading && (
                <div className="spinner-border loader" role="status" data-testid="admin-loading-state">
                    <span className="visually-hidden">Rebooting. Please wait....</span>
                </div>
            )}
            
            {error && (
                <div className="alert alert-danger widget" role="alert" data-testid="admin-error-state">
                    Connectivity error. Please reload.
                </div>
            )}
            
            {!loading && (
                <div>
                    <div className="row">
                        <div className="col-6 col-md-4 col-lg-3 widget">
                            <button 
                                className="btn btn-primary"
                                data-testid="reboot-button"
                                onClick={() => onReboot()}>
                                Reboot
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;