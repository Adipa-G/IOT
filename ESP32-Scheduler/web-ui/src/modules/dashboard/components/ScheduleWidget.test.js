import { act, render, fireEvent, screen, waitFor } from '@testing-library/react';

import ApiService from '../../../services/ApiService';
import TimeUtils from '../../../services/TimeUtils';

import ScheduleWidget from './ScheduleWidget';

const schedule = { pin: 4, highDurationUtc: '10:10-11:40' };
const renderComponent = () => {
    render(
        <ScheduleWidget schedule={schedule}></ScheduleWidget>
    );
} 

describe('when loading', () => {
    beforeEach(() => {
        const pinState = { value: "1" };
        jest.spyOn(ApiService, 'getPinValue').mockReturnValue(Promise.resolve(pinState));
    });

    test('call the API to load pin state', async () => {
        const schedule = { pin: 4, highDurationUtc: '10:10-11:40' };
        await act(async() => {render(<ScheduleWidget schedule={schedule}/>)});

        expect(ApiService.getPinValue).toHaveBeenCalledTimes(1);
        expect(ApiService.getPinValue).toHaveBeenCalledWith(4);
    });

    test('set the button variant', async () => {
        const schedule = { pin: 4, highDurationUtc: '10:10-11:40' };
        await act(async() => {render(<ScheduleWidget schedule={schedule}/>)});

        await waitFor(() => {
            expect(screen.getByTestId('schedule-widget-off-button')).toHaveClass('btn-success');
            expect(screen.getByTestId('schedule-widget-on-button')).toHaveClass('btn-success');
        });
    });

    test('show the schedule in local time', async () => {
        const schedule = { pin: 4, highDurationUtc: '10:10-11:40' };

        const timeTokens = schedule.highDurationUtc.split('-');
        const localTime = `${TimeUtils.timeToLocal(timeTokens[0])}-${TimeUtils.timeToLocal(timeTokens[1])}`;
        
        await act(async() => {render(<ScheduleWidget schedule={schedule}/>)});

        await waitFor(() => {
            expect(screen.getByTestId('schedule-widget-start-and-end-time')).toHaveTextContent(localTime);
        });
    });
})

describe('when loading error', () => {
    beforeEach(() => {
        jest.spyOn(ApiService, 'getPinValue').mockReturnValue(Promise.reject({}));
    });

    test('shows alert', async () => {
        const schedule = { pin: 4, highDurationUtc: '10:10-11:40' };
        await act(async() => {render(<ScheduleWidget schedule={schedule}/>)});

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

        expect(screen.queryByTestId('schedule-widget-on-button')).toBeVisible();

        fireEvent.click(screen.queryByTestId('schedule-widget-on-button'));

        await waitFor(() => {
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

        expect(screen.queryByTestId('schedule-widget-off-button')).toBeVisible();

        fireEvent.click(screen.queryByTestId('schedule-widget-off-button'));

        await waitFor(() => {
            expect(ApiService.setPinValue).toHaveBeenCalledTimes(1);
            expect(ApiService.setPinValue).toHaveBeenCalledWith(4, "0");
            expect(screen.getByTestId('schedule-widget-off-button')).toHaveClass('btn-secondary');
        });
    });
})