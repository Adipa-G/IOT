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
        self.atten_calls = []
        self.width_calls = []

    def read(self):
        return self._raw_value

    def atten(self, attenuation):
        self.atten_calls.append(attenuation)

    def width(self, bits):
        self.width_calls.append(bits)


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

    def __init__(self):
        self._pins: dict = {}

    def make_input_pin(self, pin_no):
        pin = MockPin()
        self._pins[(pin_no, "in")] = pin
        return pin

    def make_output_pin(self, pin_no):
        pin = MockPin()
        self._pins[(pin_no, "out")] = pin
        return pin

    def make_adc(self, pin_no):
        adc = MockADC()
        self._pins[(pin_no, "adc")] = adc
        return adc

    def get_output_pin(self, pin_no):
        """Retrieve the last output MockPin created for a given pin number."""
        return self._pins.get((pin_no, "out"))
