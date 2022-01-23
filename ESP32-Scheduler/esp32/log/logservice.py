import os
import utime

LOG_FILE = "log.log"
LOG_BAK_FILE = "log.bak"


class LogService:
    def __init__(self):
        pass

    def log(self, message):
        print(message)
        self.__ensure_files()

        f = None
        try:
            curTime = utime.localtime()
            curTimeStr = (
                str(curTime[0])
                + "-"
                + str(curTime[1])
                + "-"
                + str(curTime[2])
                + " "
                + str(curTime[3])
                + ":"
                + str(curTime[4])
                + ":"
                + str(curTime[5])
            )
            f = open("log.log", "a")
            f.write("[" + curTimeStr + "] " + message + "\n")
        except Exception as e:
            print("error writing log to log " + str(e))
        finally:
            if f != None:
                f.close()

    def get_logs(self):
        self.__ensure_files()
        f = None
        try:
            f = open("log.log", "r")
            log_content = f.read()
            return log_content
        except Exception as e:
            print("error reading log file " + str(e))
            return "log reading error"
        finally:
            if f != None:
                f.close()

    def __ensure_files(self):
        log_size = 0

        f = None
        try:
            f = open(LOG_FILE, "r")
            log_size = os.stat(LOG_FILE)[6]
        except OSError as e:
            print("log file not present " + str(e))
        finally:
            if f != None:
                f.close()

        if log_size > 10240:
            f = None
            try:
                f = open(LOG_BAK_FILE, "r")
                f.close()
                os.remove(LOG_BAK_FILE)
                f = None
            except OSError as e:
                print("bak file not present " + str(e))
            finally:
                if f != None:
                    f.close()

            try:
                os.rename(LOG_FILE, LOG_BAK_FILE)
                os.remove(LOG_FILE)
            except Exception as e:
                print("unable to copy backup file " + str(e))
