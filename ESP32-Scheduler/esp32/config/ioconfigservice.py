import network
import os
import ubinascii
import ucryptolib

import ioc.locator as locator

IO_CONFIG_FILE = "io_config.json"


class IoConfigService:
    def __init__(self):
        self._log_service = locator.log_service
        self._config_service = locator.config_service

    def write_config(self, config):
        self._config_service.write_config(IO_CONFIG_FILE, config)

    def read_config(self):
        cfg = self._config_service.read_config(IO_CONFIG_FILE)
        cfg["schedules"] = cfg.get("schedules", [])
        return cfg
