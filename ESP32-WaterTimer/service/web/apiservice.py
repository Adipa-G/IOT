import web.controllers.healthcontroller as health
import web.controllers.setupcontroller as setup
import web.controllers.pincontroller as pin


class APIService:
    def __init__(self):
        self.controllers = {
            "health": health.HealthController(),
            "setup": setup.SetupController(),
            "pin": pin.PinController(),
        }

    def handle(self, request):
        tokens = request.path.strip("/").split("/")
        method = request.method
        controller_name = tokens[1]
        method_name = method.lower() + "_" + tokens[2]
        args = tokens[3:]
        if controller_name in self.controllers:
            controller = self.controllers[controller_name]
            if hasattr(controller, method_name) == True:
                method = getattr(controller, method_name)
                result = method(request, *args)
                return {"status": "200 OK", "result": result}
        return {"status": "404 NotFound", "result": None}
