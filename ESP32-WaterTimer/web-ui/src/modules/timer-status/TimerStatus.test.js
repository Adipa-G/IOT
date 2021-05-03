import { act, render, screen, waitFor } from '@testing-library/react';

import ApiService from '../../services/ApiService';

import TimerStatus from './TimerStatus';

const renderComponent = () => {

    render(
        <TimerStatus></TimerStatus>
    );
}

describe('when loading', () => {
    beforeEach(() => {
        const health = { healthy: true, voltage: 0, memory: 0, tempreature: 0, time: [2000, 1, 1, 0, 0, 0, 0, 0] };
        jest.spyOn(ApiService, 'getHealth').mockReturnValue(Promise.resolve(health));
    });

    test('shows the loader', async () => {
        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(screen.queryByTestId('timer-status-loading-state')).toBeInTheDocument();
        });
    });
})

describe('when loading error', () => {
    beforeEach(() => {
        jest.spyOn(ApiService, 'getHealth').mockReturnValue(Promise.reject({}));
    });

    test('shows alert', async () => {
        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(screen.queryByTestId('timer-status-error-state')).toBeInTheDocument();
        });
    });
})

describe('when loaded', () => {
    var pad = (val) => ('' + val).padStart(2, '0');
    let utcTime = [2021, 8, 11, 14, 15, 0, 0, 0];
    let localTime = new Date(`${utcTime[0]}-${pad(utcTime[1])}-${pad(utcTime[2])}T${pad(utcTime[3])}:${pad(utcTime[4])}:${pad(utcTime[5])}Z`);
    let localTimeFormattedStr = `${localTime.getFullYear()}-${pad(localTime.getMonth())}-${pad(localTime.getDate())} ${pad(localTime.getHours())}:${pad(localTime.getMinutes())}`;

    beforeEach(() => {
        const health = { healthy: true, voltage: 3.32343, memory: 62232, tempreature: 12.32, time: utcTime };
        const ioConfig = { schedules: [{ pin: 4, highDurationUtc: '10:00-12:00' }] }

        jest.useFakeTimers();
        jest.spyOn(ApiService, 'getHealth').mockReturnValue(Promise.resolve(health));
        jest.spyOn(ApiService, 'getIoConfig').mockReturnValue(Promise.resolve(ioConfig));

    });

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    });

    test('shows status widgets', async () => {
        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(screen.queryByTestId('timer-status-memory-widget')).toHaveTextContent('62.23 kB');
            expect(screen.queryByTestId('timer-status-tempreature-widget')).toHaveTextContent('12.32 C');
            expect(screen.queryByTestId('timer-status-voltage-widget')).toHaveTextContent('3.32 V');
            expect(screen.queryByTestId('timer-status-time-widget')).toHaveTextContent(localTimeFormattedStr);
            expect(ApiService.getHealth).toHaveBeenCalledTimes(1);
            expect(ApiService.getIoConfig).toHaveBeenCalledTimes(1);
        });
    });

    test('refresh widget after 10 seconds', async () => {
        await act(async () => {
            renderComponent();
            jest.advanceTimersByTime(11000);
        });

        await waitFor(() => {
            expect(ApiService.getHealth).toHaveBeenCalledTimes(2);
        });
    });

    test('show config widget', async () => {
        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(screen.queryByTestId('schedule-widget-pin-4')).toBeVisible();
            expect(ApiService.getIoConfig).toHaveBeenCalledTimes(1);
        });
    });
})