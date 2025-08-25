import './Dashboard.css'
import { useState, useEffect, useRef } from 'react';
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
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    useEffect(() => {
        setLoading(true);
        const request = Promise.all([
            ApiService.getHealth(),
            ApiService.getIoConfig()
        ]);
        request.then((result) => {
            setLoading(false);
            setHealth(result[0]);
            setIoConfig(result[1]);
            setError(false);
        }).catch(() => {
            setLoading(false);
            setError(true);
        });

        if (!timerRef.current) {
            timerRef.current = setInterval(() => {
                ApiService.getHealth().then((result) => {
                    setHealth(result);
                    setError(false);
                }).catch(() => {
                    setLoading(false);
                    setError(true);
                });
            }, 10000);
        }

        if (!timerRef.current) {
            clearTimeout(timerRef.current);
        }
    }, []);

    return (
        <div className="container">
            {loading && (
                <div className="spinner-border loader" role="status" data-testid="dashboard-loading-state">
                    <span className="visually-hidden">Loading...</span>
                </div>
            )}
            
            {error && (
                <div className="alert alert-danger widget" role="alert" data-testid="dashboard-error-state">
                    Connectivity error. Please reload.
                </div>
            )}
            
            {!loading && (
                <div>
                    <div className="row">
                        <div className="col-6 col-md-4 col-lg-3 widget">
                            <div className="card">
                                <div className="card-body">
                                    <h6 className="card-subtitle mb-2 text-muted">Memory</h6>
                                    <p className="card-text" data-testid="dashboard-memory-widget">
                                        {(health.memory / 1000).toFixed(2)} kB
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-md-4 col-lg-3 widget">
                            <div className="card">
                                <div className="card-body">
                                    <h6 className="card-subtitle mb-2 text-muted">Tempreature</h6>
                                    <p className="card-text" data-testid="dashboard-tempreature-widget">
                                        {health.tempreature.toFixed(2)} C
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-md-4 col-lg-3 widget">
                            <div className="card">
                                <div className="card-body">
                                    <h6 className="card-subtitle mb-2 text-muted">Voltage</h6>
                                    <p className="card-text" data-testid="dashboard-voltage-widget">
                                        {health.voltage.toFixed(2)} V
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-md-4 col-lg-3 widget">
                            <div className="card">
                                <div className="card-body">
                                    <h6 className="card-subtitle mb-2 text-muted">Time (Local)</h6>
                                    <p className="card-text" data-testid="dashboard-time-widget">
                                        {getUtcTime()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        {ioConfig.schedules.map((schedule, i) => (
                            <div className="col-12 col-md-6 widget" key={i}>
                                <ScheduleWidget className="widget" schedule={schedule} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;