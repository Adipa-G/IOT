import './PowerConfig.css'
import { useState, useEffect } from 'react';
import TimeRangeSelector from '../../components/TimeRangeSelector'
import ApiService from '../../services/ApiService';

const PowerConfig = () => {
    const [error, setError] = useState(false);
    const [powerConfig, setPowerConfig] = useState({
        "mediumBattery.cpuFreqMHz": '',
        "lowBattery.minVoltage": '',
        "extraLowBattery.continousDeepSleepHours": '',
        "screenOnSeconds": '',
        "voltageSensorPin": '',
        "voltageMultiplier": '1',
        "mediumBattery.deepSleepDurationUtc": '',
        "mediumBattery.minVoltage": '',
        "highBattery.minVoltage": '',
        "lowBattery.cpuFreqMHz": '',
        "lowBattery.deepSleepDurationUtc": '',
        "highBattery.cpuFreqMHz": ''
    });

    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState([]);

    const isNonNumber = (value) => !value || isNaN(value);

    const onFieldChange = (fieldName, value) => {
        let newState = { ...powerConfig };
        newState[fieldName] = value;
        setPowerConfig(newState);
    };

    const onSave = () => {
        var err = [];
        var timeRegex = new RegExp(/^(?:2[0-3]|[01][0-9]):[0-5][0-9]-(?:2[0-3]|[01][0-9]):[0-5][0-9]$/)

        if (isNonNumber(powerConfig['screenOnSeconds'])) {
            err.push(`General: incorrect screen on time.`);
        }
        if (powerConfig['voltageSensorPin'] && isNonNumber(powerConfig['voltageSensorPin'])) {
            err.push(`General: incorrect voltage sensor pin.`);
        }
        if (isNonNumber(powerConfig['voltageMultiplier'])) {
            err.push(`General: incorrect voltage multiplier.`);
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
        setLoading(true);
        ApiService.getPowerConfig().then((result) => {
            setLoading(false);
            setPowerConfig(result);
            setError(false);
        }).catch(() => {
            setLoading(false);
            setError(true);
        });
    }, []);



    return (
        <div className="container power-config">
            {loading && (
                <div className="spinner-border loader" role="status" data-testid="power-config-loading-state">
                    <span className="visually-hidden">Loading...</span>
                </div>
            )}
            
            {error && (
                <div className="alert alert-danger" data-testid="power-config-error-state">
                    Connectivity error. Please reload.
                </div>
            )}
            
            {!loading && (
                <div>
                    <div className="card">
                        <div className="card-body">
                            <div className="row">
                                <h3>General</h3>
                            </div>
                            <div className="row">
                                <div className="col-12 col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Screen on time (seconds)</label>
                                        <input type="number"
                                            className="form-control"
                                            value={powerConfig['screenOnSeconds']}
                                            step="1"
                                            min="0"
                                            data-testid="screen-on-seconds"
                                            onChange={(e) => onFieldChange('screenOnSeconds', isNonNumber(e.target.value) ? e.target.value : parseInt(e.target.value))}
                                        />
                                        <div className="form-text text-muted">
                                            Screen is turned off after {powerConfig['screenOnSeconds']} seconds.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Voltage sensor pin</label>
                                        <input type="number"
                                            className="form-control"
                                            value={powerConfig['voltageSensorPin']}
                                            step="1"
                                            min="0"
                                            data-testid="voltage-sensor-pin"
                                            onChange={(e) => onFieldChange('voltageSensorPin', isNonNumber(e.target.value) ? e.target.value : parseInt(e.target.value))}
                                        />
                                        <div className="form-text text-muted">
                                            The voltage is read from pin {powerConfig['voltageSensorPin']} instead of the voltage supplied to the ESP32 chip.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Voltage multiplier</label>
                                        <input type="number"
                                            className="form-control"
                                            value={powerConfig['voltageMultiplier']}
                                            step="0.01"
                                            min="0"
                                            data-testid="voltage-multiplier"
                                            onChange={(e) => onFieldChange('voltageMultiplier', isNonNumber(e.target.value) ? e.target.value : parseFloat(e.target.value))}
                                        />
                                        <div className="form-text text-muted">
                                            The voltage is multiplied by {powerConfig['voltageMultiplier']} if the voltage divider is used. If no multiplication is required, set this field to 1.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* High Power Card */}
                    <div className="card card-space">
                        <div className="card-body">
                            <div className="row">
                                <h3>High Power</h3>
                            </div>
                            <div className="row">
                                <div className="col-12 col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Min Voltage (V)</label>
                                        <input type="number"
                                            className="form-control"
                                            value={powerConfig['highBattery.minVoltage']}
                                            step="0.01"
                                            min="0"
                                            max="4.2"
                                            data-testid="high-power-min-voltage"
                                            onChange={(e) => onFieldChange('highBattery.minVoltage', isNonNumber(e.target.value) ? e.target.value : parseFloat(e.target.value))}
                                        />
                                        <div className="form-text text-muted">
                                            Minimum battery voltage for this power mode
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">CPU Freq (MHz)</label>
                                        <input type="number"
                                            className="form-control"
                                            defaultValue={powerConfig['highBattery.cpuFreqMHz']}
                                            readOnly={true}
                                            data-testid="high-power-cpu-freq"
                                        />
                                        <div className="form-text text-muted">
                                            CPU Frequency at this power mode
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medium Power Card */}
                    <div className="card card-space">
                        <div className="card-body">
                            <div className="row">
                                <h3>Medium Power</h3>
                            </div>
                            <div className="row">
                                <div className="col-12 col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Min Voltage (V)</label>
                                        <input type="number"
                                            className="form-control"
                                            value={powerConfig['mediumBattery.minVoltage']}
                                            step="0.01"
                                            min="0"
                                            max="4.2"
                                            data-testid="med-power-min-voltage"
                                            onChange={(e) => onFieldChange('mediumBattery.minVoltage', isNonNumber(e.target.value) ? e.target.value : parseFloat(e.target.value))}
                                        />
                                        <div className="form-text text-muted">
                                            Minimum battery voltage for this power mode
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">CPU Freq (MHz)</label>
                                        <input type="number"
                                            className="form-control"
                                            defaultValue={powerConfig['mediumBattery.cpuFreqMHz']}
                                            readOnly={true}
                                            data-testid="med-power-cpu-freq"
                                        />
                                        <div className="form-text text-muted">
                                            CPU Frequency at this power mode
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6" data-testid="med-power-deep-sleep">
                                    <div className="mb-3">
                                        <label className="form-label">Deep Sleep</label>
                                        <TimeRangeSelector
                                            range={powerConfig['mediumBattery.deepSleepDurationUtc']}
                                            onTimeChange={(utc) => onFieldChange('mediumBattery.deepSleepDurationUtc', utc)} />
                                        <div className="form-text text-muted">
                                            Deep sleep duration in this power mode
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Low Power Card */}
                    <div className="card card-space">
                        <div className="card-body">
                            <div className="row">
                                <h3>Low Power</h3>
                            </div>
                            <div className="row">
                                <div className="col-12 col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Min Voltage (V)</label>
                                        <input type="number"
                                            className="form-control"
                                            value={powerConfig['lowBattery.minVoltage']}
                                            step="0.01"
                                            min="0"
                                            max="4.2"
                                            data-testid="low-power-min-voltage"
                                            onChange={(e) => onFieldChange('lowBattery.minVoltage', isNonNumber(e.target.value) ? e.target.value : parseFloat(e.target.value))}
                                        />
                                        <div className="form-text text-muted">
                                            Minimum battery voltage for this power mode
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">CPU Freq (MHz)</label>
                                        <input type="number"
                                            className="form-control"
                                            defaultValue={powerConfig['lowBattery.cpuFreqMHz']}
                                            readOnly={true}
                                            data-testid="low-power-cpu-freq"
                                        />
                                        <div className="form-text text-muted">
                                            CPU Frequency at this power mode
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6" data-testid="low-power-deep-sleep">
                                    <div className="mb-3">
                                        <label className="form-label">Deep Sleep</label>
                                        <TimeRangeSelector
                                            range={powerConfig['lowBattery.deepSleepDurationUtc']}
                                            onTimeChange={(utc) => onFieldChange('lowBattery.deepSleepDurationUtc', utc)} />
                                        <div className="form-text text-muted">
                                            Deep sleep duration in this power mode
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Extra Low Power Card */}
                    <div className="card card-space">
                        <div className="card-body">
                            <div className="row">
                                <h3>Extra Low Power</h3>
                            </div>
                            <div className="row">
                                <div className="col-12 col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Sleep duration (Hours)</label>
                                        <input type="number"
                                            className="form-control"
                                            step="1"
                                            min="0"
                                            value={powerConfig['extraLowBattery.continousDeepSleepHours']}
                                            data-testid="ex-low-power-sleep-duration"
                                            onChange={(e) => onFieldChange('extraLowBattery.continousDeepSleepHours', isNonNumber(e.target.value) ? e.target.value : parseFloat(e.target.value))}
                                        />
                                        <div className="form-text text-muted">
                                            Number of hours to deep sleep. The device will continue to sleep until voltage recovers to the minimum threshold of the low power mode ({powerConfig['lowBattery.minVoltage']}V)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="alert alert-primary alert-msg">
                        These settings won't be applied until the next restart.
                    </div>
                    
                    {validationError.length > 0 && (
                        <div className="alert alert-danger alert-msg" data-testid="power-config-validation-error">
                            {validationError.map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </div>
                    )}
                    
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

export default PowerConfig;