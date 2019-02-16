# Raspberry Pi GPIO API

This is a .net core Web API to control Raspberry Pi GPIO.

## Raspberry Pi setup

The operating system used was DietPi. Follow [instructions](https://dietpi.com/phpbb/viewtopic.php?f=8&t=9#p9) to install the operating system. Make sure to,

1. Configure the network connectivity.
2. Use the `Open SSH` as the ssh server from the configuration screen displayed while installation. This is required to use `pscp` to copy files to the Raspberry Pi.
3. Ensure you can connect to the device using SSH
     * Username - root
     * Password - < your password : default is dietpi if you have not changed it >
     * IP Address - Connect a keyboard and a display and login to the device and it'll displayed. You can also use your router management interface to get the IP address.

## Installing .Net Core

1. Connect to the Raspberry Pi using SSH.
2. Run following commands.

```
     sudo apt-get -y update
     sudo apt-get -y install libunwind8 gettext
     wget https://dotnetcli.blob.core.windows.net/dotnet/Runtime/release/2.0.0/dotnet-runtime-latest-linux-arm.tar.gz
     sudo mkdir /opt/dotnet
     sudo tar -xvf dotnet-runtime-latest-linux-arm.tar.gz -C /opt/dotnet
     sudo ln -s /opt/dotnet/dotnet /usr/local/bin
```

## Deploying the application

1. Install [PuTTY](https://www.putty.org/).
2. Checkout the code.
3. Modify (set ip address and the username) and run the powershell script `.\SelfHost\pi-deploy.ps1`. 
4. Once command is executed, run `dotnet SelfHost.dll` command, using the SSH terminal from the home folder of the Raspberry Pi.


## Testing it out

1. Connect an LED to GPIO pins as below.
2. Download and install the Postman
3. Send a `POST` request to `http://<ip address>:5000/api/pins/2/1`. This will turn the LED on. The url format is  `http://<ip address>:5000/api/pins/<GPIO Pin No>/<State>`. 
4. Send another `POST` request to `http://<ip address>:5000/api/pins/2/0`. This will turn the LED off.
5. Send a `GET` request to `http://<ip address>:5000/api/pins/2` and it will return the state of the pin.
6. Send a `GET` request to `http://<ip address>:5000/api/pins` and it will return states of all the pins (note that it'll return states where the state of the pin has been changed).



### References

https://jeremylindsayni.wordpress.com/2017/07/23/running-a-net-core-2-app-on-raspbian-jessie-and-deploying-to-the-pi-with-cake/
