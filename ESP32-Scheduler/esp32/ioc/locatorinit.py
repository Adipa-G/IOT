import config.configservice as configservice
import config.ioconfigservice as ioconfigservice
import config.powerconfigservice as powerconfigservice
import config.wlanconfigservice as wlanconfigservice
import display.screen as screen
import dns.server as dns_server
import io.ioservice as ioservice
import ioc.locator as locator
import filters.kalmanfilter as kalmanfilter
import log.logservice as logservice
import power.batteryvoltage as batteryvoltage
import power.powermanager as powermanager
import web.apiservice as apiservice
import web.server as web_server
import wlan.wlansetup as wlansetup


class LocatorInit:
    def __init__(self):
        locator.kalman_filter = kalmanfilter.KalmanFilter()
        locator.log_service = logservice.LogService()
        locator.screen = screen.Screen()
        locator.config_service = configservice.ConfigService()
        locator.wlan_config = wlanconfigservice.WLANConfigService()
        locator.io_config_service = ioconfigservice.IoConfigService()
        locator.power_config_service = powerconfigservice.PowerConfigService()
        locator.battery_voltage = batteryvoltage.BatteryVoltage()
        locator.io_service = ioservice.IoService()
        locator.power_manager = powermanager.PowerManager()
        locator.wlan_setup = wlansetup.WLANSetup()
        locator.dns_server = dns_server.Server()
        locator.api_service = apiservice.APIService()
        locator.web_server = web_server.Server("pub")
