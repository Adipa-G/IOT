import machine
from micropython import const
import utime
import uasyncio

import ioc.locator as locator

IO_CYCLES = const(10)
PIN_HIGH = const(1)
PIN_LOW = const(0)


class IoService:
    def __init__(self):
        self.io_config_service = locator.io_config_service
        self.io_cycle = 0
        self.log_service = locator.log_service

    def get_pin_state(self, pin_no):
        pin = machine.Pin(pin_no, machine.Pin.IN)
        return pin.value()

    def set_pin_state(self, pin_no, is_high):
        pin = machine.Pin(pin_no, machine.Pin.OUT)
        if is_high == True:
            pin.value(PIN_HIGH)
        else:
            pin.value(PIN_LOW)

    async def run_schedule(self):
        if self.io_cycle == IO_CYCLES:
            self.log_service.log("running io cycle")
            self.io_cycle = 0
            config = self.io_config_service.read_config()
            for schedule in config["schedules"]:
                pinStr = "Unknown"
                try:
                    pinStr = str(schedule["pin"])
                    self.__run_schedule(schedule["pin"], schedule["highDurationUtc"])
                except Exception as e:
                    self.log_service.log(
                        "error running schedule for pin " + pinStr + " " + str(e)
                    )

        self.io_cycle = self.io_cycle + 1
        await uasyncio.sleep_ms(1000)

    def __run_schedule(self, pin, duration):
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

        if current_minute_of_day == start_minute_of_day:
            self.set_pin_state(pin, True)
        elif current_minute_of_day == end_minute_of_day:
            self.set_pin_state(pin, False)
