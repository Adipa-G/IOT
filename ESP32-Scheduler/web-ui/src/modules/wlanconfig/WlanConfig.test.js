import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ApiService from '../../services/ApiService';

import WlanConfig from './WlanConfig';

describe('when saving', () => {
    beforeEach(() => {
        jest.spyOn(ApiService, 'setWlanConfig').mockReturnValue(Promise.resolve({}));
    });

    test('validation error when incorrect wifi name', async () => {
        render(<WlanConfig/>);

        await waitFor(() => {
            expect(screen.getByTestId('wlan-ssid')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('wlan-ssid'), { target: { value: '' } });
        fireEvent.click(screen.getByTestId('save-button'));

        expect(ApiService.setWlanConfig).toHaveBeenCalledTimes(0);
        expect(screen.getByTestId('wlan-config-validation-error')).toHaveTextContent('Network name is required');
    });

    test('validation error when incorrect wifi password', async () => {
        render(<WlanConfig/>);

        await waitFor(() => {
            expect(screen.getByTestId('wlan-password')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('wlan-password'), { target: { value: '' } });
        fireEvent.click(screen.getByTestId('save-button'));

        expect(ApiService.setWlanConfig).toHaveBeenCalledTimes(0);
        expect(screen.getByTestId('wlan-config-validation-error')).toHaveTextContent('Password is required');
    });
})

describe('when saving success', () => {
    beforeEach(() => {
        jest.spyOn(ApiService, 'setWlanConfig').mockReturnValue(Promise.resolve({ result: 'Success', url: 'http://127.10.10.1/' }));
    });

    test('call the API to save io config', async () => {
        render(<WlanConfig/>);

        await waitFor(() => {
            expect(screen.getByTestId('wlan-ssid')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('wlan-ssid'), { target: { value: 'My_Network' } });
        fireEvent.change(screen.getByTestId('wlan-password'), { target: { value: 'y' } });
        fireEvent.click(screen.getByTestId('save-button'));
        
        await waitFor(() => {
            expect(ApiService.setWlanConfig).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('wlan-config-saved-state')).toBeInTheDocument();
            expect(screen.queryByTestId('wlan-config-saved-state')).toHaveTextContent('My_Network');
            expect(screen.queryByTestId('wlan-config-saved-state')).toHaveTextContent('http://127.10.10.1/');
        });
    });
})

describe('when saving returned error', () => {
    beforeEach(() => {
        jest.spyOn(ApiService, 'setWlanConfig').mockReturnValue(Promise.resolve({ result: 'Failed', error: 'xyz....' }));
    });

    test('call the API to save io config', async () => {
        render(<WlanConfig/>);

        await waitFor(() => {
            expect(screen.getByTestId('wlan-ssid')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('wlan-ssid'), { target: { value: 'X' } });
        fireEvent.change(screen.getByTestId('wlan-password'), { target: { value: 'y' } });
        fireEvent.click(screen.getByTestId('save-button'));

        await waitFor(() => {
            expect(ApiService.setWlanConfig).toHaveBeenCalledTimes(1);
            expect(screen.getByTestId('wlan-config-validation-error')).toHaveTextContent('xyz');
        });
    });
})