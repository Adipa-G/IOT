import config.configservice as configservice
import config.ioconfigservice as ioconfigservice
import config.powerconfigservice as powerconfigservice
import config.wlanconfigservice as wlanconfigservice
import display.screen as screen
import dns.server as dns_server
import hal.micropython_hal as micropython_hal
import schedule.ioservice as ioservice
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
        locator.config_service = configservice.ConfigService(locator.log_service)
        locator.wlan_config = wlanconfigservice.WLANConfigService()
        locator.io_config_service = ioconfigservice.IoConfigService(
            locator.config_service, locator.log_service
        )
        locator.power_config_service = powerconfigservice.PowerConfigService(
            locator.config_service, locator.log_service
        )
        locator.hal = micropython_hal.MicropythonPinFactory()
        locator.time_provider = micropython_hal.MicropythonTime()
        locator.battery_voltage = batteryvoltage.BatteryVoltage(
            locator.kalman_filter,
            locator.power_config_service,
            locator.hal,
            locator.log_service,
        )
        locator.io_service = ioservice.IoService(
            locator.io_config_service,
            locator.hal,
            locator.time_provider,
            locator.log_service,
        )
        locator.power_manager = powermanager.PowerManager()
        locator.wlan_setup = wlansetup.WLANSetup()
        locator.dns_server = dns_server.Server()
        locator.api_service = apiservice.APIService()
        locator.web_server = web_server.Server("pub")
