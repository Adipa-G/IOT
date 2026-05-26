import asyncio
from unittest.mock import MagicMock, mock_open, patch

import ioc.locator as locator
from web.server import Server


class _Reader:
    def __init__(self, payload):
        self._payload = payload
        self._read = False

    async def read(self, _size):
        if self._read:
            return b""
        self._read = True
        return self._payload


class _Writer:
    def __init__(self):
        self.writes = []
        self.closed = False

    async def awrite(self, data):
        self.writes.append(data)

    async def wait_closed(self):
        self.closed = True


def _joined_output(writer):
    parts = []
    for item in writer.writes:
        if isinstance(item, bytes):
            parts.append(item.decode("utf8"))
        else:
            parts.append(item)
    return "".join(parts)


def _make_server():
    locator.api_service = MagicMock()
    locator.log_service = MagicMock()
    return Server("/pub"), locator.log_service


def _run(handler):
    return asyncio.run(handler)


def test_probe_path_serves_portal_page_when_missing():
    server, log_service = _make_server()
    reader = _Reader(b"GET /generate_204 HTTP/1.1\r\nHost: test\r\n\r\n")
    writer = _Writer()

    with patch("builtins.open", side_effect=OSError("missing")):
        _run(server._Server__request_handler(reader, writer))

    response = _joined_output(writer)
    assert "HTTP/1.0 200 OK\r\n" in response
    assert "Captive portal" in response
    assert writer.closed is True
    log_service.log.assert_called_once()


def test_unknown_html_path_serves_portal_page_when_missing():
    server, _ = _make_server()
    reader = _Reader(b"GET /hotspot-detect.html HTTP/1.1\r\nHost: test\r\n\r\n")
    writer = _Writer()

    with patch("builtins.open", side_effect=OSError("missing")):
        _run(server._Server__request_handler(reader, writer))

    response = _joined_output(writer)
    assert "HTTP/1.0 200 OK\r\n" in response
    assert "Captive portal" in response


def test_missing_static_asset_returns_404_not_redirect():
    server, _ = _make_server()
    reader = _Reader(b"GET /app.css HTTP/1.1\r\nHost: test\r\n\r\n")
    writer = _Writer()

    with patch("builtins.open", side_effect=OSError("missing")):
        _run(server._Server__request_handler(reader, writer))

    response = _joined_output(writer)
    assert "HTTP/1.0 404 Not Found\r\n" in response
    assert "Location: /index.html" not in response


def test_options_response_uses_http_compliant_status_line():
    server, _ = _make_server()
    reader = _Reader(b"OPTIONS /api/setup/wlan_creds HTTP/1.1\r\nHost: test\r\n\r\n")
    writer = _Writer()

    _run(server._Server__request_handler(reader, writer))

    response = _joined_output(writer)
    assert response.startswith("HTTP/1.0 204 No Content\r\n")


def test_root_serves_index_html():
    server, _ = _make_server()
    reader = _Reader(b"GET / HTTP/1.1\r\nHost: test\r\n\r\n")
    writer = _Writer()

    mocked_file = mock_open(read_data=b"<html>ok</html>")
    with patch("builtins.open", mocked_file):
        _run(server._Server__request_handler(reader, writer))

    response = _joined_output(writer)
    assert "HTTP/1.0 200 OK\r\n" in response
    assert "Content-Type: text/html\r\n" in response
    assert "<html>ok</html>" in response