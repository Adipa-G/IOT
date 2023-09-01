from machine import Pin, Timer
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
