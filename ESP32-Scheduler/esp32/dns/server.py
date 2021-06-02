import uasyncio
import usocket
from micropython import const

import dns.dnsquery as dnsquery
import ioc.locator as locator


class Server:
    PORT = const(53)
    MAX_QUERY_LENGTH = const(256)
    DNS_QUERY_START = const(12)

    def __init__(self):
        self.log_service = locator.log_service
        self.wlan_setup = locator.wlan_setup
        self.running = False
        self.sock = None
        self.ipAddress = None

    def start(self):
        if self.running == True:
            return

        sock = usocket.socket(usocket.AF_INET, usocket.SOCK_DGRAM)
        addr = usocket.getaddrinfo("0.0.0.0", self.PORT, 0, usocket.SOCK_DGRAM)[0][-1]
        sock.setsockopt(usocket.SOL_SOCKET, usocket.SO_REUSEADDR, 1)
        sock.setblocking(False)
        sock.bind(addr)
        self.sock = sock
        self.running = True

    def stop(self):
        if self.sock != None:
            self.sock.close()
        self.running = False

    async def check_conn(self):
        if self.running == False:
            return

        for i in range(10):
            try:
                packet, addr = self.sock.recvfrom(self.MAX_QUERY_LENGTH)
                print("len : " + str(len(packet)))

                if len(packet) < self.DNS_QUERY_START:
                    await uasyncio.sleep_ms(100)
                    return

                print("raw : " + packet.decode("utf8"))
                dnsQ = dnsquery.DNSQuery(packet)
                print("domain : " + dnsQ.domain)

                resp = dnsQ.response(self.__get_ip())
                self.sock.sendto(resp, addr)

                await uasyncio.sleep_ms(100)
            except OSError as err:
                pass
            except Exception as catch_all:
                self.log_service.log("failed to handle request " + str(catch_all))

    def __get_ip(self):
        if self.ipAddress == None:
            config_details = self.wlan_setup.get_config_mode_details()
            self.ipAddress = config_details.ipAddress
        if self.ipAddress == None:
            return "127.0.0.1"
        return self.ipAddress
