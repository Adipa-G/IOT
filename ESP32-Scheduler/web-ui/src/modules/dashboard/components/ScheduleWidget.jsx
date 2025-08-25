import './ScheduleWidget.css'
import { useState, useEffect } from 'react';
import ApiService from '../../../services/ApiService';
import TimeUtils from '../../../services/TimeUtils';

const ScheduleWidget = (props) => {
    const [pinValue, setPinValue] = useState("0");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        ApiService.getPinValue(props.schedule.pin).then((result) => {
            setLoading(false);
            setPinValue(result.value);
            setError(false);
        }).catch(() => {
            setLoading(false);
            setError(true);
        });
    }, [props.schedule.pin]);

    let setSwitch = (val) => {
        setLoading(true);
        ApiService.setPinValue(props.schedule.pin, val).then(() => {
            setLoading(false);
            setPinValue(val);
            setError(false);
        }).catch(() => {
            setLoading(false);
            setError(true);
        });
    };

    let getHighDurationLocal = () => {
        var duration = props.schedule.highDurationUtc;
        var tokens = duration.split('-');
        return `${TimeUtils.timeToLocal(tokens[0])}-${TimeUtils.timeToLocal(tokens[1])}`;
    };

    return (
        <div>
            {loading && (
                <div className="spinner-border widget-loader" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            )}
            {error ? (
                <div className="alert alert-danger" data-testid="schedule-widget-error-state">
                    ¯\_(ツ)_/¯
                </div>
            ) : (
                <div className="card" data-testid={'schedule-widget-pin-' + props.schedule.pin}>
                    <div className="card-body">
                        <h6 className="card-subtitle mb-2 text-muted">
                            {props.schedule.title} (pin {props.schedule.pin})
                        </h6>
                        <div className="row">
                            <div className="col-8">
                                <p className="card-text" data-testid="schedule-widget-start-and-end-time">
                                    Schedule : <strong>{getHighDurationLocal()}</strong>
                                </p>
                            </div>
                            <div className="col-4">
                                <div className="btn-group float-end" role="group">
                                    <input
                                        type="radio"
                                        className="btn-check"
                                        name={`btnradio-${props.schedule.pin}-1`}
                                        id={`btnradio-${props.schedule.pin}-1`}
                                        value="0"
                                        checked={pinValue === "0"}
                                        onChange={(e) => setSwitch(e.target.value)}
                                    />
                                    <label 
                                        className={`btn ${pinValue === "0" ? 'btn-secondary' : 'btn-success'}`}
                                        htmlFor={`btnradio-${props.schedule.pin}-1`}
                                        data-testid="schedule-widget-off-button"
                                    >
                                        Off
                                    </label>

                                    <input
                                        type="radio"
                                        className="btn-check"
                                        name={`btnradio-${props.schedule.pin}-2`}
                                        id={`btnradio-${props.schedule.pin}-2`}
                                        value="1"
                                        checked={pinValue === "1"}
                                        onChange={(e) => setSwitch(e.target.value)}
                                    />
                                    <label 
                                        className={`btn ${pinValue === "0" ? 'btn-secondary' : 'btn-success'}`}
                                        htmlFor={`btnradio-${props.schedule.pin}-2`}
                                        data-testid="schedule-widget-on-button"
                                    >
                                        On
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ScheduleWidget;