import machine
import uos
import random
import display.st7789 as st7789
import display.fonts.vga2_8x8 as font1
import display.fonts.vga1_16x32 as font2

from display.st7789 import ST7789 as ST7789
from display.pico_i2c_lcd import I2cLcd as I2cLcd

I2C_1602_SDA = 0
I2C_1602_SCL = 1
I2C_NUM_ROWS = 2
I2C_NUM_COLS = 16

ST7789_SPI_SCK=18
ST7789_SPI_MOSI=19
ST7789_SPI_MISO=16
ST7789_RES = 14
ST7789_DC  = 15
DISP_WIDTH = 320
DISP_HEIGHT = 240
CENTER_Y = int(DISP_WIDTH/2)
CENTER_X = int(DISP_HEIGHT/2)

class Display():
    def __init__(self):
        self._i2c1602_display = None
        i2c1602 = machine.I2C(0, sda=machine.Pin(I2C_1602_SDA), scl=machine.Pin(I2C_1602_SCL), freq=400000)
        devices = i2c1602.scan()
        if len(devices) > 0:
            self._i2c1602_display = I2cLcd(i2c1602, 0x27, I2C_NUM_ROWS, I2C_NUM_COLS)
       
        st7789_spi = machine.SPI(0, baudrate=40000000, polarity=1)
        self._st7789_display = ST7789(st7789_spi, DISP_WIDTH, DISP_HEIGHT,
                          reset=machine.Pin(ST7789_RES, machine.Pin.OUT),
                          dc=machine.Pin(ST7789_DC, machine.Pin.OUT),
                          xstart=0, ystart=0, rotation=1)
        self._st7789_display.fill(st7789.BLACK)
    
    def show_voltage(self, voltage):
        self._st7789_display.text(font2, "Voltage " + voltage, 10, 10)
        if self._i2c1602_display is not None:
            self._i2c1602_display.clear()
            self._i2c1602_display.putstr("Voltage " + voltage)
        
        
    