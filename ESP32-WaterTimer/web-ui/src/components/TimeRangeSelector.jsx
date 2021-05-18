import './TimeRangeSelector.css'

import { useState, useEffect } from 'react';
import TimeUtils from '../services/TimeUtils';

const TimeRangeSelector = (props) => {
    const [startTime, setStartTime] = useState(TimeUtils.timeToLocal('00:00'));
    const [endTime, setEndTime] = useState(TimeUtils.timeToLocal('00:01'));

    const startTimeOnChange = function (value) {
        setStartTime(value);
        var result = `${TimeUtils.timeToUtc(value)}-${TimeUtils.timeToUtc(endTime)}`;
        props.onTimeChange(result);
    }

    const endTimeOnChange = function (value) {
        setEndTime(value);
        var result = `${TimeUtils.timeToUtc(startTime)}-${TimeUtils.timeToUtc(value)}`;
        props.onTimeChange(result);
    }

    useEffect(() => {
        const start = props.range ? TimeUtils.timeToLocal(props.range.split('-')[0]) : TimeUtils.timeToLocal('00:00');
        const end = props.range ? TimeUtils.timeToLocal(props.range.split('-')[1]) : TimeUtils.timeToLocal('00:01');
        setStartTime(start);
        setEndTime(end);
    }, [props.range]);

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