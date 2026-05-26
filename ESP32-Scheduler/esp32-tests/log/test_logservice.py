from unittest.mock import patch, mock_open, MagicMock

from log.logservice import LogService


# ---------------------------------------------------------------------------
# log() — disabled (print path)
# ---------------------------------------------------------------------------

def test_log_prints_when_logs_disabled(capsys):
    """With _enable_logs=False (default) log() writes to stdout, not a file."""
    service = LogService()
    service.log("hello world")
    out = capsys.readouterr().out
    assert "hello world" in out


# ---------------------------------------------------------------------------
# log() — enabled (file write path)
# ---------------------------------------------------------------------------

def test_log_writes_to_file_when_enabled():
    """With _enable_logs=True, message is appended to log.log."""
    service = LogService()
    service._enable_logs = True
    m = mock_open()
    with patch("builtins.open", m), patch("os.stat", return_value=[0] * 10):
        service.log("write me")
    # Find the write call on the file handle
    write_args = [c.args[0] for c in m.return_value.write.call_args_list]
    written = "".join(write_args)
    assert "write me" in written


def test_log_handles_write_error(capsys):
    """When file write raises, error is printed rather than propagated."""
    service = LogService()
    service._enable_logs = True
    with patch("builtins.open", side_effect=OSError("disk full")):
        service.log("this should not raise")
    out = capsys.readouterr().out
    assert "error writing log to log" in out


# ---------------------------------------------------------------------------
# get_logs()
# ---------------------------------------------------------------------------

def test_get_logs_returns_file_content():
    """get_logs() reads and returns the log file content."""
    service = LogService()
    m = mock_open(read_data="[2026-01-01] some entry")
    with patch("builtins.open", m), patch("os.stat", return_value=[0] * 10):
        result = service.get_logs()
    assert "some entry" in result


def test_get_logs_returns_error_string_on_read_exception():
    """When the log file cannot be read, get_logs() returns an error string."""
    service = LogService()
    with patch("builtins.open", side_effect=OSError("no file")), \
         patch("os.stat", side_effect=OSError("no file")):
        result = service.get_logs()
    assert "error" in result.lower()


# ---------------------------------------------------------------------------
# __ensure_files() rotation
# ---------------------------------------------------------------------------

def test_ensure_files_rotates_log_when_size_exceeded():
    """When log.log exceeds 10 240 bytes, it is renamed to log.bak."""
    service = LogService()
    service._enable_logs = True

    def open_side_effect(path, mode="r"):
        if path == "log.bak" and mode == "r":
            raise OSError("no bak file")
        return MagicMock()

    with patch("builtins.open", side_effect=open_side_effect), \
         patch("os.stat", return_value=[0, 0, 0, 0, 0, 0, 20_000, 0, 0, 0]), \
         patch("os.rename") as mock_rename, \
         patch("os.remove"):
        service.log("trigger rotation")

    mock_rename.assert_called_once_with("log.log", "log.bak")
