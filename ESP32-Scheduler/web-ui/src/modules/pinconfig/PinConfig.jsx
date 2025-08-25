import './PinConfig.css'
import { useState, useEffect } from 'react';
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
        setLoading(true);
        ApiService.getIoConfig().then((result) => {
            setLoading(false);
            setIoConfig(result);
            setError(false);
        }).catch(() => {
            setLoading(false);
            setError(true);
        });
    }, []);



    return (
        <div className="container pin-config">
            {loading && (
                <div className="spinner-border loader" role="status" data-testid="pin-config-loading-state">
                    <span className="visually-hidden">Loading...</span>
                </div>
            )}
            
            {error && (
                <div className="alert alert-danger widget" role="alert" data-testid="pin-config-error-state">
                    Connectivity error. Please reload.
                </div>
            )}
            
            {!loading && (
                <div>
                    {ioConfig.schedules.map((schedule, index) => (
                        <div className="card pin-config-card" key={index} data-testid="pin-config-container">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-4 col-sm-4 col-lg-3">
                                        <div className="mb-3">
                                            <label className="form-label">GPIO Pin</label>
                                            <input 
                                                type="number"
                                                className="form-control"
                                                value={schedule.pin}
                                                placeholder="pin number"
                                                data-testid="pin-number-input"
                                                onChange={(e) => onPinNumberChange(index, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-8 col-sm-8 col-lg-3">
                                        <div className="mb-3">
                                            <label className="form-label">Title</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                value={schedule.title}
                                                placeholder="pin title"
                                                data-testid="pin-title-input"
                                                onChange={(e) => onPinTitleChange(index, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-11 col-lg-3">
                                        <div className="mb-3">
                                            <label className="form-label">Schedule (On)</label>
                                            <TimeRangeSelector
                                                range={schedule.highDurationUtc}
                                                onTimeChange={(highDurationUtc) => onTimeRangeChange(index, highDurationUtc)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-1 col-lg-3">
                                        <button 
                                            className="btn btn-outline-danger float-end remove-button"
                                            data-testid="remove-button"
                                            onClick={() => onRemove(index)}>
                                            X
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {validationError.length > 0 && (
                        <div className="alert alert-danger widget" role="alert" data-testid="pin-config-validation-error">
                            {validationError.map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </div>
                    )}
                    
                    <button 
                        className="btn btn-outline-primary add-button"
                        data-testid="add-button"
                        onClick={() => onAdd()}>
                        Add Schedule
                    </button>
                    
                    <button 
                        className="btn btn-primary float-end save-button"
                        data-testid="save-button"
                        onClick={() => onSave()}>
                        Save
                    </button>
                </div>
            )}
        </div>
    );
}

export default PinConfig;