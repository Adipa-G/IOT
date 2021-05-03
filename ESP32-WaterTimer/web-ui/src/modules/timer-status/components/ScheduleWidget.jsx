import './ScheduleWidget.css'

import { useState, useEffect } from 'react';
import { Spinner, Card, Alert, ButtonGroup, ToggleButton, Col, Row } from 'react-bootstrap';

import ApiService from '../../../services/ApiService';

const ScheduleWidget = (props) => {
    const [pinValue, setPinValue] = useState("0");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        let unmounted = false
        setLoading(true);
        ApiService.getPinValue(props.schedule.pin).then((result) => {
            if (!unmounted) {
                setLoading(false);
                setPinValue(result.value);
                setError(false);
            }
        }).catch(() => {
            setLoading(false);
            setError(true);
        });
        return () => {
            unmounted = true
        }
    }, [props.schedule.pin]);

    let setSwitch = (val) => {
        let unmounted = false
        setLoading(true);
        ApiService.setPinValue(props.schedule.pin, val).then(() => {
            if (!unmounted) {
                setLoading(false);
                setPinValue(val);
                setError(false);
            }
        }).catch(() => {
            setLoading(false);
            setError(true);
        });
        return () => {
            unmounted = true
        }
    };

    let getHighDurationLocal = () => {
        var pad = (val) => ('' + val).padStart(2, '0');
        var convertToLocal = (periodUtc) => {
            var date = new Date();
            var periodTokens = periodUtc.split(':');
            var utcStr = `${date.getFullYear()}-${pad(date.getMonth())}-${pad(date.getDate())}T${pad(periodTokens[0])}:${pad(periodTokens[1])}:00.000Z`;
            var localDate = new Date(utcStr);
            return `${pad(localDate.getHours())}:${pad(localDate.getMinutes())}`;
        };
        var duration = props.schedule.highDurationUtc;
        var tokens = duration.split('-');
        return `${convertToLocal(tokens[0])}-${convertToLocal(tokens[1])}`;
    };

    return (
        <div>
            { loading ?
                <Spinner animation="border" className="widget-loader">
                    <span className="sr-only">Loading...</span>
                </Spinner >
                : null
            }
            { error ?
                <Alert variant="danger" data-testid="schedule-widget-error-state">
                    ¯\_(ツ)_/¯
                </Alert>
                : <Card data-testid={'schedule-widget-pin-' + props.schedule.pin}>
                    <Card.Body>
                        <Card.Subtitle className="mb-2 text-muted">PIN {props.schedule.pin}</Card.Subtitle>
                        <Row>
                            <Col xs={8}>
                                <Card.Text data-testid="schedule-widget-start-and-end-time">
                                    Schedule : <strong>{getHighDurationLocal()}</strong>
                                </Card.Text>
                            </Col>
                            <Col xs={4}>
                                <ButtonGroup toggle className="float-right">
                                    <ToggleButton
                                        key={1}
                                        type="radio"
                                        name="radio"
                                        value="0"
                                        data-testid="schedule-widget-off-button"
                                        variant={pinValue === "0" ? 'secondary' : 'success'}
                                        checked={pinValue === "0"}
                                        onChange={(e) => setSwitch(e.currentTarget.value)}
                                    >
                                        Off
                                    </ToggleButton>
                                    <ToggleButton
                                        key={2}
                                        type="radio"
                                        name="radio"
                                        value="1"
                                        data-testid="schedule-widget-on-button"
                                        variant={pinValue === "0" ? 'secondary' : 'success'}
                                        checked={pinValue === "1"}
                                        onChange={(e) => setSwitch(e.currentTarget.value)}
                                    >
                                        On
                                </ToggleButton>
                                </ButtonGroup>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            }
        </div>
    );
}

export default ScheduleWidget;