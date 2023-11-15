import unittest
import ledmodule
from unittest.mock import MagicMock

class LedTest(unittest.TestCase):

    def setup(self):
        pass

    def teardown(self):
        pass

    def test_on(self):
        self.setup()
        pin = MagicMock(return_value=25)

        led = ledmodule.Led(pin)
        led.on()

        pin.value.assert_called_with(1)
        self.teardown()

    def test_off(self):
        self.setup()
        pin = MagicMock(return_value=25)
        
        led = ledmodule.Led(pin)
        led.off()

        pin.value.assert_called_with(0)
        self.teardown()
