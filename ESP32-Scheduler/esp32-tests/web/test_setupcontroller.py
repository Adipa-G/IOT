from unittest.mock import MagicMock
from types import SimpleNamespace

from web.controllers.setupcontroller import SetupController
from hal.mock_hal import MockSystem


def _make_controller(config_mode=False, wlan_test_result=None):
    io_config = MagicMock()
    io_config.read_config.return_value = {"schedules": []}

    power_config = MagicMock()
    power_config.read_config.return_value = {"screenOnSeconds": 300}

    wlan_config = MagicMock()

    wlan_setup = MagicMock()
    wlan_setup.configMode = config_mode
    if wlan_test_result is not None:
        wlan_setup.test_wlan_config.return_value = wlan_test_result

    system = MockSystem()

    return SetupController(io_config, power_config, wlan_config, wlan_setup, system), \
           io_config, power_config, wlan_config, wlan_setup, system


def _request(payload=None):
    return SimpleNamespace(payload=payload or {})


# ---------------------------------------------------------------------------
# io_config
# ---------------------------------------------------------------------------

def test_get_io_config_returns_service_result():
    ctrl, io_config, *_ = _make_controller()
    result = ctrl.get_io_config(_request())
    assert result == {"schedules": []}


def test_post_io_config_writes_payload():
    ctrl, io_config, *_ = _make_controller()
    ctrl.post_io_config(_request(payload={"schedules": [{"pin": 2}]}))
    io_config.write_config.assert_called_once_with({"schedules": [{"pin": 2}]})


# ---------------------------------------------------------------------------
# power_config
# ---------------------------------------------------------------------------

def test_get_power_config_returns_service_result():
    ctrl, _, power_config, *_ = _make_controller()
    result = ctrl.get_power_config(_request())
    assert result == {"screenOnSeconds": 300}


def test_post_power_config_writes_payload():
    ctrl, _, power_config, *_ = _make_controller()
    ctrl.post_power_config(_request(payload={"screenOnSeconds": 60}))
    power_config.write_config.assert_called_once_with({"screenOnSeconds": 60})


# ---------------------------------------------------------------------------
# wlan_creds
# ---------------------------------------------------------------------------

def test_post_wlan_creds_fails_when_not_in_config_mode():
    ctrl, *_ = _make_controller(config_mode=False)
    result = ctrl.post_wlan_creds(_request({"ssid": "net", "password": "pw"}))
    assert result["result"] == "Failed"
    assert "error" in result


def test_post_wlan_creds_success_returns_url():
    connectivity = SimpleNamespace(connected=True, ipAddress="192.168.4.1")
    ctrl, _, _, wlan_config, wlan_setup, _ = _make_controller(
        config_mode=True, wlan_test_result=connectivity
    )
    result = ctrl.post_wlan_creds(_request({"ssid": "net", "password": "pw"}))
    assert result["result"] == "Success"
    assert "192.168.4.1" in result["url"]
    wlan_config.write_config.assert_called_once_with("net", "pw")


def test_post_wlan_creds_failed_connection_returns_failed():
    connectivity = SimpleNamespace(connected=False)
    ctrl, *_ = _make_controller(config_mode=True, wlan_test_result=connectivity)
    result = ctrl.post_wlan_creds(_request({"ssid": "net", "password": "pw"}))
    assert result["result"] == "Failed"


# ---------------------------------------------------------------------------
# restart
# ---------------------------------------------------------------------------

def test_post_restart_calls_system_reset():
    ctrl, *rest = _make_controller()
    system = rest[-1]
    result = ctrl.post_restart(_request())
    assert result["result"] == "Success"
    assert len(system.reset_calls) == 1
