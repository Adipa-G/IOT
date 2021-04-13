import machine
import ioc.locator as locator

class SetupController:
    def __init__(self):
        self.power_config_service = locator.power_config_service
        self.wlan_config = locator.wlan_config
        self.wlan_setup = locator.wlan_setup

    def get_power_config(self, request):
        result = self.power_config_service.read_config()
        return result

    def post_power_config(self, request):
        self.power_config_service.write_config(request.payload)
        return { 'result' : 'Success' }

    def post_wlan_creds(self, request):
        if (self.wlan_setup.configMode == False):
            return { 
                'result': 'Failed', 
                'error' : 'cannot perform this operation when not in config mode. Please press the right button to enter the config mode.' 
            }

        ssid = request.payload['ssid']
        password = request.payload['password']
        self.wlan_config.write_config(ssid, password)
        return { 'result' : 'Success' }

    def post_restart(self, request):
        machine.reset()
        return { 'result' : 'Success' }