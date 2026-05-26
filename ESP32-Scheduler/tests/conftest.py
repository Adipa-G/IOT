import sys
import os
import asyncio
import json
import time
import binascii
import struct
import types
from unittest.mock import MagicMock

# ---------------------------------------------------------------------------
# 1. sys.path — make esp32/ importable as root package
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "esp32"))

# ---------------------------------------------------------------------------
# 2. MicroPython module aliases — must happen before any ESP32 imports
# ---------------------------------------------------------------------------

# uasyncio → asyncio  (run_schedule uses await uasyncio.sleep_ms)
_asyncio_compat = types.ModuleType("uasyncio")
_asyncio_compat.sleep_ms = lambda ms: asyncio.sleep(ms / 1000)
_asyncio_compat.sleep = asyncio.sleep
_asyncio_compat.get_event_loop = asyncio.get_event_loop
_asyncio_compat.run = asyncio.run
sys.modules["uasyncio"] = _asyncio_compat

# micropython — const() must return its argument unchanged
_micropython_compat = types.SimpleNamespace(const=lambda x: x)
sys.modules["micropython"] = _micropython_compat

# Standard library aliases for u* modules
sys.modules["ujson"] = json
sys.modules["utime"] = time
sys.modules["ubinascii"] = binascii
sys.modules["ustruct"] = struct

# MicroPython time extras not present on CPython
if not hasattr(time, "sleep_ms"):
    time.sleep_ms = lambda ms: None  # no-op in tests

# Pure stubs for hardware/ESP32-only modules
for _mod in ("machine", "network", "ntptime", "esp32", "ucryptolib", "usocket", "ussl"):
    sys.modules[_mod] = MagicMock()

# ---------------------------------------------------------------------------
# 3. Locator reset fixture — isolates each test
# ---------------------------------------------------------------------------
import pytest


@pytest.fixture(autouse=True)
def reset_locator():
    import ioc.locator as locator
    locator.api_service = None
    locator.battery_voltage = None
    locator.config_service = None
    locator.dns_server = None
    locator.hal = None
    locator.kalman_filter = None
    locator.io_config_service = None
    locator.io_service = None
    locator.log_service = None
    locator.power_config_service = None
    locator.power_manager = None
    locator.screen = None
    locator.system = None
    locator.time_provider = None
    locator.web_server = None
    locator.wlan_ap = None
    locator.wlan_config = None
    locator.wlan_setup = None
    locator.wlan_sta = None
    yield
