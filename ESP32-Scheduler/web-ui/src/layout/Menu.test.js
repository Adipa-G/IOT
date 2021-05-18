import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";

import ApiService from './../services/ApiService';

import Menu from './Menu';
import Routes from './../routes';

const renderComponent = () => {
    render(
        <MemoryRouter initialEntries={Routes}>
            <Menu />
        </MemoryRouter>
    );
}

const health = { healthy: false, voltage: 0, memory: 0, tempreature: 0, time: [2000, 1, 1, 0, 0, 0, 0, 0], wlanConfigMode: false };

describe('when wlan config mode', () => {
    beforeEach(() => {
        health.wlanConfigMode = true;
        jest.spyOn(ApiService, 'getHealth').mockReturnValue(Promise.resolve(health));
    });

    test('shows the connect to wifi menu', async () => {
        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(screen.queryByTestId('menu-connect-to-wifi')).toBeInTheDocument();
        });
    });
})

describe('when default mode', () => {
    beforeEach(() => {
        health.wlanConfigMode = false;
        jest.spyOn(ApiService, 'getHealth').mockReturnValue(Promise.resolve(health));
    });

    test('shows the connect to wifi menu', async () => {
        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(screen.queryByTestId('menu-connect-to-wifi')).not.toBeInTheDocument();
        });
    });
})