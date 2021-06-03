import machine
import uasyncio


class Button:
    def __init__(self, pin, defaultValue, event):
        self._pin = pin
        self._defaultValue = defaultValue
        self._buttonVal = defaultValue
        self._event = event
        self._pinRef = machine.Pin(pin, machine.Pin.IN)

    async def handle_event(self):
        buttonVal = self._pinRef.value()
        if buttonVal != self._defaultValue and self._buttonVal != buttonVal:
            self._event()
        self._buttonVal = buttonVal
        await uasyncio.sleep_ms(500)
