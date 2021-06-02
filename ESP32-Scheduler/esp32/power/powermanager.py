import machine
import network
import utime
import time
import uasyncio
from micropython import const

import ioc.locator as locator

POWER_MANAGEMENT_CYCLES = const(10)


class PowerManager:
    def __init__(self):
        self.screen_off = 0
        self.power_cycle = 0
        self.battery_voltage = locator.battery_voltage
        self.log_service = locator.log_service
        self.power_config_service = locator.power_config_service
        self.screen = locator.screen
        self.power_config = self.power_config_service.read_config()

    async def manage_power(self):
        voltage = self.battery_voltage.get_voltage()
        freq = machine.freq()

        self.__manage_screen()
        if self.power_cycle == POWER_MANAGEMENT_CYCLES:
            self.log_service.log("running power management")
            try:
                self.__adjust_cpu_frequency(voltage, freq)
                self.__sleep_when_low_power(voltage)
                self.power_cycle = 0
            except Exception as e:
                self.log_service.log("error running power management " + str(e))

        self.power_cycle = self.power_cycle + 1
        await uasyncio.sleep_ms(1000)

    def reset_screen_sleep(self):
        self.screen_off = 0

    def __manage_screen(self):
        screen_on_cycles = self.power_config["screenOnSeconds"]
        if self.screen_off < screen_on_cycles + 1:
            if self.screen_off == screen_on_cycles:
                self.screen.turn_off_screen()
                self.log_service.log("turning off the screen")
            self.screen_off = self.screen_off + 1

    def __adjust_cpu_frequency(self, voltage, freq):
        if voltage > self.power_config["highBattery.minVoltage"]:
            target_freq = self.power_config["highBattery.cpuFreqMHz"] * 1000000
            if freq != target_freq:
                self.log_service.log("high power")
                machine.freq(target_freq)
        elif voltage > self.power_config["mediumBattery.minVoltage"]:
            target_freq = self.power_config["mediumBattery.cpuFreqMHz"] * 1000000
            if freq != target_freq:
                self.log_service.log("med power")
                machine.freq(target_freq)
        else:
            target_freq = self.power_config["lowBattery.cpuFreqMHz"] * 1000000
            if freq != target_freq:
                self.log_service.log("low power")
                machine.freq(target_freq)

    def __sleep_when_low_power(self, voltage):
        if voltage < self.power_config["highBattery.minVoltage"]:
            self.__sleep_for_duration(
                self.power_config["mediumBattery.deepSleepDurationUtc"]
            )
        elif voltage < self.power_config["mediumBattery.minVoltage"]:
            self.__sleep_for_duration(
                self.power_config["lowBattery.deepSleepDurationUtc"]
            )
        elif voltage < self.power_config["lowBattery.minVoltage"]:
            self.__deep_sleep(
                self.power_config["lowBattery.continousDeepSleepHours"] * 60 * 60 * 1000
            )

    def __sleep_for_duration(self, duration):
        tokens = duration.replace("-", ":").split(":")
        start_hour = int(tokens[0])
        start_minute = int(tokens[1])
        end_hour = int(tokens[2])
        end_minute = int(tokens[3])

        localtime = utime.localtime()
        hour = localtime[3]
        minute = localtime[4]

        current_minute_of_day = hour * 60 + minute
        start_minute_of_day = start_hour * 60 + start_minute
        end_minute_of_day = end_hour * 60 + end_minute

        if end_minute_of_day < start_minute_of_day:
            end_minute_of_day = end_minute_of_day + 24 * 60
            if current_minute_of_day < end_minute_of_day:
                start_minute_of_day = start_minute_of_day + 24 * 60

        if (
            current_minute_of_day >= start_minute_of_day
            and current_minute_of_day < end_minute_of_day
        ):
            time_to_sleep = (end_minute_of_day - current_minute_of_day) * 60000
            self.log_service.log("sleeping " + str(time_to_sleep))
            self.__deep_sleep(time_to_sleep)

    def __deep_sleep(self, duration):
        sta_if = network.WLAN(network.STA_IF)
        ap_if = network.WLAN(network.AP_IF)
        screen = locator.screen
        web_server = locator.web_server
        dns_server = locator.dns_server

        web_server.stop()
        dns_server.stop()
        screen.turn_off_screen()

        sta_if.active(False)
        ap_if.active(False)
        time.sleep_ms(3000)

        machine.deepsleep(duration)
