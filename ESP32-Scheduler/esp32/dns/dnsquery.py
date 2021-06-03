class DNSQuery:
    def __init__(self, data):
        self._data = data
        self._domain = ""
        tipo = (data[2] >> 3) & 15
        if tipo == 0:
            ini = 12
            lon = data[ini]
            while lon != 0:
                self._domain += data[ini + 1 : ini + lon + 1].decode("utf-8") + "."
                ini += lon + 1
                lon = data[ini]

    def response(self, ip):
        packet = self._data[:2] + b"\x81\x80"
        packet += self._data[4:6] + self._data[4:6] + b"\x00\x00\x00\x00"
        packet += self._data[12:]
        packet += b"\xC0\x0C"
        packet += b"\x00\x01\x00\x01\x00\x00\x00\x3C\x00\x04"
        packet += bytes(map(int, ip.split(".")))
        return packet
