from machine import Pin, Timer
from display import display as display
from rotary import encoder as encoder
from rotary.driver import Rotary as Rotary
import utime as time

val = 35
def rotary_changed(change):
    global val
    if change == Rotary.ROT_CW:
        val = val + 1
        disp.show_voltage(str(val) + "v")
    elif change == Rotary.ROT_CCW:
        val = val - 1
        disp.show_voltage(str(val) + "v")
    elif change == Rotary.SW_PRESS:
        print('PRESS')
    elif change == Rotary.SW_RELEASE:
        print('RELEASE')

disp = display.Display()
disp.show_voltage("35v")

encoder = encoder.Encoder()
encoder.add_handler(rotary_changed)

"TODO"
led = Pin(25, Pin.OUT)
pin2 = Pin(2, Pin.OUT)
pin3 = Pin(3, Pin.OUT)
pin4 = Pin(4, Pin.OUT)
timer = Timer()

pin2.value(1)
pin3.value(1)
pin4.value(1)

def blink(timer):
    led.toggle()

timer.init(freq=1, mode=Timer.PERIODIC, callback=blink)


