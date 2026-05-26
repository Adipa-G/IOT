import machine
import network
import utime
from hal.interfaces import PinInterface, ADCInterface, NetworkInterface, TimeInterface, PinFactory


class MicropythonPin:
    def __init__(self, pin):
        self._pin = pin

    def value(self, v=None):
        if v is None:
            return self._pin.value()
        return self._pin.value(v)

    def on(self):
        self._pin.on()

    def off(self):
        self._pin.off()


class MicropythonADC:
    def __init__(self, adc):
        self._adc = adc

    def read(self):
        return self._adc.read()


class MicropythonNetwork:
    def __init__(self, wlan):
        self._wlan = wlan

    def active(self, v=None):
        if v is None:
            return self._wlan.active()
        return self._wlan.active(v)

    def connect(self, ssid, password):
        self._wlan.connect(ssid, password)

    def isconnected(self):
        return self._wlan.isconnected()

    def ifconfig(self):
        return self._wlan.ifconfig()

    def scan(self):
        return self._wlan.scan()

    def disconnect(self):
        self._wlan.disconnect()

    def status(self):
        return self._wlan.status()

    def config(self, *args, **kwargs):
        return self._wlan.config(*args, **kwargs)


class MicropythonTime:
    def localtime(self):
        return utime.localtime()


class MicropythonSystem:
    def get_cpu_freq(self):
        return machine.freq()

    def set_cpu_freq(self, freq):
        machine.freq(freq)

    def deep_sleep(self, duration_ms):
        machine.deepsleep(duration_ms)

    def reset(self):
        machine.reset()


def make_sta_wlan():
    return MicropythonNetwork(network.WLAN(network.STA_IF))


def make_ap_wlan():
    return MicropythonNetwork(network.WLAN(network.AP_IF))


class MicropythonPinFactory:
    def make_input_pin(self, pin_no):
        return MicropythonPin(machine.Pin(pin_no, machine.Pin.IN))

    def make_output_pin(self, pin_no):
        return MicropythonPin(machine.Pin(pin_no, machine.Pin.OUT))

    def make_adc(self, pin_no):
        adc = machine.ADC(machine.Pin(pin_no))
        adc.atten(machine.ADC.ATTN_11DB)
        adc.width(machine.ADC.WIDTH_12BIT)
        return MicropythonADC(adc)
