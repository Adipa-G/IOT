
# ESP32 Web API Project (In Progress)
This web api project use micropython.

## Prerequisites
 1. Install [Python](https://www.python.org/downloads/) and ensure the python and pip package manager is in the path variables.
 2. Install the esptool with command `pip install esptool`
 3. Install [Putty] (https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html)
 4. Install adafruit-ampy with command `pip install adafruit-ampy`
 
## Setting up
 1. Install USB to UART driver. [This](https://www.silabs.com/products/development-tools/software/usb-to-uart-bridge-vcp-drivers) may be a good candidate and work for you.
 2. Connect your ESP32 board to the USB port and note the port. In order to find the port open the Device Manager and expand the Ports node. If the USB to UART driver is correctly functioning you should see something like `Silicon Labs CP210X USB to UART Bridge (COM3)`. In this case the port will be `COM3`. We will be using the same value for subsequent steps. Please substitue your port for the following steps.
 3. Reset the board with the command esptool.py --port COM3 erase_flash
 4. Download the firmware from [Here](https://micropython.org/download/esp32/)
 5. Flash it using `esptool.py --chip esp32 --port COM3 write_flash -z 0x1000 esp32-idf4-20191220-v1.12.bin`
 6. Use Putty to connect to the board (Use connection type as serial, and set speed as 115200 and serial line to be COM3)
 7. When you want to copy a file to the board use command `ampy -p COM3 put <localFileOrFolder> {NameOnBoard}`
 
 