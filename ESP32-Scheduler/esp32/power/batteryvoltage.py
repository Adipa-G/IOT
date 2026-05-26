import time
from micropython import const

ADC_EN_PIN = const(14)
DEFAULT_VOLTAGE_PIN = const(34)
PIN_HIGH = const(1)


class BatteryVoltage:
    def __init__(self, kalman_filter, power_config_service, pin_factory, log_service):
        self.current_value = 0
        self._kalman_filter = kalman_filter
        self._log_service = log_service
        self._power_config_service = power_config_service
        self._pin_factory = pin_factory
        self._power_config = self._power_config_service.read_config()
        adc_en_pin = self._pin_factory.make_output_pin(ADC_EN_PIN)
        adc_en_pin.value(PIN_HIGH)

    def get_voltage(self):
        if self.current_value == 0:
            first = self.__read_voltage()
            time.sleep_ms(100)
            second = self.__read_voltage()
            time.sleep_ms(100)
            third = self.__read_voltage()
            self.current_value = (first + second + third) / 3

        voltage = self.__read_voltage()
        self.current_value = self._kalman_filter.apply_filter(
            self.current_value, voltage
        )
        return self.current_value

    def __read_voltage(self):
        voltage_read_pin = DEFAULT_VOLTAGE_PIN
        voltage_multiplier = 1
        if self._power_config["voltageSensorPin"] > 0:
            voltage_read_pin = self._power_config["voltageSensorPin"]
            voltage_multiplier = self._power_config["voltageMultiplier"]

        try:
            adc = self._pin_factory.make_adc(voltage_read_pin)
            if voltage_read_pin == DEFAULT_VOLTAGE_PIN:
                voltage = (adc.read() / 4095) * 7.26 - 0.1
            else:
                voltage = (adc.read() / 4095) * 3.3
            return voltage * voltage_multiplier
        except Exception as e:
            self._log_service.log("error reading voltage " + str(e))
            return 0
