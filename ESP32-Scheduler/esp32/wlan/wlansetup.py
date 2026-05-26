import time
import uasyncio
import ubinascii
import network
from micropython import const

FONT_LEFT = const(5)
WIFI_RECONNECT_CYCLES = const(10)
STAT_CONNECTING = const(1)
STAT_CONNECTING_ALT = const(1001)
STAT_IDLE = const(1000)
_WHITE = const(0xFFFF)


class WLANSetup:
    def __init__(self, wlan_config, screen, wlan_sta, wlan_ap, system, ntp_sync, log_service):
        self.configMode = False
        self._wifi_cycle = 0
        self._wlan_config = wlan_config
        self._screen = screen
        self._wlan_sta = wlan_sta
        self._wlan_ap = wlan_ap
        self._system = system
        self._ntp_sync = ntp_sync
        self._log_service = log_service

    def start_config_mode(self, force):
        if self.configMode == True:
            return

        configValue = self._wlan_config.read_config()
        if force == True or configValue == None:
            mac = ubinascii.hexlify(network.WLAN().config("mac")).decode()
            deviceSuffix = mac[-6:]   # last 3 MAC bytes as 6 hex chars, used in SSID
            passSuffix = mac[-8:]     # last 4 MAC bytes as 8 hex chars for password
            wifiName = "esp-setup-" + deviceSuffix
            wifiPass = passSuffix[:4] + "-" + passSuffix[4:]  # e.g. "ddee-ffgg" (9 chars, ≥8 WPA2 min)

            if self._wlan_ap.active() == True:
                return

            self._wlan_ap.active(True)
            self._wlan_ap.config(
                essid=wifiName, password=wifiPass, authmode=4
            )
            result = type("", (), {})()
            result.ssid = wifiName
            result.password = wifiPass
            result.ipAddress = self._wlan_ap.ifconfig()[0]
            self.__print_wifi_setup_details(result)
            self.configMode = True

    def get_config_mode_details(self):
        result = type("", (), {})()

        if self.configMode == True and self._wlan_ap.active() == True:
            result.ipAddress = self._wlan_ap.ifconfig()[0]
        else:
            result.ipAddress = None
        return result

    def end_config_mode(self):
        self._wlan_ap.active(False)
        self.configMode = False

    def connect_to_configured_wlan(self):
        configValue = self._wlan_config.read_config()
        self._log_service.log("connect_to_configured_wlan: ssid=" + str(getattr(configValue, 'ssid', None)))
        self._wlan_ap.active(False)

        if configValue != None:
            self._wlan_sta.active(True)
            try:
                self._wlan_sta.disconnect()
            except:
                pass
            self._log_service.log("Connecting to SSID: {}".format(configValue.ssid))
            self._wlan_sta.connect(configValue.ssid, configValue.password)
            connected = False
            for count in range(100):
                status = self._wlan_sta.status()
                self._log_service.log("status[{}]: {}".format(count, status))
                if self._wlan_sta.isconnected() == True:
                    connected = True
                    self._log_service.log("isconnected: {}".format(connected))
                    break

                if status == STAT_CONNECTING or status == STAT_CONNECTING_ALT or status == STAT_IDLE:
                    time.sleep_ms(100)
                else:
                    connected = False
                    self._log_service.log("isconnected: {}".format(connected))
                    break

            if connected == True:
                result = type("", (), {})()
                result.ssid = configValue.ssid
                result.ipAddress = self._wlan_sta.ifconfig()[0]

                try:
                    self._ntp_sync()
                    self._log_service.log(
                        "connected to the network and configured time."
                    )
                except Exception as e:
                    self._log_service.log("ntp_sync failed: " + str(e))
                    self._system.reset()
                self.__print_wifi_connection_details(result)

                return connected
            else:
                self._log_service.log("Failed to connect after status loop.")
                self._wlan_sta.active(False)
                return False

        self._log_service.log("No configValue found.")
        return False

    def test_wlan_config(self):
        configValue = self._wlan_config.read_config()
        self._log_service.log("test_wlan_config: ssid=" + str(getattr(configValue, 'ssid', None)))
        result = type("", (), {})()
        result.connected = False

        if configValue != None:
            if self._wlan_sta.active():
                try:
                    self._wlan_sta.disconnect()
                except:
                    pass
            else:
                self._wlan_sta.active(True)
            self._log_service.log("Testing connection to SSID: {}".format(configValue.ssid))
            self._wlan_sta.connect(configValue.ssid, configValue.password)
            connected = False
            for count in range(100):
                status = self._wlan_sta.status()
                self._log_service.log("test status[{}]: {}".format(count, status))
                if self._wlan_sta.isconnected() == True:
                    connected = True
                    self._log_service.log("test isconnected: {}".format(connected))
                    break

                if status == STAT_CONNECTING or status == STAT_CONNECTING_ALT or status == STAT_IDLE:
                    time.sleep_ms(100)
                else:
                    connected = False
                    self._log_service.log("test isconnected: {}".format(connected))
                    break

            result = type("", (), {})()
            result.connected = connected
            if connected == True:
                result.ipAddress = self._wlan_sta.ifconfig()[0]

        return result

    async def reconnect_if_dropped(self):
        if self.configMode == True:
            return

        connected = False
        if self._wifi_cycle == WIFI_RECONNECT_CYCLES:
            if self._wlan_sta.isconnected() == False:
                self._log_service.log("trying wifi re-connect")
                connected = self.connect_to_configured_wlan()
            self._wifi_cycle = 0

        self._wifi_cycle = self._wifi_cycle + 1
        await uasyncio.sleep_ms(1000)
        return connected

    def __print_wifi_setup_details(self, config):
        self._screen.reset_screen()
        self._screen.draw_text("wifi config mode", FONT_LEFT, 30, _WHITE)
        self._screen.draw_text("________________", FONT_LEFT, 40, _WHITE)
        self._screen.draw_text("connect to the", FONT_LEFT, 60, _WHITE)
        self._screen.draw_text("following network", FONT_LEFT, 70, _WHITE)
        self._screen.draw_text(
            "ssid : " + config.ssid, FONT_LEFT, 90, _WHITE
        )
        self._screen.draw_text(
            "password : " + config.password, FONT_LEFT, 100, _WHITE
        )
        self._screen.draw_text("open follwing url", FONT_LEFT, 120, _WHITE)
        self._screen.draw_text(
            "http://" + config.ipAddress, FONT_LEFT, 130, _WHITE
        )
        self._screen.draw_text(
            "press left button to", FONT_LEFT, 150, _WHITE
        )
        self._screen.draw_text("exit config mode", FONT_LEFT, 160, _WHITE)

    def __print_wifi_connection_details(self, config):
        self._screen.reset_screen()
        self._screen.draw_text("wifi connected", FONT_LEFT, 30, _WHITE)
        self._screen.draw_text("________________", FONT_LEFT, 40, _WHITE)
        self._screen.draw_text("connected to", FONT_LEFT, 60, _WHITE)
        self._screen.draw_text(
            "ssid : " + config.ssid, FONT_LEFT, 90, _WHITE
        )
        self._screen.draw_text("open follwing url", FONT_LEFT, 120, _WHITE)
        self._screen.draw_text(
            "http://" + config.ipAddress, FONT_LEFT, 130, _WHITE
        )
