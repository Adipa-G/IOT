import machine
from micropython import const

import display.st7789driver as displayDriver

BACKLIGHT_PIN = const(4)
SPI_CLOCK_PIN = const(18)
SPI_MOSI_PIN = const(19)
PIN_HIGH = const(1)
PIN_LOW = const(0)

FONT_LEFT = const(5)

class Screen:
    def __init__(self):
        self.screen = None

    def turn_on_screen(self):
        self.spi = machine.SPI(
            1,
            baudrate=20000000,
            polarity=1,
            phase=1,
            sck=machine.Pin(SPI_CLOCK_PIN),
            mosi=machine.Pin(SPI_MOSI_PIN))
        
        self.screen = displayDriver.ST7789(
            self.spi, 135, 240,
            reset=machine.Pin(23, machine.Pin.OUT),
            cs=machine.Pin(5, machine.Pin.OUT),
            dc=machine.Pin(16, machine.Pin.OUT))

        backlight = machine.Pin(BACKLIGHT_PIN, machine.Pin.OUT)
        backlight.value(PIN_HIGH)

    def turn_off_screen(self):
        if (self.screen == None):
            return

        backlight = machine.Pin(BACKLIGHT_PIN, machine.Pin.OUT)
        backlight.value(PIN_LOW)
        self.screen.soft_reset()
        self.spi.deinit()
        self.spi = None
        self.screen = None

    def reset_screen(self):
        if (self.screen == None):
            return

        self.screen.soft_reset()
        self.screen.init()
        self.screen.hline(0,0,135,displayDriver.YELLOW)
        self.screen.vline(0,0,240,displayDriver.YELLOW)
        self.screen.vline(134,0,240,displayDriver.YELLOW)
        self.screen.hline(0,239,135,displayDriver.YELLOW)
    
    def draw_text(self, text, x, y, colour, background = displayDriver.BLACK):
        if (self.screen == None):
            return

        self.screen.draw_text(text, x, y, colour, background)