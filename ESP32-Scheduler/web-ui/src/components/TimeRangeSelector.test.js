import { render, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

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
        render(<TimeRangeSelector/>);

        expect(screen.getByTestId('from-time')).toHaveValue(TimeUtil.timeToLocal('00:00'));
        expect(screen.getByTestId('to-time')).toHaveValue(TimeUtil.timeToLocal('00:01'));
    });

    test('convert value to local if range is set', async () => {
        const start = '21:10';
        const end = '12:10';
        render(<TimeRangeSelector range={`${start}-${end}`} onTimeChange={(val) => updatedValue = val}/>);

        expect(screen.getByTestId('from-time')).toHaveValue(TimeUtil.timeToLocal(start));
        expect(screen.getByTestId('to-time')).toHaveValue(TimeUtil.timeToLocal(end));
    });
})

describe('input changed', () => {
    test('when from time changed call and fire time change event with utc time', async () => {
        let updatedValue = '';
        render(<TimeRangeSelector range={'10:00-10:10'} onTimeChange={(val) => updatedValue = val}></TimeRangeSelector>);
        
        fireEvent.change(screen.getByTestId('from-time'), { target: { value: '10:05' } });

        expect(screen.getByTestId('from-time')).toHaveValue('10:05');
        expect(updatedValue).toBe(`${TimeUtil.timeToUtc('10:05')}-10:10`);
    });

    test('when to time changed call and fire time change event with utc time', async () => {
        let updatedValue = '';
        render(<TimeRangeSelector range={'10:00-10:05'} onTimeChange={(val) => updatedValue = val}></TimeRangeSelector>);

        fireEvent.change(screen.getByTestId('to-time'), { target: { value: '10:10' } });

        expect(screen.getByTestId('to-time')).toHaveValue('10:10');
        expect(updatedValue).toBe(`10:00-${TimeUtil.timeToUtc('10:10')}`);
    });
})