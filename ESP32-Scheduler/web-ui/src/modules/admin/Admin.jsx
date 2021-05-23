import './Admin.css'

import { useState, useEffect, useRef } from 'react';
import { Col, Container, Row, Spinner, Alert, Button } from 'react-bootstrap';

import ApiService from '../../services/ApiService';

const Admin = () => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        let unmounted = false;
        if (!timerRef.current) {
            timerRef.current = setInterval(() => {
                ApiService.getHealth().then(() => {
                    if (!unmounted) {
                        setLoading(false);
                        setError(false);
                        if (!timerRef.current) {
                            clearTimeout(timerRef.current);
                        }
                    }
                });
            }, 10000);
        }

        if (unmounted) {
            if (!timerRef.current) {
                clearTimeout(timerRef.current);
            }
        }

        return () => {
            unmounted = true
        }
    }, []);

    const onReboot = () => {
        setLoading(true);
        ApiService.reboot();
    };

    return (
        <Container>
            { loading ?
                <Spinner animation="border" className="loader" data-testid="admin-loading-state">
                    <span className="sr-only">Rebooting. Please wait....</span>
                </Spinner >
                : null
            }
            { error ?
                <Alert variant="danger" className="widget" data-testid="admin-error-state">
                    Connectivity error. Please reload.
                </Alert>
                : null
            }
            { !loading ?
                <div>
                    <Row>
                        <Col xs={6} md={4} lg={3} key={1} className="widget">
                            <Button variant="primary"
                                data-testid="reboot-button"
                                onClick={() => onReboot()}>
                                Reboot
                            </Button>
                        </Col>
                    </Row>
                </div> :
                null
            }
        </Container>
    );
}

export default Admin;