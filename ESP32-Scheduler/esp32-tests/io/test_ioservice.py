import pytest
from unittest.mock import MagicMock

from hal.mock_hal import MockPinFactory, MockTime
from schedule.ioservice import IoService


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_config(schedules):
    return {"schedules": schedules}


def make_service(schedules, hour, minute):
    """Build an IoService with mock dependencies at a specific time."""
    config_service = MagicMock()
    config_service.read_config.return_value = make_config(schedules)

    pin_factory = MockPinFactory()
    time_provider = MockTime(hour=hour, minute=minute)
    log_service = MagicMock()

    svc = IoService(config_service, pin_factory, time_provider, log_service)
    return svc, pin_factory, config_service, log_service


def prime(svc):
    """Set the cycle counter so the next run_schedule() call triggers the schedule."""
    svc._io_cycle = 10


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestIoServiceSchedule:

    async def test_pin_turns_high_at_start_time(self):
        """Pin should be set HIGH when current time equals the schedule start time."""
        schedule = {"pin": 5, "highDurationUtc": "08:00-10:00"}
        svc, pins, _, _ = make_service([schedule], hour=8, minute=0)
        prime(svc)

        await svc.run_schedule()

        pin = pins.get_output_pin(5)
        assert pin is not None, "Output pin was never created"
        assert pin.current_value == 1

    async def test_pin_turns_low_at_end_time(self):
        """Pin should be set LOW when current time equals the schedule end time."""
        schedule = {"pin": 5, "highDurationUtc": "08:00-10:00"}
        svc, pins, _, _ = make_service([schedule], hour=10, minute=0)
        prime(svc)

        await svc.run_schedule()

        pin = pins.get_output_pin(5)
        assert pin is not None, "Output pin was never created"
        assert pin.current_value == 0

    async def test_pin_unchanged_outside_schedule_boundaries(self):
        """No pin state change when time is between start and end (not at a boundary)."""
        schedule = {"pin": 5, "highDurationUtc": "08:00-10:00"}
        svc, pins, _, _ = make_service([schedule], hour=9, minute=0)
        prime(svc)

        await svc.run_schedule()

        assert pins.get_output_pin(5) is None, "Pin state should not be changed mid-schedule"

    async def test_empty_schedule_list_does_not_touch_pins(self):
        """An empty schedules list should not create or modify any pins."""
        svc, pins, _, _ = make_service([], hour=12, minute=0)
        prime(svc)

        await svc.run_schedule()

        assert len(pins._pins) == 0, "No pins should be touched for an empty schedule"

    async def test_bad_schedule_entry_logs_error_and_continues(self):
        """A malformed schedule entry should be logged; subsequent valid schedules still run."""
        schedules = [
            {"pin": 99},  # missing "highDurationUtc" — will raise KeyError
            {"pin": 5, "highDurationUtc": "08:00-10:00"},
        ]
        svc, pins, _, log_service = make_service(schedules, hour=8, minute=0)
        prime(svc)

        await svc.run_schedule()

        # Error was logged for the bad entry
        log_service.log.assert_called_once()
        logged_message = log_service.log.call_args[0][0]
        assert "error running schedule for pin 99" in logged_message

        # Valid pin 5 was still processed
        pin = pins.get_output_pin(5)
        assert pin is not None
        assert pin.current_value == 1

    async def test_schedule_only_runs_every_ten_cycles(self):
        """Config should not be read for the first 10 calls; read on the 11th."""
        schedule = {"pin": 5, "highDurationUtc": "08:00-10:00"}
        svc, _, config_service, _ = make_service([schedule], hour=8, minute=0)

        # First 10 calls — cycle counter goes from 0 to 10; schedule NOT triggered
        for _ in range(10):
            await svc.run_schedule()

        config_service.read_config.assert_not_called()

        # 11th call — cycle counter is 10; schedule IS triggered
        await svc.run_schedule()

        config_service.read_config.assert_called_once()

    async def test_multiple_pins_controlled_independently(self):
        """Multiple schedule entries should control their respective pins independently."""
        schedules = [
            {"pin": 5, "highDurationUtc": "08:00-10:00"},  # start time for pin 5
            {"pin": 6, "highDurationUtc": "12:00-14:00"},  # not start/end for pin 6
        ]
        svc, pins, _, _ = make_service(schedules, hour=8, minute=0)
        prime(svc)

        await svc.run_schedule()

        pin5 = pins.get_output_pin(5)
        assert pin5 is not None and pin5.current_value == 1, "Pin 5 should be HIGH"
        assert pins.get_output_pin(6) is None, "Pin 6 should not be touched"
