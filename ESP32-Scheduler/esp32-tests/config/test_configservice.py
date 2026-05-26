import json
from unittest.mock import MagicMock, mock_open, patch, call

from esp_config.configservice import ConfigService


def make_service():
    log = MagicMock()
    return ConfigService(log), log


class TestConfigServiceRead:

    def test_read_config_returns_parsed_json(self):
        """A valid JSON file should be parsed and returned as a dict."""
        svc, _ = make_service()
        payload = '{"pin": 5, "enabled": true}'

        with patch("builtins.open", mock_open(read_data=payload)):
            result = svc.read_config("settings.json")

        assert result == {"pin": 5, "enabled": True}

    def test_read_config_returns_empty_dict_on_missing_file(self):
        """A FileNotFoundError should return an empty dict and log the error."""
        svc, log = make_service()

        with patch("builtins.open", side_effect=FileNotFoundError("not found")):
            result = svc.read_config("missing.json")

        assert result == {}
        log.log.assert_called_once()
        assert "missing.json" in log.log.call_args[0][0]

    def test_read_config_returns_empty_dict_on_invalid_json(self):
        """Malformed JSON should return an empty dict and log the error."""
        svc, log = make_service()

        with patch("builtins.open", mock_open(read_data="{bad json")):
            result = svc.read_config("corrupt.json")

        assert result == {}
        log.log.assert_called_once()


class TestConfigServiceWrite:

    def test_write_config_serialises_and_writes_json(self):
        """write_config should serialise the dict and write it to the given filename."""
        svc, _ = make_service()
        m = mock_open()

        with patch("builtins.open", m):
            svc.write_config("out.json", {"key": "value"})

        m.assert_called_once_with("out.json", "w")
        written = "".join(c.args[0] for c in m().write.call_args_list)
        assert json.loads(written) == {"key": "value"}

    def test_write_config_logs_on_file_error(self):
        """An OSError during write should be logged without raising."""
        svc, log = make_service()

        with patch("builtins.open", side_effect=OSError("disk full")):
            svc.write_config("out.json", {})

        log.log.assert_called_once()
        assert "out.json" in log.log.call_args[0][0]
