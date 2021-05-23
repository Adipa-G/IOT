import machine
import ioc.locator as locator


class SetupController:
    def __init__(self):
        self.io_config_service = locator.io_config_service
        self.power_config_service = locator.power_config_service
        self.wlan_config = locator.wlan_config
        self.wlan_setup = locator.wlan_setup

    def get_io_config(self, request):
        result = self.io_config_service.read_config()
        return result

    def post_io_config(self, request):
        self.io_config_service.write_config(request.payload)
        return {"result": "Success"}

    def get_power_config(self, request):
        result = self.power_config_service.read_config()
        return result

    def post_power_config(self, request):
        self.power_config_service.write_config(request.payload)
        return {"result": "Success"}

    def post_wlan_creds(self, request):
        if self.wlan_setup.configMode == False:
            return {
                "result": "Failed",
                "error": "cannot perform this operation when not in config mode. Please press the right button to enter the config mode.",
            }

        ssid = request.payload["ssid"]
        password = request.payload["password"]
        self.wlan_config.write_config(ssid, password)

        connectivity = self.wlan_setup.test_wlan_config()
        if connectivity.connected == True:
            return {
                "result": "Success",
                "url": "http://" + connectivity.ipAddress + "/",
            }
        return {"result": "Failed"}

    def post_restart(self, request):
        machine.reset()
        return {"result": "Success"}
