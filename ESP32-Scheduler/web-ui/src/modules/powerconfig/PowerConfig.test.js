import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import ApiService from '../../services/ApiService';
import TimeUtils from '../../services/TimeUtils';

import PowerConfig from './PowerConfig';

const powerConfig = {
    "screenOnSeconds": 300,
    "voltageSensorPin": 31,
    "voltageMultiplier": 1.33,
    "highBattery.minVoltage": 4.0,
    "highBattery.cpuFreqMHz": 240,
    "mediumBattery.minVoltage": 3.2,
    "mediumBattery.cpuFreqMHz": 160,
    "mediumBattery.deepSleepDurationUtc": "12:00-20:00",
    "lowBattery.minVoltage": 3.0,
    "lowBattery.cpuFreqMHz": 80,
    "lowBattery.deepSleepDurationUtc": "07:00-22:00",
    "extraLowBattery.continousDeepSleepHours": 8
};

describe('when loading', () => {
    beforeEach(() => {
        jest.spyOn(ApiService, 'getPowerConfig').mockReturnValue(new Promise(() => { })); //never resolving promise
    });

    test('shows the loader', async () => {
        await act(async () => { render(<PowerConfig/>); });

        expect(screen.queryByTestId('power-config-loading-state')).toBeInTheDocument();
    });
})

describe('when loading error', () => {
    beforeEach(() => {
        jest.spyOn(ApiService, 'getPowerConfig').mockReturnValue(Promise.reject({}));
    });

    test('shows alert', async () => {
        await act(async () => { render(<PowerConfig/>); });
        
        await waitFor(() => {
            expect(screen.queryByTestId('power-config-error-state')).toBeInTheDocument();
        });
    });
})

describe('when loaded', () => {
    beforeEach(() => {
        jest.spyOn(ApiService, 'getPowerConfig').mockReturnValue(Promise.resolve(powerConfig));
    });

    test('call the API to load io config', async () => {
        await act(async () => { render(<PowerConfig/>); });

        await waitFor(() => {
            expect(ApiService.getPowerConfig).toHaveBeenCalledTimes(1);
        });
    });

    test('bind values correctly', async () => {
        await act(async () => { render(<PowerConfig/>); });

        await waitFor(() => {
            expect(screen.getByTestId('screen-on-seconds')).toHaveValue(300);
            expect(screen.getByTestId('voltage-sensor-pin')).toHaveValue(31);
            expect(screen.getByTestId('voltage-multiplier')).toHaveValue(1.33);
            expect(screen.getByTestId('high-power-min-voltage')).toHaveValue(4);
            expect(screen.getByTestId('high-power-cpu-freq')).toHaveValue(240);
            expect(screen.getByTestId('med-power-min-voltage')).toHaveValue(3.2);
            expect(screen.getByTestId('med-power-cpu-freq')).toHaveValue(160);
            expect(within(screen.getByTestId('med-power-deep-sleep')).getByTestId('from-time')).toHaveValue(TimeUtils.timeToLocal('12:00'));
            expect(within(screen.getByTestId('med-power-deep-sleep')).getByTestId('to-time')).toHaveValue(TimeUtils.timeToLocal('20:00'));
            expect(screen.getByTestId('low-power-min-voltage')).toHaveValue(3);
            expect(screen.getByTestId('low-power-cpu-freq')).toHaveValue(80);
            expect(within(screen.getByTestId('low-power-deep-sleep')).getByTestId('from-time')).toHaveValue(TimeUtils.timeToLocal('07:00'));
            expect(within(screen.getByTestId('low-power-deep-sleep')).getByTestId('to-time')).toHaveValue(TimeUtils.timeToLocal('22:00'));
            expect(screen.getByTestId('ex-low-power-sleep-duration')).toHaveValue(8);
        });
    });
})

describe('when saving', () => {
    beforeEach(() => {
        jest.spyOn(ApiService, 'getPowerConfig').mockReturnValue(Promise.resolve(powerConfig));
        jest.spyOn(ApiService, 'setPowerConfig').mockReturnValue(Promise.resolve({}));
    });

    test('validation error when incorrect screen on time', async () => {
        await act(async () => { render(<PowerConfig/>); });

        await waitFor(() => {
            expect(screen.getByTestId('screen-on-seconds')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('screen-on-seconds'), { target: { value: '' } })
        fireEvent.click(screen.getByTestId('save-button'));

        expect(ApiService.setPowerConfig).toHaveBeenCalledTimes(0);
        expect(screen.getByTestId('power-config-validation-error')).toHaveTextContent('General: incorrect screen on time');
    });

    test('validation error when incorrect voltage multiplier', async () => {
        await act(async () => { render(<PowerConfig/>); });

        await waitFor(() => {
            expect(screen.getByTestId('voltage-multiplier')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('voltage-multiplier'), { target: { value: '' } })
        fireEvent.click(screen.getByTestId('save-button'));

        expect(ApiService.setPowerConfig).toHaveBeenCalledTimes(0);
        expect(screen.getByTestId('power-config-validation-error')).toHaveTextContent('General: incorrect voltage multiplier');
    });

    test('validation error when incorrect high power min voltage', async () => {
        await act(async () => { render(<PowerConfig/>); });

        await waitFor(() => {
            expect(screen.getByTestId('high-power-min-voltage')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('high-power-min-voltage'), { target: { value: '' } });
        fireEvent.click(screen.getByTestId('save-button'));

        expect(ApiService.setPowerConfig).toHaveBeenCalledTimes(0);
        expect(screen.getByTestId('power-config-validation-error')).toHaveTextContent('High power: incorrect min voltage');
    });

    test('validation error when incorrect medium power min voltage', async () => {
        await act(async () => { render(<PowerConfig/>); });

        await waitFor(() => {
            expect(screen.getByTestId('med-power-min-voltage')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('med-power-min-voltage'), { target: { value: '' } })
        fireEvent.click(screen.getByTestId('save-button'));

        expect(ApiService.setPowerConfig).toHaveBeenCalledTimes(0);
        expect(screen.getByTestId('power-config-validation-error')).toHaveTextContent('Medium power: incorrect min voltage');
    });

    test('validation error when high power min voltage less than medium power min voltage', async () => {
        await act(async () => { render(<PowerConfig/>); });

        await waitFor(() => {
            expect(screen.getByTestId('high-power-min-voltage')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('high-power-min-voltage'), { target: { value: '3' } });
        fireEvent.change(screen.getByTestId('med-power-min-voltage'), { target: { value: '4' } });
        fireEvent.click(screen.getByTestId('save-button'));

        expect(ApiService.setPowerConfig).toHaveBeenCalledTimes(0);
        expect(screen.getByTestId('power-config-validation-error')).toHaveTextContent('Medium power: min voltage should be less than min voltage of high power');
    });

    test('validation error when incorrect low power min voltage', async () => {
        await act(async () => { render(<PowerConfig/>); });

        await waitFor(() => {
            expect(screen.getByTestId('low-power-min-voltage')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('low-power-min-voltage'), { target: { value: '' } });
        fireEvent.click(screen.getByTestId('save-button'));

        expect(ApiService.setPowerConfig).toHaveBeenCalledTimes(0);
        expect(screen.getByTestId('power-config-validation-error')).toHaveTextContent('Low power: incorrect min voltage');
    });

    test('validation error when med power min voltage less than low power min voltage', async () => {
        await act(async () => { render(<PowerConfig/>); });

        await waitFor(() => {
            expect(screen.getByTestId('med-power-min-voltage')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('med-power-min-voltage'), { target: { value: '3' } });
        fireEvent.change(screen.getByTestId('low-power-min-voltage'), { target: { value: '4' } });
        fireEvent.click(screen.getByTestId('save-button'));

        expect(ApiService.setPowerConfig).toHaveBeenCalledTimes(0);
        expect(screen.getByTestId('power-config-validation-error')).toHaveTextContent('Low power: min voltage should be less than min voltage of medium power');
    });

    test('validation error when incorrect extra low power sleep', async () => {
        await act(async () => { render(<PowerConfig/>); });

        await waitFor(() => {
            expect(screen.getByTestId('ex-low-power-sleep-duration')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByTestId('ex-low-power-sleep-duration'), { target: { value: '' } })
        fireEvent.click(screen.getByTestId('save-button'));

        expect(ApiService.setPowerConfig).toHaveBeenCalledTimes(0);
        expect(screen.getByTestId('power-config-validation-error')).toHaveTextContent('Extra low power: incorrect sleep duration');
    });

    test('call the API to save io config', async () => {
        await act(async () => { render(<PowerConfig/>); });

        await waitFor(() => {
            expect(screen.getByTestId('save-button')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('save-button'));

        await waitFor(() => {
            expect(ApiService.setPowerConfig).toHaveBeenCalledTimes(1);
        });
    });
})