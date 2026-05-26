from unittest.mock import MagicMock
from types import SimpleNamespace

from wlan.wlansetup import WLANSetup, WIFI_RECONNECT_CYCLES
from hal.mock_hal import MockNetwork, MockSystem


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_config(ssid="mynet", password="pass123"):
    cfg = SimpleNamespace(ssid=ssid, password=password)
    return cfg


def _make_wlan_setup(
    wlan_config=None,
    screen=None,
    wlan_sta=None,
    wlan_ap=None,
    system=None,
    ntp_sync=None,
    log_service=None,
):
    if wlan_config is None:
        wlan_config = MagicMock()
        wlan_config.read_config.return_value = _make_config()
    if screen is None:
        screen = MagicMock()
    if wlan_sta is None:
        wlan_sta = MockNetwork(connected=True)
    if wlan_ap is None:
        wlan_ap = MockNetwork()
    if system is None:
        system = MockSystem()
    if ntp_sync is None:
        ntp_sync = MagicMock()
    if log_service is None:
        log_service = MagicMock()
    return WLANSetup(wlan_config, screen, wlan_sta, wlan_ap, system, ntp_sync, log_service)


# ---------------------------------------------------------------------------
# connect_to_configured_wlan
# ---------------------------------------------------------------------------

def test_connect_success():
    """When config exists and STA connects, returns True and calls ntp_sync."""
    ntp_sync = MagicMock()
    log_service = MagicMock()
    wlan_sta = MockNetwork(connected=True)

    setup = _make_wlan_setup(wlan_sta=wlan_sta, ntp_sync=ntp_sync, log_service=log_service)
    result = setup.connect_to_configured_wlan()

    assert result is True
    ntp_sync.assert_called_once()
    log_service.log.assert_called()


def test_connect_success_activates_sta_and_deactivates_ap():
    """STA is activated and AP is deactivated during connection attempt."""
    wlan_sta = MockNetwork(connected=True)
    wlan_ap = MockNetwork(active=True)

    setup = _make_wlan_setup(wlan_sta=wlan_sta, wlan_ap=wlan_ap)
    setup.connect_to_configured_wlan()

    assert True in wlan_sta.active_calls
    assert False in wlan_ap.active_calls


def test_connect_no_config_returns_false():
    """When no config exists, returns False without touching hardware."""
    wlan_config = MagicMock()
    wlan_config.read_config.return_value = None
    wlan_sta = MockNetwork()

    setup = _make_wlan_setup(wlan_config=wlan_config, wlan_sta=wlan_sta)
    result = setup.connect_to_configured_wlan()

    assert result is False
    assert not wlan_sta.connect_calls


def test_connect_failure_deactivates_sta_and_returns_false():
    """When STA fails to connect, deactivates STA and returns False."""
    wlan_sta = MockNetwork(connected=False)

    setup = _make_wlan_setup(wlan_sta=wlan_sta)
    result = setup.connect_to_configured_wlan()

    assert result is False
    assert False in wlan_sta.active_calls


def test_connect_ntp_fails_calls_system_reset():
    """When ntp_sync raises, system.reset() is called instead of propagating."""
    ntp_sync = MagicMock(side_effect=OSError("ntp timeout"))
    system = MockSystem()
    wlan_sta = MockNetwork(connected=True)

    setup = _make_wlan_setup(wlan_sta=wlan_sta, system=system, ntp_sync=ntp_sync)
    setup.connect_to_configured_wlan()

    assert len(system.reset_calls) == 1


# ---------------------------------------------------------------------------
# start_config_mode
# ---------------------------------------------------------------------------

def test_start_config_mode_force_starts_ap():
    """force=True with no active AP configures AP and sets configMode=True."""
    wlan_config = MagicMock()
    wlan_config.read_config.return_value = _make_config()
    wlan_ap = MockNetwork(active=False)

    setup = _make_wlan_setup(wlan_config=wlan_config, wlan_ap=wlan_ap)
    setup.start_config_mode(force=True)

    assert setup.configMode is True
    assert True in wlan_ap.active_calls
    assert len(wlan_ap.config_calls) == 1


def test_start_config_mode_no_config_starts_ap():
    """force=False but no saved config also starts AP."""
    wlan_config = MagicMock()
    wlan_config.read_config.return_value = None
    wlan_ap = MockNetwork(active=False)

    setup = _make_wlan_setup(wlan_config=wlan_config, wlan_ap=wlan_ap)
    setup.start_config_mode(force=False)

    assert setup.configMode is True
    assert len(wlan_ap.config_calls) == 1


def test_start_config_mode_already_in_config_mode_skips():
    """If configMode already True, method returns immediately."""
    wlan_ap = MockNetwork(active=False)

    setup = _make_wlan_setup(wlan_ap=wlan_ap)
    setup.configMode = True
    setup.start_config_mode(force=True)

    assert not wlan_ap.config_calls


def test_start_config_mode_ap_already_active_returns_early():
    """If AP is already active when trying to start config mode, no config call is made."""
    wlan_config = MagicMock()
    wlan_config.read_config.return_value = None
    wlan_ap = MockNetwork(active=True)  # already active

    setup = _make_wlan_setup(wlan_config=wlan_config, wlan_ap=wlan_ap)
    setup.start_config_mode(force=True)


def test_start_config_mode_ap_name_is_device_specific():
    """AP SSID is derived from device MAC (last 3 bytes as hex)."""
    wlan_config = MagicMock()
    wlan_config.read_config.return_value = None
    wlan_ap = MockNetwork(active=False)

    setup = _make_wlan_setup(wlan_config=wlan_config, wlan_ap=wlan_ap)
    setup.start_config_mode(force=True)

    _, kwargs = wlan_ap.config_calls[0]
    # mock MAC is aa:bb:cc:dd:ee:ff → suffix = 'ddeeff'
    assert kwargs['essid'] == 'esp-setup-ddeeff'


def test_start_config_mode_ap_password_is_device_specific():
    """AP password is derived from MAC suffix in XXX-YYY format, easy to type."""
    wlan_config = MagicMock()
    wlan_config.read_config.return_value = None
    wlan_ap = MockNetwork(active=False)

    setup = _make_wlan_setup(wlan_config=wlan_config, wlan_ap=wlan_ap)
    setup.start_config_mode(force=True)

    _, kwargs = wlan_ap.config_calls[0]
    # suffix 'ddeeff' → password 'ccdd-eeff'
    assert kwargs['password'] == 'ccdd-eeff'


# ---------------------------------------------------------------------------
# end_config_mode
# ---------------------------------------------------------------------------

def test_end_config_mode_deactivates_ap_and_clears_flag():
    """end_config_mode deactivates AP and sets configMode=False."""
    wlan_ap = MockNetwork()

    setup = _make_wlan_setup(wlan_ap=wlan_ap)
    setup.configMode = True
    setup.end_config_mode()

    assert setup.configMode is False
    assert False in wlan_ap.active_calls


# ---------------------------------------------------------------------------
# get_config_mode_details
# ---------------------------------------------------------------------------

def test_get_config_mode_details_returns_ip_when_active():
    """Returns IP when configMode=True and AP is active."""
    wlan_ap = MockNetwork(active=True)

    setup = _make_wlan_setup(wlan_ap=wlan_ap)
    setup.configMode = True
    details = setup.get_config_mode_details()

    assert details.ipAddress == "192.168.4.1"


def test_get_config_mode_details_returns_none_when_not_in_config_mode():
    """Returns None IP when configMode=False."""
    setup = _make_wlan_setup()
    setup.configMode = False
    details = setup.get_config_mode_details()

    assert details.ipAddress is None


# ---------------------------------------------------------------------------
# reconnect_if_dropped
# ---------------------------------------------------------------------------

async def test_reconnect_skips_in_config_mode():
    """reconnect_if_dropped returns early when configMode=True."""
    wlan_sta = MockNetwork(connected=False)
    log_service = MagicMock()

    setup = _make_wlan_setup(wlan_sta=wlan_sta, log_service=log_service)
    setup.configMode = True
    await setup.reconnect_if_dropped()

    log_service.log.assert_not_called()


async def test_reconnect_triggered_when_cycle_reached_and_disconnected():
    """After WIFI_RECONNECT_CYCLES, if STA disconnected, reconnect is attempted."""
    wlan_config = MagicMock()
    wlan_config.read_config.return_value = _make_config()
    wlan_sta = MockNetwork(connected=False)
    log_service = MagicMock()

    setup = _make_wlan_setup(wlan_config=wlan_config, wlan_sta=wlan_sta, log_service=log_service)
    setup._wifi_cycle = WIFI_RECONNECT_CYCLES

    await setup.reconnect_if_dropped()

    log_service.log.assert_any_call("trying wifi re-connect")


async def test_reconnect_skipped_when_still_connected():
    """At WIFI_RECONNECT_CYCLES, if STA is still connected, no reconnect log."""
    wlan_sta = MockNetwork(connected=True)
    log_service = MagicMock()

    setup = _make_wlan_setup(wlan_sta=wlan_sta, log_service=log_service)
    setup._wifi_cycle = WIFI_RECONNECT_CYCLES

    await setup.reconnect_if_dropped()

    calls = [str(c) for c in log_service.log.call_args_list]
    assert not any("re-connect" in c for c in calls)


async def test_reconnect_cycle_increments():
    """_wifi_cycle increments on each call."""
    setup = _make_wlan_setup()
    setup._wifi_cycle = 0

    await setup.reconnect_if_dropped()

    assert setup._wifi_cycle == 1


# ---------------------------------------------------------------------------
# test_wlan_config
# ---------------------------------------------------------------------------

def test_test_wlan_config_success():
    """test_wlan_config returns result.connected=True when STA connects."""
    wlan_config = MagicMock()
    wlan_config.read_config.return_value = _make_config()
    wlan_sta = MockNetwork(connected=True)

    setup = _make_wlan_setup(wlan_config=wlan_config, wlan_sta=wlan_sta)
    result = setup.test_wlan_config()

    assert result.connected is True
    assert result.ipAddress == "192.168.4.1"


def test_test_wlan_config_no_config():
    """test_wlan_config returns result.connected=False when no config exists."""
    wlan_config = MagicMock()
    wlan_config.read_config.return_value = None

    setup = _make_wlan_setup(wlan_config=wlan_config)
    result = setup.test_wlan_config()

    assert result.connected is False
