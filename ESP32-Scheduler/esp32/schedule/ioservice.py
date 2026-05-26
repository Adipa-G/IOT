from micropython import const
import uasyncio

IO_CYCLES = const(10)
PIN_HIGH = const(1)
PIN_LOW = const(0)


class IoService:
    def __init__(self, io_config_service, pin_factory, time_provider, log_service):
        self._io_config_service = io_config_service
        self._pin_factory = pin_factory
        self._time = time_provider
        self._io_cycle = 0
        self._log_service = log_service

    def get_pin_state(self, pin_no):
        pin = self._pin_factory.make_input_pin(pin_no)
        return pin.value()

    def set_pin_state(self, pin_no, is_high):
        pin = self._pin_factory.make_output_pin(pin_no)
        if is_high == True:
            pin.value(PIN_HIGH)
        else:
            pin.value(PIN_LOW)

    async def run_schedule(self):
        if self._io_cycle == IO_CYCLES:
            self._io_cycle = 0
            config = self._io_config_service.read_config()
            for schedule in config["schedules"]:
                pinStr = "Unknown"
                try:
                    pinStr = str(schedule["pin"])
                    self.__run_schedule(schedule["pin"], schedule["highDurationUtc"])
                except Exception as e:
                    self._log_service.log(
                        "error running schedule for pin " + pinStr + " " + str(e)
                    )

        self._io_cycle = self._io_cycle + 1
        await uasyncio.sleep_ms(1000)

    def __run_schedule(self, pin, duration):
        tokens = duration.replace("-", ":").split(":")
        start_hour = int(tokens[0])
        start_minute = int(tokens[1])
        end_hour = int(tokens[2])
        end_minute = int(tokens[3])

        localtime = self._time.localtime()
        hour = localtime[3]
        minute = localtime[4]

        current_minute_of_day = hour * 60 + minute
        start_minute_of_day = start_hour * 60 + start_minute
        end_minute_of_day = end_hour * 60 + end_minute

        if current_minute_of_day == start_minute_of_day:
            self.set_pin_state(pin, True)
        elif current_minute_of_day == end_minute_of_day:
            self.set_pin_state(pin, False)
