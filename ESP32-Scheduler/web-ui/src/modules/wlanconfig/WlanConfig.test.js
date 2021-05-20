import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import ApiService from '../../services/ApiService';

import WlanConfig from './WlanConfig';

const renderComponent = () => {
    render(
        <WlanConfig></WlanConfig>
    );
}

describe('when saving', () => {
    beforeEach(() => {
        jest.spyOn(ApiService, 'setWlanConfig').mockReturnValue(Promise.resolve({}));
    });

    test('validation error when incorrect wifi name', async () => {
        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            fireEvent.change(screen.getByTestId('wlan-ssid'), { target: { value: '' } })
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId('save-button'));
        });

        await waitFor(() => {
            expect(ApiService.setWlanConfig).toHaveBeenCalledTimes(0);
            expect(screen.getByTestId('wlan-config-validation-error')).toHaveTextContent('Network name is required');
        });
    });

    test('validation error when incorrect wifi password', async () => {
        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            fireEvent.change(screen.getByTestId('wlan-password'), { target: { value: '' } })
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId('save-button'));
        });

        await waitFor(() => {
            expect(ApiService.setWlanConfig).toHaveBeenCalledTimes(0);
            expect(screen.getByTestId('wlan-config-validation-error')).toHaveTextContent('Password is required');
        });
    });

    test('call the API to save io config', async () => {
        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            fireEvent.change(screen.getByTestId('wlan-ssid'), { target: { value: 'X' } })
        });

        await act(async () => {
            fireEvent.change(screen.getByTestId('wlan-password'), { target: { value: 'y' } })
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId('save-button'));
        });

        await waitFor(() => {
            expect(ApiService.setWlanConfig).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('wlan-config-loading-state')).toBeInTheDocument();
        });
    });
})