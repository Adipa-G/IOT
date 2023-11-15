import machine

class Led:
    def __init__(self, pin):
        self.pin = pin

    def on(self):
        self.pin.value(1)

    def off(self):
        self.pin.value(0)
