const TimeUtils = {
    timeToUtc: (localTime) => {
        var pad = (val) => ('' + val).padStart(2, '0');
        var date = new Date();
        var periodTokens = localTime.split(':');
        var localStr = `${date.getFullYear()}-${pad(date.getMonth())}-${pad(date.getDate())}T${pad(periodTokens[0])}:${pad(periodTokens[1])}:00.000`;
        var localDate = new Date(localStr);
        var utcDateStr = localDate.toISOString();
        var timeComponent = utcDateStr.split('T')[1];
        var timeTokens = timeComponent.split(':');
        return `${timeTokens[0]}:${timeTokens[1]}`;
    },
    timeToLocal: (utcTime) => {
        var pad = (val) => ('' + val).padStart(2, '0');
        var date = new Date();
        var periodTokens = utcTime.split(':');
        var utcStr = `${date.getFullYear()}-${pad(date.getMonth())}-${pad(date.getDate())}T${pad(periodTokens[0])}:${pad(periodTokens[1])}:00.000Z`;
        var localDate = new Date(utcStr);
        return `${pad(localDate.getHours())}:${pad(localDate.getMinutes())}`;
    }
}

export default TimeUtils;