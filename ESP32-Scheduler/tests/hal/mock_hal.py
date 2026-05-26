class MockPin:
    """Simulates a GPIO pin. Records all value(), on(), and off() calls."""

    def __init__(self):
        self._value = 0
        self.value_calls = []
        self.on_calls = 0
        self.off_calls = 0

    def value(self, v=None):
        self.value_calls.append(v)
        if v is not None:
            self._value = v
        return self._value

    def on(self):
        self.on_calls += 1
        self._value = 1

    def off(self):
        self.off_calls += 1
        self._value = 0

    @property
    def current_value(self):
        return self._value


class MockADC:
    """Simulates an ADC. Returns a configurable raw value."""

    def __init__(self, raw_value=0):
        self._raw_value = raw_value

    def read(self):
        return self._raw_value


class MockTime:
    """Simulates utime.localtime(). Time tuple: (year, month, day, hour, minute, second, weekday, yearday)."""

    def __init__(self, hour=0, minute=0, second=0):
        self._tuple = (2026, 1, 1, hour, minute, second, 0, 1)

    def set_time(self, hour, minute, second=0):
        self._tuple = (self._tuple[0], self._tuple[1], self._tuple[2], hour, minute, second, self._tuple[6], self._tuple[7])

    def localtime(self):
        return self._tuple


class MockPinFactory:
    """Creates and tracks MockPin instances keyed by pin number."""

    def __init__(self, adc_raw_value=0):
        self._pins: dict = {}
        self._adc_raw_value = adc_raw_value

    def make_input_pin(self, pin_no):
        pin = MockPin()
        self._pins[(pin_no, "in")] = pin
        return pin

    def make_output_pin(self, pin_no):
        pin = MockPin()
        self._pins[(pin_no, "out")] = pin
        return pin

    def make_adc(self, pin_no):
        adc = MockADC(raw_value=self._adc_raw_value)
        self._pins[(pin_no, "adc")] = adc
        return adc

    def get_output_pin(self, pin_no):
        """Retrieve the last output MockPin created for a given pin number."""
        return self._pins.get((pin_no, "out"))

    def get_adc(self, pin_no):
        """Retrieve the MockADC created for a given pin number."""
        return self._pins.get((pin_no, "adc"))


class MockSystem:
    """Simulates machine.freq() and machine.deepsleep()."""

    def __init__(self, cpu_freq=240_000_000):
        self._cpu_freq = cpu_freq
        self.set_freq_calls = []
        self.deep_sleep_calls = []

    def get_cpu_freq(self):
        return self._cpu_freq

    def set_cpu_freq(self, freq):
        self._cpu_freq = freq
        self.set_freq_calls.append(freq)

    def deep_sleep(self, duration_ms):
        self.deep_sleep_calls.append(duration_ms)


class MockNetwork:
    """Simulates network.WLAN — tracks active() calls."""

    def __init__(self, connected=False):
        self._active = True
        self._connected = connected
        self.active_calls = []

    def active(self, v=None):
        self.active_calls.append(v)
        if v is not None:
            self._active = v
        return self._active

    def connect(self, ssid, password):
        pass

    def isconnected(self):
        return self._connected

    def ifconfig(self):
        return ("192.168.1.1", "255.255.255.0", "192.168.1.1", "8.8.8.8")

    def scan(self):
        return []

    def disconnect(self):
        pass
