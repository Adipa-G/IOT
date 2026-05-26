IO_CONFIG_FILE = "io_config.json"


class IoConfigService:
    def __init__(self, config_service, log_service):
        self._log_service = log_service
        self._config_service = config_service

    def write_config(self, config):
        self._config_service.write_config(IO_CONFIG_FILE, config)

    def read_config(self):
        cfg = self._config_service.read_config(IO_CONFIG_FILE)
        cfg["schedules"] = cfg.get("schedules", [])
        return cfg
