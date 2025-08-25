import './WlanConfig.css'
import { useState } from 'react';
import ApiService from '../../services/ApiService';

const WlanConfig = () => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [wlanConfig, setWlanConfig] = useState({ ssid: '', password: '', url: '' });
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
        ApiService.setWlanConfig(wlanConfig).then((result) => {
            if (result.result === 'Success') {
                setWlanConfig({ ssid: wlanConfig.ssid, password: wlanConfig.password, url: result.url });
            }
            else {
                err.push(result.error);
                setValidationError(err);
            }
            setLoading(false);
            setError(false);
        }).catch(() => {
            setLoading(false);
            setError(true);
        });
    };

    return (
        <div className="container wlan-config">
            {loading && (
                <div className="spinner-border loader" role="status" data-testid="wlan-config-loading-state">
                    <span className="visually-hidden">Loading...</span>
                </div>
            )}
            
            {error && (
                <div className="alert alert-danger" data-testid="wlan-config-error-state">
                    Connectivity error. Please reload.
                </div>
            )}
            
            {wlanConfig.url && (
                <div className="alert alert-success" data-testid="wlan-config-saved-state">
                    The device is now accessible by connecting to {wlanConfig.ssid} network and browsing {wlanConfig.url}.
                </div>
            )}
            
            {!loading && (
                <div>
                    <div className="card">
                        <div className="card-body">
                            <div className="row">
                                <h3>WiFi Configuration</h3>
                            </div>
                            <div className="row">
                                <div className="col-12 col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Network Name</label>
                                        <input 
                                            type="text"
                                            className="form-control"
                                            value={wlanConfig.ssid}
                                            data-testid="wlan-ssid"
                                            onChange={(e) => onFieldChange('ssid', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Network Password</label>
                                        <input 
                                            type="password"
                                            className="form-control"
                                            value={wlanConfig.password}
                                            data-testid="wlan-password"
                                            onChange={(e) => onFieldChange('password', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="alert alert-warning alert-msg">
                        Once this configuration is changed and saved, this device may not be assesible via the same URL. 
                        Please long press the left hand button of the device to find the new url.
                    </div>
                    
                    {validationError.length > 0 && (
                        <div className="alert alert-danger alert-msg" data-testid="wlan-config-validation-error">
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

export default WlanConfig;