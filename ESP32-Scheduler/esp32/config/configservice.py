import ujson

import ioc.locator as locator


class ConfigService:
    def __init__(self):
        self._log_service = locator.log_service

    def read_config(self, fileName):
        cfg = dict()
        f = None
        try:
            f = open(fileName, "r")
            json_content = f.read()
            cfg = ujson.loads(json_content)
        except Exception as e:
            self._log_service.log(
                "error reading config or config does not exists "
                + fileName
                + " "
                + str(e)
            )
        finally:
            if f != None:
                f.close()
        return cfg

    def write_config(self, fileName, config):
        f = None
        try:
            json_content = ujson.dumps(config)
            f = open(fileName, "w")
            f.write(json_content)
        except Exception as e:
            self._log_service.log("error writing config " + fileName + " " + str(e))
        finally:
            if f != None:
                f.close()
