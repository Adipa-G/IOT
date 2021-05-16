import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import TimeRangeSelector from './TimeRangeSelector';

import TimeUtil from '../services/TimeUtils';

let updatedValue = '';
const renderComponent = (range) => {
    render(
        <TimeRangeSelector range={range} onTimeChange={(val) => updatedValue = val}></TimeRangeSelector>
    );
}

describe('when loaded', () => {
    test('set defailt value if no range set', async () => {
        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(screen.getByTestId('from-time')).toHaveValue(TimeUtil.timeToLocal('00:00'));
            expect(screen.getByTestId('to-time')).toHaveValue(TimeUtil.timeToLocal('00:01'));
        });
    });

    test('convert value to local if range is set', async () => {
        const start = '21:10';
        const end = '12:10';
        await act(async () => { renderComponent(`${start}-${end}`); });

        await waitFor(() => {
            expect(screen.getByTestId('from-time')).toHaveValue(TimeUtil.timeToLocal(start));
            expect(screen.getByTestId('to-time')).toHaveValue(TimeUtil.timeToLocal(end));
        });
    });
})

describe('input changed', () => {
    test('when from time changed call and fire time change event with utc time', async () => {
        await act(async () => {
            renderComponent('10:00-10:10');
            fireEvent.change(screen.getByTestId('from-time'), { target: { value: '10:05' } });
        });

        await waitFor(() => {
            expect(screen.getByTestId('from-time')).toHaveValue('10:05');
            expect(updatedValue).toBe(`${TimeUtil.timeToUtc('10:05')}-10:10`);
        });
    });

    test('when to time changed call and fire time change event with utc time', async () => {
        await act(async () => {
            renderComponent('10:00-10:05');
            fireEvent.change(screen.getByTestId('to-time'), { target: { value: '10:10' } });
        });

        await waitFor(() => {
            expect(screen.getByTestId('to-time')).toHaveValue('10:10');
            expect(updatedValue).toBe(`10:00-${TimeUtil.timeToUtc('10:10')}`);
        });
    });
})