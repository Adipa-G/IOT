import rotary.driver as driver

class Encoder:
    def __init__(self):
        self.driver = driver.Rotary(22,20,21)
        
    def add_handler(self, handler):
        self.driver.add_handler(handler)
        