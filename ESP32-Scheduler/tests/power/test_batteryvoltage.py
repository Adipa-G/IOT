from unittest.mock import MagicMock

from filters.kalmanfilter import KalmanFilter
from power.batteryvoltage import BatteryVoltage
from tests.hal.mock_hal import MockPinFactory

DEFAULT_VOLTAGE_PIN = 34
ADC_EN_PIN = 14


def make_power_config(voltage_sensor_pin=0, voltage_multiplier=1):
    return {
        "voltageSensorPin": voltage_sensor_pin,
        "voltageMultiplier": voltage_multiplier,
    }


def make_service(raw_adc=2048, power_config=None):
    """Build a BatteryVoltage with mock dependencies."""
    if power_config is None:
        power_config = make_power_config()

    power_config_service = MagicMock()
    power_config_service.read_config.return_value = power_config

    log = MagicMock()
    pins = MockPinFactory(adc_raw_value=raw_adc)
    kf = KalmanFilter()

    svc = BatteryVoltage(kf, power_config_service, pins, log)
    return svc, pins, log


class TestBatteryVoltageInit:

    def test_adc_enable_pin_set_high_on_init(self):
        """ADC enable pin (14) must be driven HIGH during construction."""
        _, pins, _ = make_service()
        en_pin = pins.get_output_pin(ADC_EN_PIN)
        assert en_pin is not None, "ADC enable pin was never created"
        assert en_pin.current_value == 1


class TestBatteryVoltageReading:

    def test_get_voltage_uses_default_pin_when_sensor_pin_is_zero(self):
        """When voltageSensorPin is 0, ADC should be created on the default pin (34)."""
        svc, pins, _ = make_service(raw_adc=2048)
        svc.get_voltage()
        assert pins.get_adc(DEFAULT_VOLTAGE_PIN) is not None

    def test_get_voltage_uses_configured_pin_when_set(self):
        """When voltageSensorPin > 0, ADC should be created on that pin instead."""
        cfg = make_power_config(voltage_sensor_pin=35, voltage_multiplier=2)
        svc, pins, _ = make_service(raw_adc=1000, power_config=cfg)
        svc.get_voltage()
        assert pins.get_adc(35) is not None
        assert pins.get_adc(DEFAULT_VOLTAGE_PIN) is None

    def test_get_voltage_returns_kalman_filtered_value(self):
        """get_voltage result should be a smoothed reading, not raw ADC."""
        # raw=2048 on default pin → (2048/4095)*7.26 - 0.1 ≈ 3.526
        svc, _, _ = make_service(raw_adc=2048)
        voltage = svc.get_voltage()
        assert 3.0 < voltage < 4.0, f"Unexpected voltage: {voltage}"

    def test_get_voltage_applies_multiplier_for_custom_pin(self):
        """Voltage should be scaled by voltageMultiplier when using a custom pin."""
        cfg = make_power_config(voltage_sensor_pin=35, voltage_multiplier=2)
        # raw=2048 on custom pin → (2048/4095)*3.3 ≈ 1.65, × 2 ≈ 3.3
        svc, _, _ = make_service(raw_adc=2048, power_config=cfg)
        voltage = svc.get_voltage()
        assert 3.0 < voltage < 3.6, f"Unexpected multiplied voltage: {voltage}"

    def test_get_voltage_returns_zero_and_logs_on_adc_error(self):
        """An ADC exception should be logged; the Kalman filter gracefully dampens toward 0."""
        svc, pins, log = make_service()

        # Replace the factory's make_adc to throw
        def raise_on_adc(pin_no):
            raise RuntimeError("adc broken")
        pins.make_adc = raise_on_adc

        # Seed current_value so we don't hit the first-read averaging path
        svc.current_value = 1.0
        voltage = svc.get_voltage()

        # Error was logged
        log.log.assert_called_once()
        assert "error reading voltage" in log.log.call_args[0][0]

        # Value moves toward 0 (Kalman dampens 1.0 → 0.9) rather than crashing
        assert voltage < 1.0
