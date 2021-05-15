import './TimeRangeSelector.css'

import { useState } from 'react';
import TimeUtil from '../services/TimeUtils';

const TimeRangeSelector = (props) => {
    const start = props.range ? TimeUtil.timeToLocal(props.range.split('-')[0]) : TimeUtil.timeToLocal('00:00');
    const end = props.range ? TimeUtil.timeToLocal(props.range.split('-')[1]) : TimeUtil.timeToLocal('00:01');

    const [startTime, setStartTime] = useState(start);
    const [endTime, setEndTime] = useState(end);

    const startTimeOnChange = function (value) {
        setStartTime(value);
        var result = `${TimeUtil.timeToUtc(value)}-${TimeUtil.timeToUtc(endTime)}`;
        props.onTimeChange(result);
    }

    const endTimeOnChange = function (value) {
        setEndTime(value);
        var result = `${TimeUtil.timeToUtc(startTime)}-${TimeUtil.timeToUtc(value)}`;
        props.onTimeChange(result);
    }

    return (
        <div className="time-range">
            <input type="time"
                className="form-control"
                value={startTime}
                onChange={evt => startTimeOnChange(evt.target.value)}
                data-testid="from-time"></input>
            <span className="spacer">-</span>
            <input type="time"
                className="form-control"
                value={endTime}
                onChange={evt => endTimeOnChange(evt.target.value)}
                data-testid="to-time"></input>
        </div>
    );
}

export default TimeRangeSelector;