import Config from './Config';

const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
};

const ApiService = {
    getHealth: async () => {
        let response = await fetch(`${Config.apiBaseUrl}/health/status`, {
            method: 'GET',
            headers: defaultHeaders
        });
        return response.json();
    },
    getIoConfig: async () => {
        let response = await fetch(`${Config.apiBaseUrl}/setup/io_config`, {
            method: 'GET',
            headers: defaultHeaders
        });
        return response.json();
    },
    setIoConfig: async (ioConfig) => {
        let response = await fetch(`${Config.apiBaseUrl}/setup/io_config`, {
            method: 'POST',
            body: JSON.stringify(ioConfig),
            headers: defaultHeaders
        });
        return response.json();
    },
    getPinValue: async (pinNumber) => {
        let response = await fetch(`${Config.apiBaseUrl}/pin/pin_value/${pinNumber}`, {
            method: 'GET',
            headers: defaultHeaders
        });
        return response.json();
    },
    setPinValue: async (pinNumber, value) => {
        let response = await fetch(`${Config.apiBaseUrl}/pin/pin_value/${pinNumber}`, {
            method: 'POST',
            body: JSON.stringify({ value: value }),
            headers: defaultHeaders
        });
        return response.json();
    },
    getPowerConfig: async () => {
        let response = await fetch(`${Config.apiBaseUrl}/setup/power_config`, {
            method: 'GET',
            headers: defaultHeaders
        });
        return response.json();
    },
    setPowerConfig: async (value) => {
        let response = await fetch(`${Config.apiBaseUrl}/setup/power_config`, {
            method: 'POST',
            body: JSON.stringify(value),
            headers: defaultHeaders
        });
        return response.json();
    },
    setWlanConfig: async (value) => {
        let response = await fetch(`${Config.apiBaseUrl}/setup/wlan_creds`, {
            method: 'POST',
            body: JSON.stringify(value),
            headers: defaultHeaders
        });
        return response.json();
    },
    reboot: async () => {
        let response = await fetch(`${Config.apiBaseUrl}/setup/restart`, {
            method: 'POST',
            body: JSON.stringify({}),
            headers: defaultHeaders
        });
        return response.json();
    },
}

export default ApiService;