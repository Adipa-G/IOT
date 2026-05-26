from filters.kalmanfilter import KalmanFilter


class TestKalmanFilter:

    def test_initial_value_unchanged_when_new_equals_prev(self):
        """When new value equals previous, output should equal input."""
        kf = KalmanFilter()
        result = kf.apply_filter(5.0, 5.0)
        assert result == 5.0

    def test_smoothing_moves_towards_new_value(self):
        """Output should move 10% of the way from prev to new."""
        kf = KalmanFilter()
        result = kf.apply_filter(4.0, 5.0)
        assert abs(result - 4.1) < 1e-9

    def test_smoothing_moves_downward(self):
        """Output should move 10% downward when new value is lower."""
        kf = KalmanFilter()
        result = kf.apply_filter(5.0, 4.0)
        assert abs(result - 4.9) < 1e-9

    def test_repeated_applications_converge(self):
        """Applying the filter repeatedly should converge the average toward new value."""
        kf = KalmanFilter()
        value = 0.0
        for _ in range(100):
            value = kf.apply_filter(value, 10.0)
        assert value > 9.9, "After 100 iterations, value should be close to 10"
