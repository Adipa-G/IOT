import utime
import esp32
import gc

import ioc.locator as locator


class HealthController:
    def __init__(self):
        self.battery_voltage = locator.battery_voltage
        self.wlan_setup = locator.wlan_setup

    def get_status(self, request):
        voltage = self.battery_voltage.get_voltage()

        return {
            "healthy": True,
            "voltage": voltage,
            "tempreature": (esp32.raw_temperature() - 32) / 1.8,
            "time": utime.localtime(),
            "memory": gc.mem_free(),
            "wlanConfigMode": self.wlan_setup.configMode,
        }