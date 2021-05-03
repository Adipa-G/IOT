import { act, render, screen, waitFor } from '@testing-library/react';

import ApiService from '../../../services/ApiService';

import ScheduleWidget from './ScheduleWidget';

const renderComponent = () => {
    const schedule = { pin: 4, highDurationUtc: '10:10-11:40' };
    render(
        <ScheduleWidget schedule={schedule}></ScheduleWidget>
    );
}

describe('when loading', () => {
    var pad = (val) => ('' + val).padStart(2, '0');
    var date = new Date();
    var startUtcStr = `${date.getFullYear()}-${pad(date.getMonth())}-${pad(date.getDate())}T10:10:00.000Z`;
    var endUtcStr = `${date.getFullYear()}-${pad(date.getMonth())}-${pad(date.getDate())}T11:40:00.000Z`;
    let localStartTime = new Date(startUtcStr);
    let localEndTime = new Date(endUtcStr);
    let startEndTimeStr = `${pad(localStartTime.getHours())}:${pad(localStartTime.getMinutes())}-${pad(localEndTime.getHours())}:${pad(localEndTime.getMinutes())}`;


    beforeEach(() => {
        const pinState = { value: "1" };
        jest.spyOn(ApiService, 'getPinValue').mockReturnValue(Promise.resolve(pinState));
    });

    test('call the API to load pin state', async () => {
        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(ApiService.getPinValue).toHaveBeenCalledTimes(1);
            expect(ApiService.getPinValue).toHaveBeenCalledWith(4);
        });
    });

    test('set the button variant', async () => {
        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(screen.getByTestId('schedule-widget-off-button')).toHaveClass('btn-success');
            expect(screen.getByTestId('schedule-widget-on-button')).toHaveClass('btn-success');
        });
    });

    test('show the schedule in local time', async () => {
        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(screen.getByTestId('schedule-widget-start-and-end-time')).toHaveTextContent(startEndTimeStr);
        });
    });
})

describe('when loading error', () => {
    beforeEach(() => {
        jest.spyOn(ApiService, 'getPinValue').mockReturnValue(Promise.reject({}));
    });

    test('shows alert', async () => {
        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(screen.queryByTestId('schedule-widget-error-state')).toBeInTheDocument();
        });
    });
})

describe('when state changed', () => {
    test('from off to on', async () => {
        const pinState = { value: "0" };
        jest.spyOn(ApiService, 'getPinValue').mockReturnValue(Promise.resolve(pinState));
        jest.spyOn(ApiService, 'setPinValue').mockReturnValue(Promise.resolve({ result: "Success" }));

        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(screen.queryByTestId('schedule-widget-on-button')).toBeVisible();
            screen.queryByTestId('schedule-widget-on-button').click();
            expect(ApiService.setPinValue).toHaveBeenCalledTimes(1);
            expect(ApiService.setPinValue).toHaveBeenCalledWith(4, "1");
            expect(screen.getByTestId('schedule-widget-off-button')).toHaveClass('btn-success');
        });
    });

    test('from on to off', async () => {
        const pinState = { value: "1" };
        jest.spyOn(ApiService, 'getPinValue').mockReturnValue(Promise.resolve(pinState));
        jest.spyOn(ApiService, 'setPinValue').mockReturnValue(Promise.resolve({ result: "Success" }));

        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(screen.queryByTestId('schedule-widget-off-button')).toBeVisible();
            screen.queryByTestId('schedule-widget-off-button').click();
            expect(ApiService.setPinValue).toHaveBeenCalledTimes(1);
            expect(ApiService.setPinValue).toHaveBeenCalledWith(4, "0");
            expect(screen.getByTestId('schedule-widget-off-button')).toHaveClass('btn-secondary');
        });
    });
})