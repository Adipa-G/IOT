import machine
import time
from micropython import const

import ioc.locator as locator

ADC_EN_PIN = const(14)
DEFAULT_VOLTAGE_PIN = const(34)
PIN_HIGH = const(1)
PIN_LOW = const(0)


class BatteryVoltage:
    def __init__(self):
        self.current_value = 0
        self._kalman_filter = locator.kalman_filter
        self._log_service = locator.log_service
        self._power_config_service = locator.power_config_service
        self._power_config = self._power_config_service.read_config()
        adc_en_pin = machine.Pin(ADC_EN_PIN, machine.Pin.OUT)
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
        voltage_miltiplier = 1
        if self._power_config["voltageSensorPin"] > 0:
            voltage_read_pin = self._power_config["voltageSensorPin"]
            voltage_miltiplier = self._power_config["voltageMultiplier"]

        try:
            measure_pin = machine.Pin(voltage_read_pin)
            adc = machine.ADC(measure_pin)
            adc.atten(machine.ADC.ATTN_11DB)
            adc.width(machine.ADC.WIDTH_12BIT)
            if voltage_read_pin == DEFAULT_VOLTAGE_PIN:
                voltage = (adc.read() / 4095) * 7.26 - 0.1
            else:
                voltage = (adc.read() / 4095) * 3.3
            return voltage * voltage_miltiplier
        except Exception as e:
            self._log_service.log("error reading voltage " + str(e))
            return 0
