import machine
import ioc.locator as locator
import ujson


class PinController:
    def __init__(self):
        pass

    def get_pin_value(self, request, pin):
        pin = machine.Pin(int(pin), machine.Pin.OUT)
        return {"value": str(pin.value())}

    def post_pin_value(self, request, pin):
        pin = machine.Pin(int(pin), machine.Pin.OUT)
        value = request.payload["value"]
        pin.value(int(value))
        return {"result": "Success"}