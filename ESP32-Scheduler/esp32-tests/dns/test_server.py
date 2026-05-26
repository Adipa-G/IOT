from unittest.mock import MagicMock
from types import SimpleNamespace

from esp_dns.server import Server


def _make_server(ip_address=None):
    wlan_setup = MagicMock()
    details = SimpleNamespace(ipAddress=ip_address)
    wlan_setup.get_config_mode_details.return_value = details

    log_service = MagicMock()
    return Server(wlan_setup, log_service), wlan_setup, log_service


# ---------------------------------------------------------------------------
# __get_ip()
# ---------------------------------------------------------------------------

def test_get_ip_returns_address_from_wlan_setup():
    """__get_ip() returns the AP IP reported by wlan_setup."""
    server, *_ = _make_server(ip_address="192.168.4.1")
    assert server._Server__get_ip() == "192.168.4.1"


def test_get_ip_falls_back_to_localhost_when_no_address():
    """When wlan_setup returns None, __get_ip() falls back to 127.0.0.1."""
    server, *_ = _make_server(ip_address=None)
    assert server._Server__get_ip() == "127.0.0.1"


def test_get_ip_is_cached_after_first_call():
    """__get_ip() only calls wlan_setup once; subsequent calls use the cache."""
    server, wlan_setup, _ = _make_server(ip_address="192.168.4.1")
    server._Server__get_ip()
    server._Server__get_ip()
    wlan_setup.get_config_mode_details.assert_called_once()


# ---------------------------------------------------------------------------
# stop()
# ---------------------------------------------------------------------------

def test_stop_closes_socket_and_clears_running():
    """stop() closes the underlying socket and sets _running to False."""
    server, *_ = _make_server()
    mock_sock = MagicMock()
    server._sock = mock_sock
    server._running = True

    server.stop()

    mock_sock.close.assert_called_once()
    assert server._running is False
