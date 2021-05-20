import './PinConfig.css'

import { useState, useEffect } from 'react';
import { Col, Container, Spinner, Alert, Button, Form, Card } from 'react-bootstrap';

import TimeRangeSelector from '../../components/TimeRangeSelector'

import ApiService from '../../services/ApiService';

const PinConfig = () => {
    const [error, setError] = useState(false);
    const [ioConfig, setIoConfig] = useState({ schedules: [] });
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState([]);

    const isNonNumber = (value) => !value || isNaN(value);

    const onPinNumberChange = (scheduleIndex, pinNumber) => {
        const schedule = ioConfig.schedules[scheduleIndex];
        schedule.pin = isNonNumber(pinNumber) ? pinNumber : parseInt(pinNumber);
        let newState = { schedules: ioConfig.schedules };
        newState.schedules[scheduleIndex] = schedule;
        setIoConfig(newState);
    };

    const onPinTitleChange = (scheduleIndex, title) => {
        const schedule = ioConfig.schedules[scheduleIndex];
        schedule.title = title;
        let newState = { schedules: ioConfig.schedules };
        newState.schedules[scheduleIndex] = schedule;
        setIoConfig(newState);
    };

    const onTimeRangeChange = (scheduleIndex, highDurationUtc) => {
        const schedule = ioConfig.schedules[scheduleIndex];
        schedule.highDurationUtc = highDurationUtc;
        let newState = { schedules: ioConfig.schedules };
        newState.schedules[scheduleIndex] = schedule;
        setIoConfig(newState);
    };

    const onAdd = () => {
        let schedules = [...ioConfig.schedules];
        schedules.push({ pin: 0, title: `new ${schedules.length}`, highDurationUtc: '00:00-00:01' });
        let newState = { schedules: schedules };
        setIoConfig(newState);
    };

    const onRemove = (scheduleIndex) => {
        let schedules = [...ioConfig.schedules];
        schedules.splice(scheduleIndex, 1);
        let newState = { schedules: schedules };
        setIoConfig(newState);
    };

    const onSave = () => {
        var err = [];
        var timeRegex = new RegExp(/^(?:2[0-3]|[01][0-9]):[0-5][0-9]-(?:2[0-3]|[01][0-9]):[0-5][0-9]$/)
        ioConfig.schedules.forEach(((schedule, index) => {
            if (!schedule.pin || isNaN(schedule.pin)) {
                err.push(`Schedule ${index}: incorrect pin number.`);
            }
            if (!timeRegex.test(schedule.highDurationUtc)) {
                err.push(`Schedule ${index}: incorrect schedule.`);
            }
            if (!schedule.title) {
                err.push(`Schedule ${index}: incorrect title.`);
            }
        }));
        setValidationError(err);
        if (err.length > 0) {
            return;
        }

        setLoading(true);
        ApiService.setIoConfig(ioConfig).then(() => {
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
        ApiService.getIoConfig().then((result) => {
            if (!unmounted) {
                setLoading(false);
                setIoConfig(result);
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
        <Container className="pin-config">
            { loading ?
                <Spinner animation="border" className="loader" data-testid="pin-config-loading-state">
                    <span className="sr-only">Loading...</span>
                </Spinner >
                : null
            }
            { error ?
                <Alert variant="danger" className="widget" data-testid="pin-config-error-state">
                    Connectivity error. Please reload.
                </Alert>
                : null
            }
            { !loading ?
                <div>
                    {ioConfig.schedules.map((schedule, index) => {
                        return <Card key={index} className="pin-config-card" data-testid="pin-config-container">
                            <Card.Body>
                                <Form.Row>
                                    <Form.Group as={Col} xs={4} sm={4} lg={3}>
                                        <Form.Label>GPIO Pin</Form.Label>
                                        <Form.Control type="number"
                                            value={schedule.pin}
                                            placeholder="pin number"
                                            data-testid="pin-number-input"
                                            onChange={(e) => onPinNumberChange(index, e.target.value)} />
                                    </Form.Group>
                                    <Form.Group as={Col} xs={8} sm={8} lg={3}>
                                        <Form.Label>Title</Form.Label>
                                        <Form.Control type="input"
                                            value={schedule.title}
                                            placeholder="pin title"
                                            data-testid="pin-title-input"
                                            onChange={(e) => onPinTitleChange(index, e.target.value)} />
                                    </Form.Group>
                                    <Form.Group as={Col} xs={12} sm={11} lg={3}>
                                        <Form.Label>Schedule (On)</Form.Label>
                                        <TimeRangeSelector
                                            range={schedule.highDurationUtc}
                                            onTimeChange={(highDurationUtc) => onTimeRangeChange(index, highDurationUtc)} />
                                    </Form.Group>
                                    <Form.Group as={Col} xs={12} sm={1} lg={3}>
                                        <Button variant="outline-danger"
                                            className="remove-button float-right"
                                            data-testid="remove-button"
                                            onClick={() => onRemove(index)}>X
                                        </Button>
                                    </Form.Group>
                                </Form.Row>
                            </Card.Body>
                        </Card>
                    })}
                    {validationError.length > 0 ?
                        <Alert variant="danger" className="widget" data-testid="pin-config-validation-error">
                            {validationError.map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </Alert>
                        : null
                    }
                    <Button variant="outline-primary"
                        className="add-button"
                        data-testid="add-button"
                        onClick={() => onAdd()}>
                        Add Schedule
                    </Button>
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

export default PinConfig;