import TimeUtils from './TimeUtils';

describe('time conversion', () => {
    test('local -> utc -> local', async () => {
        var testData = "00:00";
        var utc = TimeUtils.timeToUtc(testData);
        var local = TimeUtils.timeToLocal(utc);

        expect(local).toBe(testData);
    });

    test('utc -> local -> utc', async () => {
        var testData = "00:00";
        var local = TimeUtils.timeToLocal(testData);
        var utc = TimeUtils.timeToUtc(local);

        expect(utc).toBe(testData);
    });
})
