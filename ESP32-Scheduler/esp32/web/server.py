import _thread
import random
import socket
import time
import ujson
import os
import uasyncio
from micropython import const

import ioc.locator as locator


class Server:
    BUF_SIZE = const(1024)
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
                await writer.awrite("HTTP/1.0 204\n")
                await writer.awrite("Content-Type: application/json\n")
                await writer.awrite("Access-Control-Allow-Origin: *\n")
                await writer.awrite(
                    "Access-Control-Allow-Methods: POST, GET, OPTIONS\n"
                )
                await writer.awrite(
                    "Access-Control-Allow-Headers: Authorization, Content-Type\n"
                )
                await writer.awrite("Access-Control-Max-Age: 60\n")
                await writer.awrite("\n")
            elif "/api/" in request_data.path:
                try:
                    result = self.api_service.handle(request_data)
                    await writer.awrite("HTTP/1.0 " + result["status"] + "\n")
                    await writer.awrite("Content-Type: application/json\n")
                    await writer.awrite("Access-Control-Allow-Origin: *\n")
                    await writer.awrite("\n")
                    if result["result"] != None:
                        await writer.awrite(ujson.dumps(result["result"]))
                except Exception as api_error:
                    self.log_service.log("api error " + str(api_error))
                    await writer.awrite("HTTP/1.0 500 InternalServerError\n")
                    await writer.awrite("\n")
            else:
                path = "/index.html" if request_data.path == "/" else request_data.path
                try:
                    f = open(self.home + path, "r")
                    content = f.read(BUF_SIZE)

                    await writer.awrite("HTTP/1.0 200 OK\n")
                    if path.endswith(".gz"):
                        await writer.awrite("Content-Encoding: gzip\n")
                    if path.find(".css") != -1:
                        await writer.awrite("Content-Type: text/css\n")
                    if path.find(".js") != -1:
                        await writer.awrite("Content-Type: text/javascript\n")
                    if path.find(".html") != -1:
                        await writer.awrite("Content-Type: text/html\n")
                    await writer.awrite("\n")

                    while True:
                        await writer.awrite(content)
                        if len(content) < BUF_SIZE:
                            break
                        content = f.read(BUF_SIZE)
                    f.close()

                except OSError as io_error:
                    self.log_service.log("io error " + path + " " + str(io_error))
                    await writer.awrite("HTTP/1.0 404 NotFound\n")
                    await writer.awrite("\n")
            await writer.wait_closed()
        except Exception as catch_all:
            self.log_service.log("failed to handle request " + str(catch_all))

    async def __get_request_data(self, reader):
        requst = list()
        while True:
            data = await reader.read(BUF_SIZE)
            requst.append(data)
            if len(data) < BUF_SIZE:
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