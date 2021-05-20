import './WlanConfig.css'

import { useState } from 'react';
import { Col, Container, Spinner, Alert, Button, Form, Card } from 'react-bootstrap';

import ApiService from '../../services/ApiService';

const WlanConfig = () => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [wlanConfig, setWlanConfig] = useState({ ssid: '', password: '' });
    const [validationError, setValidationError] = useState('');

    const onFieldChange = (fieldName, value) => {
        let newState = { ...wlanConfig };
        newState[fieldName] = value;
        setWlanConfig(newState);
    };

    const onSave = () => {
        var err = [];

        if (!wlanConfig.ssid) {
            err.push(`Network name is required.`);
        }
        if (!wlanConfig.password) {
            err.push(`Password is required.`);
        }
        setValidationError(err);
        if (err.length > 0) {
            return;
        }

        setLoading(true);
        ApiService.setWlanConfig(wlanConfig).then(() => {
            setError(false);
        }).catch(() => {
            setLoading(false);
            setError(true);
        });
    };

    return (
        <Container className="wlan-config">
            { loading ?
                <div>
                    <Spinner animation="border" className="loader" data-testid="wlan-config-loading-state">
                        <span className="sr-only">Loading...</span>
                    </Spinner >
                    <Alert variant="warning" className="alert-msg">
                        Once this configuration is changed and saved, this device may not be assesible via the same URL. Please long press the left hand button of the device to find the new url.
                    </Alert>
                </div>
                : null
            }
            { error ?
                <Alert variant="danger" data-testid="wlan-config-error-state">
                    Connectivity error. Please reload.
                </Alert>
                : null
            }
            { !loading ?
                <div>
                    <Card>
                        <Card.Body>
                            <Form.Row>
                                <h3>WiFi Configuration</h3>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} xs={12} md={6}>
                                    <Form.Label>Network Name</Form.Label>
                                    <Form.Control type="input"
                                        value={wlanConfig.ssid}
                                        data-testid="wlan-ssid"
                                        onChange={(e) => onFieldChange('ssid', e.target.value)} />
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} xs={12} md={6}>
                                    <Form.Label>Network Password</Form.Label>
                                    <Form.Control type="password"
                                        value={wlanConfig.password}
                                        data-testid="wlan-password"
                                        onChange={(e) => onFieldChange('password', e.target.value)} />
                                </Form.Group>
                            </Form.Row>
                        </Card.Body>
                    </Card>
                    <Alert variant="warning" className="alert-msg">
                        Once this configuration is changed and saved, this device may not be assesible via the same URL. Please long press the left hand button of the device to find the new url.
                    </Alert>
                    {validationError ?
                        <Alert variant="danger" className="alert-msg" data-testid="wlan-config-validation-error">
                            {validationError.map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </Alert>
                        : null
                    }
                    <Button variant="primary"
                        className="save-button float-right"
                        data-testid="save-button"
                        onClick={() => onSave()}>
                        Save
                    </Button>
                </div>
                : null
            }
        </Container>
    );
}

export default WlanConfig;