import config.configservice as configservice
import config.powerconfigservice as powerconfigservice
import config.wlanconfigservice as wlanconfigservice
import display.screen as screen
import ioc.locator as locator
import log.logservice as logservice
import power.batteryvoltage as batteryvoltage
import power.powermanager as powermanager
import web.apiservice as apiservice
import web.server as server
import wlan.wlansetup as wlansetup

class LocatorInit:
    def __init__(self):
        locator.log_service = logservice.LogService()
        locator.battery_voltage = batteryvoltage.BatteryVoltage()
        locator.screen = screen.Screen()
        locator.config_service = configservice.ConfigService()
        locator.wlan_config = wlanconfigservice.WLANConfigService()
        locator.power_config_service = powerconfigservice.PowerConfigService()
        locator.power_manager = powermanager.PowerManager()
        locator.wlan_setup = wlansetup.WLANSetup()
        locator.api_service = apiservice.APIService()
        locator.server = server.Server('pub')
        
