import './PowerConfig.css'

import { useState, useEffect } from 'react';
import { Col, Container, Spinner, Alert, Button, Form, Card } from 'react-bootstrap';

import TimeRangeSelector from '../../components/TimeRangeSelector'

import ApiService from '../../services/ApiService';

const PowerConfig = () => {
    const [error, setError] = useState(false);
    const [powerConfig, setPowerConfig] = useState({
        "mediumBattery.cpuFreqMHz": '',
        "lowBattery.minVoltage": '',
        "extraLowBattery.continousDeepSleepHours": '',
        "screenOnSeconds": '',
        "mediumBattery.deepSleepDurationUtc": '',
        "mediumBattery.minVoltage": '',
        "highBattery.minVoltage": '',
        "lowBattery.cpuFreqMHz": '',
        "lowBattery.deepSleepDurationUtc": '',
        "highBattery.cpuFreqMHz": ''
    });
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState('');

    const onFieldChange = (fieldName, value) => {
        let newState = { ...powerConfig };
        newState[fieldName] = value;
        setPowerConfig(newState);
    };

    const onSave = () => {
        var err = [];
        var timeRegex = new RegExp(/^(?:2[0-3]|[01][0-9]):[0-5][0-9]-(?:2[0-3]|[01][0-9]):[0-5][0-9]$/)
        var isNonNumber = (value) => !value || isNaN(value);

        debugger;
        if (isNonNumber(powerConfig['screenOnSeconds'])) {
            err.push(`General: incorrect screen on time.`);
        }
        if (isNonNumber(powerConfig['highBattery.minVoltage'])) {
            err.push(`High power: incorrect min voltage.`);
        }
        if (isNonNumber(powerConfig['mediumBattery.minVoltage'])) {
            err.push(`Medium power: incorrect min voltage.`);
        }
        if (!isNonNumber(powerConfig['highBattery.minVoltage'])
            && !isNonNumber(powerConfig['mediumBattery.minVoltage'])
            && powerConfig['mediumBattery.minVoltage'] >= powerConfig['highBattery.minVoltage']) {
            err.push(`Medium power: min voltage should be less than min voltage of high power.`);
        }
        if (!timeRegex.test(powerConfig['mediumBattery.deepSleepDurationUtc'])) {
            err.push(`Medium power: incorrect sleep duration.`);
        }
        if (isNonNumber(powerConfig['lowBattery.minVoltage'])) {
            err.push(`Low power: incorrect min voltage.`);
        }
        if (!isNonNumber(powerConfig['mediumBattery.minVoltage'])
            && !isNonNumber(powerConfig['lowBattery.minVoltage'])
            && powerConfig['lowBattery.minVoltage'] >= powerConfig['mediumBattery.minVoltage']) {
            err.push(`Low power: min voltage should be less than min voltage of medium power.`);
        }
        if (!timeRegex.test(powerConfig['lowBattery.deepSleepDurationUtc'])) {
            err.push(`Low power: incorrect sleep duration.`);
        }
        if (isNonNumber(powerConfig['extraLowBattery.continousDeepSleepHours'])) {
            err.push(`Extra low power: incorrect sleep duration.`);
        }

        setValidationError(err);
        if (err.length > 0) {
            return;
        }

        setLoading(true);
        ApiService.setPowerConfig(powerConfig).then(() => {
            setLoading(false);
            setError(false);
        }).catch(() => {
            setLoading(false);
            setError(true);
        });
    };

    useEffect(() => {
        let unmounted = false;
        setLoading(true);
        ApiService.getPowerConfig().then((result) => {
            if (!unmounted) {
                setLoading(false);
                setPowerConfig(result);
                setError(false);
            }
        }).catch(() => {
            if (!unmounted) {
                setLoading(false);
                setError(true);
            }
        });

        return () => {
            unmounted = true
        }
    }, []);



    return (
        <Container>
            { loading ?
                <Spinner animation="border" className="loader" data-testid="power-config-loading-state">
                    <span className="sr-only">Loading...</span>
                </Spinner >
                : null
            }
            { error ?
                <Alert variant="danger" className="widget" data-testid="power-config-error-state">
                    Connectivity error. Please reload.
                </Alert>
                : null
            }
            { !loading ?
                <div>
                    <Card>
                        <Card.Body>
                            <Form.Row>
                                <h3>General</h3>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} xs={12} md={6}>
                                    <Form.Label>Screen on time (seconds)</Form.Label>
                                    <Form.Control type="number"
                                        value={powerConfig['screenOnSeconds']}
                                        step="1"
                                        min="0"
                                        data-testid="screen-on-seconds"
                                        onChange={(e) => onFieldChange('screenOnSeconds', e.target.value)} />
                                    <Form.Text muted>
                                        Screen is turned off after {powerConfig['screenOnSeconds']} seconds.
                                    </Form.Text>
                                </Form.Group>
                            </Form.Row>
                        </Card.Body>
                    </Card>
                    <Card className="card-space">
                        <Card.Body>
                            <Form.Row>
                                <h3>High Power</h3>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} xs={12} md={6}>
                                    <Form.Label>Min Voltage (V)</Form.Label>
                                    <Form.Control type="number"
                                        value={powerConfig['highBattery.minVoltage']}
                                        step="0.01"
                                        min="0"
                                        max="4.2"
                                        data-testid="high-power-min-voltage"
                                        onChange={(e) => onFieldChange('highBattery.minVoltage', e.target.value)} />
                                    <Form.Text muted>
                                        Minimum battery voltage for this power mode
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group as={Col} xs={12} md={6}>
                                    <Form.Label>CPU Freq (MHz)</Form.Label>
                                    <Form.Control type="number"
                                        defaultValue={powerConfig['highBattery.cpuFreqMHz']}
                                        readOnly={true}
                                        data-testid="high-power-cpu-freq" />
                                    <Form.Text muted>
                                        CPU Frequency at this power mode
                                    </Form.Text>
                                </Form.Group>
                            </Form.Row>
                        </Card.Body>
                    </Card>
                    <Card className="card-space">
                        <Card.Body>
                            <Form.Row>
                                <h3>Medium Power</h3>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} xs={12} md={6}>
                                    <Form.Label>Min Voltage (V)</Form.Label>
                                    <Form.Control type="number"
                                        value={powerConfig['mediumBattery.minVoltage']}
                                        step="0.01"
                                        min="0"
                                        max="4.2"
                                        data-testid="med-power-min-voltage"
                                        onChange={(e) => onFieldChange('mediumBattery.minVoltage', e.target.value)} />
                                    <Form.Text muted>
                                        Minimum battery voltage for this power mode
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group as={Col} xs={12} md={6}>
                                    <Form.Label>CPU Freq (MHz)</Form.Label>
                                    <Form.Control type="number"
                                        defaultValue={powerConfig['mediumBattery.cpuFreqMHz']}
                                        readOnly={true}
                                        data-testid="med-power-cpu-freq" />
                                    <Form.Text muted>
                                        CPU Frequency at this power mode
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group as={Col} xs={12} md={6} data-testid="med-power-deep-sleep">
                                    <Form.Label>Deep Sleep</Form.Label>
                                    <TimeRangeSelector
                                        range={powerConfig['mediumBattery.deepSleepDurationUtc']}
                                        onTimeChange={(utc) => onFieldChange('mediumBattery.deepSleepDurationUtc', utc)} />
                                    <Form.Text muted>
                                        Deep sleep duration in this power mode
                                    </Form.Text>
                                </Form.Group>
                            </Form.Row>
                        </Card.Body>
                    </Card>
                    <Card className="card-space">
                        <Card.Body>
                            <Form.Row>
                                <h3>Low Power</h3>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} xs={12} md={6}>
                                    <Form.Label>Min Voltage (V)</Form.Label>
                                    <Form.Control type="number"
                                        value={powerConfig['lowBattery.minVoltage']}
                                        step="0.01"
                                        min="0"
                                        max="4.2"
                                        data-testid="low-power-min-voltage"
                                        onChange={(e) => onFieldChange('lowBattery.minVoltage', e.target.value)} />
                                    <Form.Text muted>
                                        Minimum battery voltage for this power mode
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group as={Col} xs={12} md={6}>
                                    <Form.Label>CPU Freq (MHz)</Form.Label>
                                    <Form.Control type="number"
                                        defaultValue={powerConfig['lowBattery.cpuFreqMHz']}
                                        readOnly={true}
                                        data-testid="low-power-cpu-freq" />
                                    <Form.Text muted>
                                        CPU Frequency at this power mode
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group as={Col} xs={12} md={6} data-testid="low-power-deep-sleep">
                                    <Form.Label>Deep Sleep</Form.Label>
                                    <TimeRangeSelector
                                        range={powerConfig['lowBattery.deepSleepDurationUtc']}
                                        onTimeChange={(utc) => onFieldChange('lowBattery.deepSleepDurationUtc', utc)} />
                                    <Form.Text muted>
                                        Deep sleep duration in this power mode
                                    </Form.Text>
                                </Form.Group>
                            </Form.Row>
                        </Card.Body>
                    </Card>
                    <Card className="card-space">
                        <Card.Body>
                            <Form.Row>
                                <h3>Extra Low Power</h3>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} xs={12} md={6}>
                                    <Form.Label>Sleep duration (Hours)</Form.Label>
                                    <Form.Control type="number"
                                        step="1"
                                        min="0"
                                        value={powerConfig['extraLowBattery.continousDeepSleepHours']}
                                        data-testid="ex-low-power-sleep-duration"
                                        onChange={(e) => onFieldChange('extraLowBattery.continousDeepSleepHours', e.target.value)}
                                    />
                                    <Form.Text muted>
                                        Number of hours to deep sleep. The device will continue to sleep until voltage recovers to the minimum threshold of the low power mode ({powerConfig['lowBattery.minVoltage']}V)
                                    </Form.Text>
                                </Form.Group>
                            </Form.Row>
                        </Card.Body>
                    </Card>
                    {validationError ?
                        <Alert variant="danger" className="widget" data-testid="power-config-validation-error">
                            {validationError}
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

export default PowerConfig;