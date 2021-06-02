import network
import random
import machine
import time
import uasyncio
from ntptime import settime
from micropython import const

import display.st7789driver as displayDriver
import ioc.locator as locator

FONT_LEFT = const(5)
WIFI_RECONNECT_CYCLES = const(300)


class WLANSetup:
    def __init__(self):
        self.configMode = False
        self.wifi_cycle = 0
        self.wlan_config = locator.wlan_config
        self.screen = locator.screen
        self.log_service = locator.log_service

    def start_config_mode(self, force):
        if self.configMode == True:
            return

        configValue = self.wlan_config.read_config()
        if force == True or configValue == None:
            wifiName = "net_" + str(random.getrandbits(20))
            wifiPass = str(random.getrandbits(25))

            ap = network.WLAN(network.AP_IF)
            if ap.active() == True:
                return

            ap.active(True)

            ap.config(
                essid=wifiName, password=wifiPass, authmode=4
            )  # authmode=1 == no pass
            result = type("", (), {})()
            result.ssid = wifiName
            result.password = wifiPass
            result.ipAddress = ap.ifconfig()[0]
            self.__print_wifi_setup_details(result)
            self.configMode = True

    def get_config_mode_details(self):
        result = type("", (), {})()
        ap = network.WLAN(network.AP_IF)

        if self.configMode == True and ap.active() == True:
            result.ipAddress = ap.ifconfig()[0]
        else:
            result.ipAddress = None
        return result

    def end_config_mode(self):
        ap = network.WLAN(network.AP_IF)
        ap.active(False)
        self.configMode = False

    def connect_to_configured_wlan(self):
        sta_if = network.WLAN(network.STA_IF)
        ap_if = network.WLAN(network.AP_IF)
        configValue = self.wlan_config.read_config()

        ap_if.active(False)

        if configValue != None:
            sta_if.active(True)
            sta_if.connect(configValue.ssid, configValue.password)
            connected = False
            for count in range(100):
                status = sta_if.status()
                if status == network.STAT_CONNECTING:
                    time.sleep_ms(100)
                else:
                    connected = sta_if.isconnected()
                    break

            if connected == True:
                result = type("", (), {})()
                result.ssid = configValue.ssid
                result.ipAddress = sta_if.ifconfig()[0]

                try:
                    settime()
                except:
                    machine.reset()

                self.__print_wifi_connection_details(result)
                return connected
            else:
                sta_if.active(False)
                return False

        return False

    def test_wlan_config(self):
        sta_if = network.WLAN(network.STA_IF)
        sta_if.active(False)

        configValue = self.wlan_config.read_config()

        result = type("", (), {})()
        result.connected = False

        if configValue != None:
            sta_if.active(True)
            sta_if.connect(configValue.ssid, configValue.password)
            connected = False
            for count in range(100):
                status = sta_if.status()
                if status == network.STAT_CONNECTING:
                    time.sleep_ms(100)
                else:
                    connected = sta_if.isconnected()
                    break

            result = type("", (), {})()
            result.connected = connected
            if connected == True:
                result.ipAddress = sta_if.ifconfig()[0]

        return result

    async def reconnect_if_dropped(self):
        if self.configMode == True:
            return

        if self.wifi_cycle == WIFI_RECONNECT_CYCLES:
            sta_if = network.WLAN(network.STA_IF)
            self.log_service.log("trying wifi re-connect")
            if sta_if.isconnected() == False:
                self.connect_to_configured_wlan()
            self.wifi_cycle = 0

        self.wifi_cycle = self.wifi_cycle + 1
        await uasyncio.sleep_ms(1000)

    def __print_wifi_setup_details(self, config):
        self.screen.reset_screen()
        self.screen.draw_text("wifi config mode", FONT_LEFT, 30, displayDriver.WHITE)
        self.screen.draw_text("________________", FONT_LEFT, 40, displayDriver.WHITE)
        self.screen.draw_text("connect to the", FONT_LEFT, 60, displayDriver.WHITE)
        self.screen.draw_text("following network", FONT_LEFT, 70, displayDriver.WHITE)
        self.screen.draw_text(
            "ssid : " + config.ssid, FONT_LEFT, 90, displayDriver.WHITE
        )
        self.screen.draw_text(
            "password : " + config.password, FONT_LEFT, 100, displayDriver.WHITE
        )
        self.screen.draw_text("open follwing url", FONT_LEFT, 120, displayDriver.WHITE)
        self.screen.draw_text(
            "http://" + config.ipAddress, FONT_LEFT, 130, displayDriver.WHITE
        )
        self.screen.draw_text(
            "press left button to", FONT_LEFT, 150, displayDriver.WHITE
        )
        self.screen.draw_text("exit config mode", FONT_LEFT, 160, displayDriver.WHITE)

    def __print_wifi_connection_details(self, config):
        self.screen.reset_screen()
        self.screen.draw_text("wifi connected", FONT_LEFT, 30, displayDriver.WHITE)
        self.screen.draw_text("________________", FONT_LEFT, 40, displayDriver.WHITE)
        self.screen.draw_text("connected to", FONT_LEFT, 60, displayDriver.WHITE)
        self.screen.draw_text(
            "ssid : " + config.ssid, FONT_LEFT, 90, displayDriver.WHITE
        )
        self.screen.draw_text("open follwing url", FONT_LEFT, 120, displayDriver.WHITE)
        self.screen.draw_text(
            "http://" + config.ipAddress, FONT_LEFT, 130, displayDriver.WHITE
        )
