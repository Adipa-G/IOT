import machine
import uasyncio

class Button:
    def __init__(self, pin, defaultValue, event):
        self.pin = pin
        self.defaultValue = defaultValue
        self.buttonVal = defaultValue
        self.event = event
        self.pinRef = machine.Pin(pin, machine.Pin.IN)  

    async def handle_event(self):
        buttonVal = self.pinRef.value()
        if (buttonVal != self.defaultValue and self.buttonVal != buttonVal):
            self.event()
        self.buttonVal = buttonVal
        await uasyncio.sleep_ms(500)

    