
# ESP32 Scheduler
This is a generic timer/scheduler project using micropython and web interface. The device hosts a REST API developed using micropython and a SPA developed using react.

The device can be switched to the Wi-Fi access point when the right button is long pressed. In this mode the device has a captive portal implementation that can be used to easily access it's web interface to connect it to a local network.

There are 2 folders, 
1. web-ui - contains the web interface
2. esp32 - contains the micropython code

## Web UI Project
### Prerequisites
 1. Install [NodeJs](https://nodejs.org/en/download/) and ensure the node is in the path variables.
 2. Go into the folder and execute `npm install`
 3. Optional: run unit tests with `npm test` 
 4. Execute `npm run-script build`
 5. Copy files from the `web-ui\build` folder to `esp32\pub` folder

## ESP 32 Project
### The Device
The code is tested on [this](http://www.lilygo.cn/prod_view.aspx?TypeId=50033&Id=1126&FId=t3:50033:3) device. The same code probably will work on other devices, however without the display it won't be as easy to use.

![The device](/ESP32-Scheduler/images/device.png?raw=true "The device") 

![Pin layout](/ESP32-Scheduler/images/device_pins.png?raw=true "Pin layout") 

### Prerequisites
 1. Install [Python](https://www.python.org/downloads/) and ensure the python and pip package manager is in the path variables.
 2. Install the esptool with command `pip install esptool`
 3. Install [Putty] (https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html)
 4. Install adafruit-ampy with command `pip install adafruit-ampy`

### Setting up
 1. Install USB to UART driver. [This](https://www.silabs.com/products/development-tools/software/usb-to-uart-bridge-vcp-drivers) may be a good candidate and work for you.
 2. Connect your ESP32 board to the USB port and note the port. In order to find the port open the Device Manager and expand the Ports node. If the USB to UART driver is correctly functioning you should see something like `Silicon Labs CP210X USB to UART Bridge (COM3)`. In this case the port will be `COM3`. We will be using the same value for subsequent steps. Please substitute your port for the following steps.
 3. Reset the board with the command esptool.py --port COM3 erase_flash
 4. Download the firmware from [Here](https://micropython.org/download/esp32/)
 5. Flash it using `esptool.py --chip esp32 --port COM3 write_flash -z 0x1000 esp32-idf4-20200902-v1.13.bin`
 6. Use Putty to connect to the board (Use connection type as serial, and set speed as 115200 and serial line to be COM3)
 7. When you want to copy a file to the board use command `ampy -p COM3 put <localFileOrFolder> {NameOnBoard}`
 8. Copy all files in `esp32` folder (including `\pub` folder with react output) to the device.
  
### UI

How to setup.

1. When the right hand button is long pressed, the device shows the following screen.

    ![AP Mode](/ESP32-Scheduler/images/ap_mode.jpg?raw=true "AP Mode") 

2. Using the credentials in the screen, connect to the wireless network.
3. Go to URL "http://esp32scheduler.org"
4. This will bring up the web portal.
5. To connect to a Wi-Fi endpoint select `Connect to Wi-Fi` option from the menu. This will show following screen. Set your Wi-Fi endpoint credentials and save. URL on new network is displayed in the screen. Make sure to connect your device to the Wi-Fi network before browsing to this URL.
    
    ![Wi-Fi config](/ESP32-Scheduler/images/wi-fi-config.png?raw=true "Wi-Fi config") 

6. To setup a schedule please use the `IO Schedule Configuration` from the menu. This allows the user to setup a new schedule for a given GPIO pin. Note that the schedule is stored in UTC time. If there's a daylight savings, then the trigger time would change.

    ![IO config](/ESP32-Scheduler/images/io-config.png?raw=true "IO Config") 

7. Once the schedule is added, it's displayed in the dashboard. The dashboard also include some more diagnostic information such as voltage of the battery. Further dashboard allows user to manually toggle the GPIO state from the UI. 

    ![Dashboard](/ESP32-Scheduler/images/dashboard.png?raw=true "Dashboard")  

8. To tweak power and sleep settings of the device please use the `Power Configuration` option from the menu. This screen allows user to tweak battery voltages for the power save modes if the device runs on limited power source like a solar panel combined battery. The Volage sensor pin can be any ADC input pins which is used to measure voltage input. Since the max voltage ESP32 ADC can handle is 3.3v, a voltage divider may be required if the battery voltage is higher than that. In this case voltage multiplier can be used to set the multiplier based on the divider ration to get correct voltage.  

    ![Power config](/ESP32-Scheduler/images/power-config.png?raw=true "Power Config")  
 

### Implementation

I have used this code to build an automatic water timer to water plants.

![Diagram](/ESP32-Scheduler/images/diagram.png?raw=true "Diagram") 

![Construction](/ESP32-Scheduler/images/construction.jpg?raw=true "Construction") 