import network
import os
import ubinascii
import ucryptolib

import ioc.locator as locator

PASSWORD_FILE = "wifi-config.txt"


class WLANConfigService:
    def __init__(self):
        self._log_service = locator.log_service
        wifiMac = ubinascii.hexlify(network.WLAN().config("mac"), ":").decode()
        wifiMac = wifiMac + " " * ((32 - (len(wifiMac) % 32)) % 32)
        self._encryptionKey = bytes(wifiMac, "utf8")

    def write_config(self, ssid, password):
        dataToWrite = (ssid + "\n" + password).encode()
        encAlgo = ucryptolib.aes(self._encryptionKey, 1)
        encrypted = encAlgo.encrypt(
            dataToWrite + b" " * ((16 - (len(dataToWrite) % 16)) % 16)
        )
        f = None
        try:
            f = open(PASSWORD_FILE, "w")
            f.write(encrypted)
        except Exception as e:
            self._log_service.log("error writing wifi config " + str(e))
        finally:
            if f != None:
                f.close()

    def read_config(self):
        decAlgo = ucryptolib.aes(self._encryptionKey, 1)
        f = None
        try:
            f = open(PASSWORD_FILE, "r")
            encrypted = f.read()

            decryptedData = decAlgo.decrypt(encrypted).decode("utf8").strip()
            tokens = decryptedData.split("\n")
            result = type("", (), {})()
            result.ssid = tokens[0]
            result.password = tokens[1]
            return result
        except Exception as e:
            self._log_service.log(
                "error reading wifi config or config does not exists " + str(e)
            )
        finally:
            if f != None:
                f.close()

    def delete_config(self):
        try:
            os.remove(PASSWORD_FILE)
        except Exception as e:
            self._log_service.log("error removing wifi config " + str(e))
