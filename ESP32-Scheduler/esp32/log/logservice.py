import os

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
            f = open("log.log", "a")
            f.write(message + "\n")
        except Exception as e:
            print("error writing log config " + str(e))
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

        if log_size > 102400:
            f = None
            try:
                f = open(LOG_BAK_FILE, "r")
                os.remove(LOG_BAK_FILE)
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
