from unittest.mock import MagicMock
from types import SimpleNamespace

from web.controllers.healthcontroller import HealthController


def _make_controller(voltage=3.8, config_mode=False):
    battery_voltage = MagicMock()
    battery_voltage.get_voltage.return_value = voltage

    wlan_setup = MagicMock()
    wlan_setup.configMode = config_mode

    log_service = MagicMock()
    log_service.get_logs.return_value = "log line 1\nlog line 2"

    return HealthController(battery_voltage, wlan_setup, log_service)


def test_get_status_returns_expected_fields():
    """get_status returns a dict with all required health keys."""
    controller = _make_controller(voltage=3.75)
    result = controller.get_status(request=None)

    assert result["healthy"] is True
    assert result["voltage"] == 3.75
    assert "tempreature" in result
    assert "time" in result
    assert "memory" in result
    assert "wlanConfigMode" in result


def test_get_status_reflects_wlan_config_mode():
    """get_status.wlanConfigMode mirrors WLANSetup.configMode."""
    controller = _make_controller(config_mode=True)
    result = controller.get_status(request=None)
    assert result["wlanConfigMode"] is True


def test_get_logs_delegates_to_log_service():
    """get_logs returns the log content from the injected log_service."""
    controller = _make_controller()
    result = controller.get_logs(request=None)
    assert "log line 1" in result["logs"]
