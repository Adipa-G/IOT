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
    getPinValue: async (pin_number) => {
        let response = await fetch(`${Config.apiBaseUrl}/pin/pin_value/${pin_number}`, {
            method: 'GET',
            headers: defaultHeaders
        });
        return response.json();
    },
    setPinValue: async (pin_number, value) => {
        let response = await fetch(`${Config.apiBaseUrl}/pin/pin_value/${pin_number}`, {
            method: 'POST',
            body: JSON.stringify({ value: value }),
            headers: defaultHeaders
        });
        return response.json();
    },
}

export default ApiService;