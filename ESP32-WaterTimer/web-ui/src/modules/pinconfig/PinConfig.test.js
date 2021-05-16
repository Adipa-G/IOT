import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import ApiService from '../../services/ApiService';
import TimeUtils from '../../services/TimeUtils';

import PinConfig from './PinConfig';

const renderComponent = () => {
    render(
        <PinConfig></PinConfig>
    );
}

describe('when loading', () => {
    beforeEach(() => {
        jest.spyOn(ApiService, 'getIoConfig').mockReturnValue(new Promise(() => { })); //never resolving promise
    });

    test('shows the loader', async () => {
        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(screen.queryByTestId('pin-config-loading-state')).toBeInTheDocument();
        });
    });
})

describe('when loading error', () => {
    beforeEach(() => {
        jest.spyOn(ApiService, 'getIoConfig').mockReturnValue(Promise.reject({}));
    });

    test('shows alert', async () => {
        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(screen.queryByTestId('pin-config-error-state')).toBeInTheDocument();
        });
    });
})

describe('when loaded', () => {
    beforeEach(() => {
        const ioConfig = {
            schedules: [
                { title: "pin 2", pin: 2, highDurationUtc: "12:00-20:00" },
                { title: "pin 3", pin: 3, highDurationUtc: "13:00-15:00" }
            ]
        };
        jest.spyOn(ApiService, 'getIoConfig').mockReturnValue(Promise.resolve(ioConfig));
    });

    test('call the API to load io config', async () => {
        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(ApiService.getIoConfig).toHaveBeenCalledTimes(1);
            expect(screen.getAllByTestId('pin-config-container').length).toBe(2);
        });
    });

    test('bind values correctly', async () => {
        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(screen.getAllByTestId('pin-number-input')[0]).toHaveValue(2);
            expect(screen.getAllByTestId('pin-title-input')[0]).toHaveValue("pin 2");
            expect(screen.getAllByTestId('from-time')[0]).toHaveValue(TimeUtils.timeToLocal("12:00"));
            expect(screen.getAllByTestId('to-time')[0]).toHaveValue(TimeUtils.timeToLocal("20:00"));

            expect(screen.getAllByTestId('pin-number-input')[1]).toHaveValue(3);
            expect(screen.getAllByTestId('pin-title-input')[1]).toHaveValue("pin 3");
            expect(screen.getAllByTestId('from-time')[1]).toHaveValue(TimeUtils.timeToLocal("13:00"));
            expect(screen.getAllByTestId('to-time')[1]).toHaveValue(TimeUtils.timeToLocal("15:00"));
        });
    });
})

describe('when saving', () => {
    beforeEach(() => {
        const ioConfig = {
            schedules: [
                { title: "pin 2", pin: 2, highDurationUtc: "12:00-20:00" }
            ]
        };
        jest.spyOn(ApiService, 'getIoConfig').mockReturnValue(Promise.resolve(ioConfig));
        jest.spyOn(ApiService, 'setIoConfig').mockReturnValue(Promise.resolve({}));
    });

    test('call the API to save io config', async () => {
        await act(async () => {
            renderComponent();
            fireEvent.click(screen.getByTestId('save-button'));
        });

        await waitFor(() => {
            expect(ApiService.setIoConfig).toHaveBeenCalledTimes(1);
        });
    });
})

describe('when removing a config', () => {
    beforeEach(() => {
        const ioConfig = {
            schedules: [
                { title: "pin 2", pin: 2, highDurationUtc: "12:00-20:00" }
            ]
        };
        jest.spyOn(ApiService, 'getIoConfig').mockReturnValue(Promise.resolve(ioConfig));
    });

    test('remove button clicked', async () => {
        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId('remove-button'));
        });

        await waitFor(() => {
            expect(screen.queryAllByTestId('pin-config-container').length).toBe(0);
        });
    });
})

describe('when adding a config', () => {
    beforeEach(() => {
        const ioConfig = {
            schedules: [
                { title: "pin 2", pin: 2, highDurationUtc: "12:00-20:00" }
            ]
        };
        jest.spyOn(ApiService, 'getIoConfig').mockReturnValue(Promise.resolve(ioConfig));
    });

    test('remove add clicked', async () => {
        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId('add-button'));
        });

        await waitFor(() => {
            expect(screen.queryAllByTestId('pin-config-container').length).toBe(2);
        });
    });
})