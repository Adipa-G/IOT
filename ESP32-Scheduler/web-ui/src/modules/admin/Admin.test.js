import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import ApiService from '../../services/ApiService';

import Admin from './Admin';

const renderComponent = () => {

    render(
        <Admin></Admin>
    );
}

describe('when reboot', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    });

    test('show loading while health is waiting', async () => {
        jest.spyOn(ApiService, 'reboot').mockReturnValue(new Promise(() => { }));
        jest.spyOn(ApiService, 'getHealth').mockReturnValue(new Promise(() => { }));

        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId('reboot-button'));
        });

        await act(async () => {
            jest.advanceTimersByTime(11000);
        });

        await waitFor(() => {
            expect(screen.queryByTestId('admin-loading-state')).toBeInTheDocument();
            expect(screen.queryByTestId('reboot-button')).not.toBeInTheDocument();
        });
    });

    test('show button once health returned a valid response', async () => {
        jest.spyOn(ApiService, 'reboot').mockReturnValue(new Promise(() => { }));
        jest.spyOn(ApiService, 'getHealth').mockReturnValue(Promise.resolve({}));

        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId('reboot-button'));
        });

        await act(async () => {
            jest.advanceTimersByTime(11000);
        });

        await waitFor(() => {
            expect(screen.queryByTestId('reboot-button')).toBeInTheDocument();
            expect(screen.queryByTestId('admin-loading-state')).not.toBeInTheDocument();
        });
    });
})