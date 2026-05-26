import ujson
import uasyncio
from micropython import const

import ioc.locator as locator


class Server:
    BUF_SIZE = const(4096)
    PORT = const(80)

    def __init__(self, home):
        self.home = home
        self.api_service = locator.api_service
        self.log_service = locator.log_service
        self.running = False
        self.socket = None

    def start(self):
        if self.running == True:
            return

        self.serverInstance = uasyncio.start_server(
            self.__request_handler, "0.0.0.0", self.PORT
        )
        loop = uasyncio.get_event_loop()
        loop.create_task(self.serverInstance)
        self.running = True

    def stop(self):
        if self.serverInstance != None:
            self.serverInstance.close()
        self.running = False

    async def __request_handler(self, reader, writer):
        try:
            request_data = await self.__get_request_data(reader)
            if request_data.method == "options":
                await writer.awrite(
                    "HTTP/1.0 204\nContent-Type: application/json\n"
                    "Access-Control-Allow-Origin: *\n"
                    "Access-Control-Allow-Methods: POST, GET, OPTIONS\n"
                    "Access-Control-Allow-Headers: Authorization, Content-Type\n"
                    "Access-Control-Max-Age: 60\n\n"
                )
            elif "/api/" in request_data.path:
                try:
                    result = self.api_service.handle(request_data)
                    await writer.awrite(
                        "HTTP/1.0 " + result["status"] + "\n"
                        "Content-Type: application/json\nAccess-Control-Allow-Origin: *\n\n"
                    )
                    if result["result"] != None:
                        await writer.awrite(ujson.dumps(result["result"]))
                except Exception as api_error:
                    self.log_service.log("api error " + str(api_error))
                    await writer.awrite("HTTP/1.0 500 InternalServerError\n")
                    await writer.awrite("\n")
            else:
                path = "/index.html" if request_data.path == "/" else request_data.path
                try:
                    import gc
                    gc.collect()
                    f = open(self.home + path, "rb")
                    content = f.read(self.BUF_SIZE)

                    headers = "HTTP/1.0 200 OK\n"
                    if path.endswith(".gz"):
                        headers += "Content-Encoding: gzip\n"
                    if path.find(".css") != -1:
                        headers += "Content-Type: text/css\n"
                    elif path.find(".js") != -1:
                        headers += "Content-Type: text/javascript\n"
                    elif path.find(".html") != -1:
                        headers += "Content-Type: text/html\n"
                    headers += "\n"
                    await writer.awrite(headers)

                    while True:
                        await writer.awrite(content)
                        if len(content) < self.BUF_SIZE:
                            break
                        content = f.read(self.BUF_SIZE)
                    f.close()

                except OSError as io_error:
                    self.log_service.log("io error " + path + " " + str(io_error))
                    await writer.awrite("HTTP/1.0 404 NotFound\n")
                    await writer.awrite("\n")
            await writer.wait_closed()
        except Exception as catch_all:
            self.log_service.log("failed to handle request " + type(catch_all).__name__ + ": " + str(catch_all))

    async def __get_request_data(self, reader):
        requst = list()
        while True:
            data = await reader.read(self.BUF_SIZE)
            requst.append(data)
            if len(data) < self.BUF_SIZE:
                break

        requst_str = (b"".join(requst)).decode("utf8")
        tokens = str(requst_str).split("\n")
        request_line = tokens[0].split(" ")

        result = type("", (), {})()
        result.method = request_line[0].lower()
        result.path = request_line[1].lower()
        result.payload = None
        result.authorization = None

        payload_section = False
        payload = ""
        for index in range(len(tokens)):
            token = tokens[index]
            if token.strip(" \r\n") == "":
                payload_section = True
            elif payload_section == True:
                payload = payload + token
            else:
                header_values = token.split(":")

                if len(header_values) > 1:
                    headerName = header_values[0].strip(" \r\n")
                    headerValue = header_values[1].strip(" \r\n")
                    if headerName == "Authorization":
                        result.authorization = headerValue

        if payload != "":
            result.payload = ujson.loads(payload)

        return result
