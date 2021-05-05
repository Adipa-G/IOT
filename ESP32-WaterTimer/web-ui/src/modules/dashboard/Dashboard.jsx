import './Dashboard.css'

import { useState, useEffect, useRef } from 'react';
import { Col, Container, Row, Spinner, Card, Alert } from 'react-bootstrap';

import ScheduleWidget from './components/ScheduleWidget'

import ApiService from '../../services/ApiService';

const Dashboard = () => {
    const [error, setError] = useState(false);
    const [health, setHealth] = useState({ healthy: false, voltage: 0, memory: 0, tempreature: 0, time: [2000, 1, 1, 0, 0, 0, 0, 0] });
    const [ioConfig, setIoConfig] = useState({ schedules: [] });
    const [loading, setLoading] = useState(false);
    const timerRef = useRef(null);

    const getUtcTime = () => {
        var pad = (val) => ('' + val).padStart(2, '0');
        var utc = `${health.time[0]}-${pad(health.time[1])}-${pad(health.time[2])}T${pad(health.time[3])}:${pad(health.time[4])}:00.000Z`;
        var date = new Date(utc);
        return `${date.getFullYear()}-${pad(date.getMonth())}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    useEffect(() => {
        let unmounted = false;
        setLoading(true);
        const request = Promise.all([
            ApiService.getHealth(),
            ApiService.getIoConfig()
        ]);
        request.then((result) => {
            if (!unmounted) {
                setLoading(false);
                setHealth(result[0]);
                setIoConfig(result[1]);
                setError(false);
            }
        }).catch(() => {
            if (!unmounted) {
                setLoading(false);
                setError(true);
            }
        });

        if (!timerRef.current) {
            timerRef.current = setInterval(() => {
                ApiService.getHealth().then((result) => {
                    if (!unmounted) {
                        setHealth(result);
                        setError(false);
                    }
                }).catch(() => {
                    if (!unmounted) {
                        setLoading(false);
                        setError(true);
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

    return (
        <Container>
            { loading ?
                <Spinner animation="border" className="loader" data-testid="dashboard-loading-state">
                    <span className="sr-only">Loading...</span>
                </Spinner >
                : null
            }
            { error ?
                <Alert variant="danger" className="widget" data-testid="dashboard-error-state">
                    Connectivity error. Please reload.
                </Alert>
                : null
            }
            { !loading ?
                <div>
                    <Row>
                        <Col xs={6} md={4} lg={3} key={1} className="widget">
                            <Card>
                                <Card.Body>
                                    <Card.Subtitle className="mb-2 text-muted">Memory</Card.Subtitle>
                                    <Card.Text data-testid="dashboard-memory-widget">{(health.memory / 1000).toFixed(2)} kB</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={6} md={4} lg={3} key={2} className="widget">
                            <Card>
                                <Card.Body>
                                    <Card.Subtitle className="mb-2 text-muted">Tempreature</Card.Subtitle>
                                    <Card.Text data-testid="dashboard-tempreature-widget">{health.tempreature.toFixed(2)} C</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={6} md={4} lg={3} key={3} className="widget">
                            <Card>
                                <Card.Body>
                                    <Card.Subtitle className="mb-2 text-muted">Voltage</Card.Subtitle>
                                    <Card.Text data-testid="dashboard-voltage-widget">{health.voltage.toFixed(2)} V</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={6} md={4} lg={3} key={4} className="widget">
                            <Card>
                                <Card.Body>
                                    <Card.Subtitle className="mb-2 text-muted">Time (Local)</Card.Subtitle>
                                    <Card.Text data-testid="dashboard-time-widget">{getUtcTime()}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        {ioConfig.schedules.map(function (schedule, i) {
                            return <Col xs={12} md={6} className="widget" key={i}>
                                <ScheduleWidget className="widget" schedule={schedule}></ScheduleWidget>
                            </Col>
                        })}
                    </Row>
                </div> :
                null
            }
        </Container>
    );
}

export default Dashboard;