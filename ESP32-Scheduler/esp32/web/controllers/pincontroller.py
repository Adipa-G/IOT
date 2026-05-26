class PinController:
    def __init__(self, pin_factory):
        self._pin_factory = pin_factory

    def get_pin_value(self, request, pin):
        p = self._pin_factory.make_output_pin(int(pin))
        return {"value": str(p.value())}

    def post_pin_value(self, request, pin):
        p = self._pin_factory.make_output_pin(int(pin))
        value = request.payload["value"]
        p.value(int(value))
        return {"result": "Success"}