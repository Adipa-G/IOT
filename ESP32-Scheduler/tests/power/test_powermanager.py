from unittest.mock import MagicMock

from power.powermanager import PowerManager
from tests.hal.mock_hal import MockSystem, MockNetwork, MockTime


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_power_config(**overrides):
    defaults = {
        "screenOnSeconds": 5,
        "highBattery.minVoltage": 4.0,
        "highBattery.cpuFreqMHz": 240,
        "mediumBattery.minVoltage": 3.5,
        "mediumBattery.cpuFreqMHz": 160,
        "lowBattery.cpuFreqMHz": 80,
        "lowBattery.minVoltage": 3.0,
        "mediumBattery.deepSleepDurationUtc": "12:00-14:00",
        "lowBattery.deepSleepDurationUtc": "10:00-14:00",
        "extraLowBattery.continousDeepSleepHours": 12,
    }
    defaults.update(overrides)
    return defaults


def make_service(voltage=4.5, cpu_freq=80_000_000, power_config=None, hour=9, minute=0):
    if power_config is None:
        power_config = make_power_config()

    battery = MagicMock()
    battery.get_voltage.return_value = voltage

    power_config_service = MagicMock()
    power_config_service.read_config.return_value = power_config

    screen = MagicMock()
    system = MockSystem(cpu_freq=cpu_freq)
    time_provider = MockTime(hour=hour, minute=minute)
    wlan_sta = MockNetwork()
    wlan_ap = MockNetwork()
    log = MagicMock()

    svc = PowerManager(
        battery, power_config_service, screen, system, time_provider, wlan_sta, wlan_ap, log
    )
    return svc, screen, system, wlan_sta, wlan_ap, log


def prime(svc):
    """Prime the cycle counter so the next manage_power() triggers adjustments."""
    svc._power_cycle = 10


# ---------------------------------------------------------------------------
# Tests: voltage gate
# ---------------------------------------------------------------------------

class TestManagePowerVoltageGate:

    async def test_no_action_when_voltage_is_zero(self):
        """No CPU or sleep adjustments when battery returns 0."""
        svc, screen, system, _, _, _ = make_service(voltage=0)
        prime(svc)

        await svc.manage_power()

        assert system.set_freq_calls == []
        assert system.deep_sleep_calls == []
        screen.turn_off_screen.assert_not_called()

    async def test_adjustments_only_trigger_on_cycle_10(self):
        """set_cpu_freq should not be called for the first 10 calls, only on the 11th."""
        svc, _, system, _, _, _ = make_service(voltage=4.5)

        for _ in range(10):
            await svc.manage_power()

        assert system.set_freq_calls == [], "set_cpu_freq fired too early"

        await svc.manage_power()  # 11th call — cycle hits 10

        assert len(system.set_freq_calls) == 1


# ---------------------------------------------------------------------------
# Tests: CPU frequency adjustment
# ---------------------------------------------------------------------------

class TestCpuFrequencyAdjustment:

    async def test_high_voltage_sets_high_cpu_freq(self):
        """Voltage above highBattery.minVoltage (4.0) → target 240 MHz."""
        svc, _, system, _, _, _ = make_service(voltage=4.5, cpu_freq=80_000_000)
        prime(svc)

        await svc.manage_power()

        assert system.set_freq_calls == [240_000_000]

    async def test_medium_voltage_sets_medium_cpu_freq(self):
        """Voltage between 3.5 and 4.0 → target 160 MHz."""
        svc, _, system, _, _, _ = make_service(voltage=3.7, cpu_freq=80_000_000)
        prime(svc)

        await svc.manage_power()

        assert system.set_freq_calls == [160_000_000]

    async def test_low_voltage_sets_low_cpu_freq(self):
        """Voltage below mediumBattery.minVoltage (3.5) but above lowBattery (3.0) → 80 MHz."""
        svc, _, system, _, _, _ = make_service(voltage=3.2, cpu_freq=240_000_000)
        prime(svc)

        await svc.manage_power()

        assert system.set_freq_calls == [80_000_000]

    async def test_cpu_freq_unchanged_when_already_at_target(self):
        """No set_cpu_freq call or log when current freq already matches the target."""
        svc, _, system, _, _, log = make_service(voltage=4.5, cpu_freq=240_000_000)
        prime(svc)

        await svc.manage_power()

        assert system.set_freq_calls == []
        log.log.assert_not_called()


# ---------------------------------------------------------------------------
# Tests: screen timeout
# ---------------------------------------------------------------------------

class TestScreenTimeout:

    async def test_screen_turns_off_at_timeout(self):
        """Screen should be turned off after screenOnSeconds (5) cycles + 1."""
        svc, screen, _, _, _, _ = make_service(voltage=4.5)

        # 6 calls: _screen_off reaches 5 on call 6 and turn_off_screen fires
        for _ in range(6):
            await svc.manage_power()

        screen.turn_off_screen.assert_called_once()

    async def test_screen_does_not_turn_off_before_timeout(self):
        """Screen should remain on for the first 5 cycles."""
        svc, screen, _, _, _, _ = make_service(voltage=4.5)

        for _ in range(5):
            await svc.manage_power()

        screen.turn_off_screen.assert_not_called()

    async def test_reset_screen_sleep_delays_screen_off(self):
        """reset_screen_sleep() resets the counter, extending screen-on time."""
        svc, screen, _, _, _, _ = make_service(voltage=4.5)

        for _ in range(4):
            await svc.manage_power()

        svc.reset_screen_sleep()  # counter reset to 0

        for _ in range(5):  # 5 more calls — still below timeout
            await svc.manage_power()

        screen.turn_off_screen.assert_not_called()


# ---------------------------------------------------------------------------
# Tests: sleep scheduling
# ---------------------------------------------------------------------------

class TestSleepScheduling:

    async def test_deep_sleep_triggered_during_sleep_window(self):
        """Low-ish voltage in sleep window → deep_sleep called with time remaining."""
        # voltage=3.2 → lowBattery sleep range, duration "10:00-14:00"
        # current time = 12:00 → inside window; time_to_sleep = (14*60 - 12*60)*60000
        svc, _, system, _, _, _ = make_service(voltage=3.2, hour=12, minute=0)
        prime(svc)

        await svc.manage_power()

        assert len(system.deep_sleep_calls) == 1
        expected_ms = (14 * 60 - 12 * 60) * 60000
        assert system.deep_sleep_calls[0] == expected_ms

    async def test_no_deep_sleep_outside_sleep_window(self):
        """When current time is outside the sleep window, deep_sleep must not be called."""
        svc, _, system, _, _, _ = make_service(voltage=3.2, hour=15, minute=0)
        prime(svc)

        await svc.manage_power()

        assert system.deep_sleep_calls == []

    async def test_extra_low_battery_always_deep_sleeps(self):
        """Voltage below lowBattery.minVoltage (3.0) triggers continuous deep sleep."""
        cfg = make_power_config(**{"extraLowBattery.continousDeepSleepHours": 12})
        svc, _, system, _, _, _ = make_service(voltage=2.5, power_config=cfg)
        prime(svc)

        await svc.manage_power()

        assert len(system.deep_sleep_calls) == 1
        assert system.deep_sleep_calls[0] == 12 * 60 * 60 * 1000


# ---------------------------------------------------------------------------
# Tests: deep sleep teardown
# ---------------------------------------------------------------------------

class TestDeepSleepTeardown:

    async def test_deep_sleep_deactivates_both_wlan_interfaces(self):
        """Both wlan_sta and wlan_ap must be deactivated before deep sleep."""
        svc, _, _, wlan_sta, wlan_ap, _ = make_service(voltage=2.5)
        prime(svc)

        await svc.manage_power()

        assert False in wlan_sta.active_calls, "wlan_sta was not deactivated"
        assert False in wlan_ap.active_calls, "wlan_ap was not deactivated"

    async def test_deep_sleep_calls_stop_on_servers_when_set(self):
        """web_server.stop() and dns_server.stop() must be called if server refs are set."""
        svc, _, _, _, _, _ = make_service(voltage=2.5)
        web_server = MagicMock()
        dns_server = MagicMock()
        svc.set_server_refs(web_server, dns_server)
        prime(svc)

        await svc.manage_power()

        web_server.stop.assert_called_once()
        dns_server.stop.assert_called_once()

    async def test_deep_sleep_does_not_crash_without_server_refs(self):
        """__deep_sleep must not crash when server refs have not been set."""
        svc, _, system, _, _, _ = make_service(voltage=2.5)
        # no set_server_refs call
        prime(svc)

        await svc.manage_power()  # must not raise

        assert len(system.deep_sleep_calls) == 1
