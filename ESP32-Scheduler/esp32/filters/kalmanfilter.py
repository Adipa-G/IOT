class KalmanFilter:
    def __init__(self):
        pass

    def apply_filter(self, prevKalmanAvg, newValue):
        result = prevKalmanAvg + (newValue - prevKalmanAvg) * 0.1
        return result
