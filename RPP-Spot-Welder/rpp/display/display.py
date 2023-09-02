import machine
import uos
import random
import display.st7789 as st7789
import display.fonts.vga2_8x8 as font1
import display.fonts.vga1_16x32 as font2
import display.pico_i2c_lcd as i2cLcd

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
        
        sdaPIN=machine.Pin(0)
        sclPIN=machine.Pin(1)
        i2c=machine.I2C(0,sda=sdaPIN, scl=sclPIN, freq=400000)
        devices = i2c.scan()
        if len(devices) == 0:
            print("No i2c device !")
        else:
            print('i2c devices found:',len(devices))
        
        for device in devices:
            print("Hexa address: ",hex(device))
            self._i2c1602_device = device
        
            i2c1602 = machine.I2C(0, sda=machine.Pin(0), scl=machine.Pin(1), freq=400000)
            self._i2c1602_display = i2cLcd.I2cLcd(i2c1602, self._i2c1602_device, I2C_NUM_ROWS, I2C_NUM_COLS)
        
        st7789_spi = machine.SPI(0, baudrate=40000000, polarity=1)
        self._st7789_display = st7789.ST7789(st7789_spi, DISP_WIDTH, DISP_HEIGHT,
                          reset=machine.Pin(ST7789_RES, machine.Pin.OUT),
                          dc=machine.Pin(ST7789_DC, machine.Pin.OUT),
                          xstart=0, ystart=0, rotation=1)
        self._st7789_display.fill(st7789.BLACK)
    
    def show_voltage(self, voltage):
        self._st7789_display.text(font2, "Voltage " + voltage, 10, 10)
        if self._i2c1602_display is not None:
            self._i2c1602_display.putstr("Hello from\n"+chr(0)+" test "+chr(0))
        
        
    