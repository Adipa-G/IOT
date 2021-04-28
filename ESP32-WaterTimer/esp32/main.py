import time
import uasyncio
from micropython import const

import button
import display.st7789driver as displayDriver
import ioc.locator as locator
import ioc.locatorinit as locatorinit

LEFT_BUTTON_PIN = const(0)
RIGHT_BUTTON_PIN = const(35)
PIN_HIGH = const(1)
PIN_LOW = const(0)
FONT_LEFT = const(5)

locatorinit.LocatorInit()

screen = locator.screen
power_manager = locator.power_manager
io_service = locator.io_service
wlan_setup = locator.wlan_setup
server = locator.server


def connect_to_wlan_and_start_server():
    connected = wlan_setup.connect_to_configured_wlan()
    if connected == True:
        server.start()


def right_button_event():
    power_manager.reset_screen_sleep()
    screen.turn_on_screen()
    wlan_setup.start_config_mode(True)
    server.start()
    screen.draw_text(
        "r-pressed" + str(time.ticks_ms()), FONT_LEFT, 200, displayDriver.GREEN
    )


def left_button_event():
    power_manager.reset_screen_sleep()
    screen.turn_on_screen()
    wlan_setup.end_config_mode()
    connect_to_wlan_and_start_server()
    screen.draw_text(
        "l-pressed" + str(time.ticks_ms()), FONT_LEFT, 210, displayDriver.GREEN
    )


right_button = button.Button(RIGHT_BUTTON_PIN, PIN_HIGH, right_button_event)
left_button = button.Button(LEFT_BUTTON_PIN, PIN_HIGH, left_button_event)


async def main_loop():
    while True:
        await right_button.handle_event()
        await left_button.handle_event()
        await power_manager.manage_power()
        await wlan_setup.reconnect_if_dropped()
        await io_service.run_schedule()


connect_to_wlan_and_start_server()
loop = uasyncio.get_event_loop()
loop.create_task(main_loop())
loop.run_forever()
loop.close()