import machine
import utime
from micropython import const

ADC_EN_PIN = const(14)
VOLTAGE_PIN = const(34)
PIN_HIGH = const(1)
PIN_LOW = const(0)

class BatteryVoltage:
    def __init__(self):
        adc_en_pin = machine.Pin(ADC_EN_PIN, machine.Pin.OUT)
        adc_en_pin.value(PIN_HIGH)

    def get_voltage(self):
        measure_pin = machine.Pin(VOLTAGE_PIN)
        adc = machine.ADC(measure_pin)
        adc.atten(machine.ADC.ATTN_11DB)
        adc.width(machine.ADC.WIDTH_12BIT)  
        return (adc.read() / 4095) * 7.26 - 0.1