from unittest.mock import MagicMock
from types import SimpleNamespace

from web.apiservice import APIService


def _make_service():
    health = MagicMock(spec=["get_status", "get_logs"])
    health.get_status.return_value = {"healthy": True}
    health.get_logs.return_value = {"logs": ""}

    setup = MagicMock()
    setup.get_io_config.return_value = {"schedules": []}

    pin = MagicMock()
    pin.get_pin_value.return_value = {"value": "1"}

    service = APIService({"health": health, "setup": setup, "pin": pin})
    return service, health, setup, pin


def _request(method, path, payload=None):
    return SimpleNamespace(method=method, path=path, payload=payload or {})


def test_routes_get_request_to_correct_controller_method():
    """GET /api/health/status dispatches to health.get_status."""
    service, health, *_ = _make_service()
    result = service.handle(_request("GET", "/api/health/status"))
    assert result["status"] == "200 OK"
    assert result["result"] == {"healthy": True}
    health.get_status.assert_called_once()


def test_returns_404_for_unknown_controller():
    """Unknown controller name returns 404."""
    service, *_ = _make_service()
    result = service.handle(_request("GET", "/api/unknown/action"))
    assert result["status"] == "404 Not Found"
    assert result["result"] is None


def test_returns_404_for_unknown_method():
    """Known controller but missing method returns 404."""
    service, *_ = _make_service()
    result = service.handle(_request("GET", "/api/health/nonexistent"))
    assert result["status"] == "404 Not Found"
