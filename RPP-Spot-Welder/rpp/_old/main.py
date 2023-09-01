import machine
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

from machine import I2C
from lcd_api import LcdApi
from pico_i2c_lcd import I2cLcd

I2C_ADDR     = device
I2C_NUM_ROWS = 2
I2C_NUM_COLS = 16

i2c = I2C(0, sda=machine.Pin(0), scl=machine.Pin(1), freq=400000)
lcd = I2cLcd(i2c, I2C_ADDR, I2C_NUM_ROWS, I2C_NUM_COLS)
lcd.putstr("Hello from\n"+chr(0)+" test "+chr(0))


from rotary import Rotary
import utime as time
from machine import Pin

# GPIO Pins 16 and 17 are for the encoder pins. 22 is the button press switch.
rotary = Rotary(16, 17, 18)
val = 0

def rotary_changed(change):
    global val
    if change == Rotary.ROT_CW:
        val = val + 1
        print(val)
        lcd.clear()
        lcd.putstr(str(val))
    elif change == Rotary.ROT_CCW:
        val = val - 1
        print(val)
        lcd.clear()
        lcd.putstr(str(val))
    elif change == Rotary.SW_PRESS:
        print('PRESS')
    elif change == Rotary.SW_RELEASE:
        print('RELEASE')

rotary.add_handler(rotary_changed)

while True:
    #sw = Pin(18,Pin.IN, Pin.PULL_UP)
    #print(sw.value())
    time.sleep(0.1)
    