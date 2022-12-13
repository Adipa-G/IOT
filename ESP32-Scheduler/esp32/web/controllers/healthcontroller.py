import utime
import esp32
import gc

import ioc.locator as locator


class HealthController:
    def __init__(self):
        self._battery_voltage = locator.battery_voltage
        self._log_service = locator.log_service
        self._wlan_setup = locator.wlan_setup

    def get_status(self, request):
        voltage = self._battery_voltage.get_voltage()

        return {
            "healthy": True,
            "voltage": voltage,
            "tempreature": (esp32.raw_temperature() - 32) / 1.8,
            "time": utime.localtime(),
            "memory": gc.mem_free(),
            "wlanConfigMode": self._wlan_setup.configMode,
        }

    def get_logs(self, request):
        return {
            "logs": self._log_service.get_logs(),
        }
