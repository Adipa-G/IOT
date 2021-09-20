import network
import os
import ubinascii
import ucryptolib

import ioc.locator as locator

POWER_CONFIG_FILE = "power_config.json"


class PowerConfigService:
    def __init__(self):
        self._log_service = locator.log_service
        self._config_service = locator.config_service

    def write_config(self, config):
        self._config_service.write_config(POWER_CONFIG_FILE, config)

    def read_config(self):
        cfg = self._config_service.read_config(POWER_CONFIG_FILE)
        cfg["screenOnSeconds"] = cfg.get("screenOnSeconds", 300)
        cfg["voltageSensorPin"] = cfg.get("voltageSensorPin", 0)
        cfg["voltageMultiplier"] = cfg.get("voltageMultiplier", 1)
        cfg["highBattery.minVoltage"] = cfg.get("highBattery.minVoltage", 4)
        cfg["highBattery.cpuFreqMHz"] = cfg.get("highBattery.cpuFreqMHz", 240)
        cfg["mediumBattery.minVoltage"] = cfg.get("mediumBattery.minVoltage", 3.5)
        cfg["mediumBattery.cpuFreqMHz"] = cfg.get("mediumBattery.cpuFreqMHz", 160)
        cfg["mediumBattery.deepSleepDurationUtc"] = cfg.get(
            "mediumBattery.deepSleepDurationUtc", "12:00-20:00"
        )
        cfg["lowBattery.minVoltage"] = cfg.get("lowBattery.minVoltage", 3)
        cfg["lowBattery.cpuFreqMHz"] = cfg.get("lowBattery.cpuFreqMHz", 80)
        cfg["lowBattery.deepSleepDurationUtc"] = cfg.get(
            "lowBattery.deepSleepDurationUtc", "07:00-22:00"
        )
        cfg["extraLowBattery.continousDeepSleepHours"] = cfg.get(
            "extraLowBattery.continousDeepSleepHours", 8
        )
        return cfg
