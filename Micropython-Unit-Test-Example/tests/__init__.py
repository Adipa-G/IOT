import sys
from unittest.mock import MagicMock

sys.modules['machine'] = MagicMock()
from .ledmodule.led_test import LedTest
