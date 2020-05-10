using System;
using System.Threading;
using Windows.Devices.Gpio;
using nanoFramework.Hardware.Esp32;
using WebUI.Display;
using WebUI.Display.DriverST7789V;

// using nanoFramework.Companion.Drivers.Display;

// using nanoFramework.Companion.Drivers.Display;

namespace WebUI
{
    public class Program
    {
        private const int BackLightPin = 4;
        private static GpioPin BacklightPin = null;


        // public static void Main()
        // {
        //     Console.WriteLine("Hello world!");
        //
        //     Thread.Sleep(Timeout.Infinite);
        //
        //     // Browse our samples repository: https://github.com/nanoframework/samples
        //     // Check our documentation online: https://docs.nanoframework.net/
        //     // Join our lively Discord community: https://discord.gg/gCyBu8T
        // }

        static GpioPin _led;

        public static void Main()
        {
            //SetBackLightStatus(true);

            // OLED oled = new OLED("I2C2", 0x3C);
            //
            // oled.Initialize();
            //
            // oled.Write(0, 2, "Hello ESP32");
            //
            // oled.Write(0, 4, "Connected to I2C1");


            var driver = new ST7789V("SPI1", 23, 4, 16, 5, 19, 18);
            var display = new Display.Display(driver, Orientation.Portrait);

            display.Initialize();
            display.TurnOn();
            display.SetOrientation(Orientation.InvertedLandacape);
            display.DrawRectangle(10,10,50, 50, Color.Cyan, false);
            display.DrawImage(70, 10, 50, 50, CSharpIcon.GetBytes());
            //display.DrawText(10, 80, "This is a test \nA \nB", Color.Green, TextSize.Small);

            display.DrawRectangle(125, 5, 110, 110, Color.Cyan, false);
            var console = new DisplayConsole(display, 130, 10, 100, 100, TextSize.Small);


            
            for (int i = 0; i < 1000; i++)
            {
                console.Log("row " + i + " __________________________++++++++++++++++++++++++++++++++++++___________________________________________", i %5 == 0 ? Color.Red : Color.Green);
                Thread.Sleep(1000);
            }



            /*ST7735 display = new ST7735(
                23,                 //Reset
                4,                 //BackLight 
                16,                 //A0 (DC) Control Pin / Data Command
                "SPI1",      //SPI SCK/MOSI 
                5                 //chipSelect
            );

            display.TurnOn();
            
            short i = 0;
            
            display.DrawCircle(40, 40, 20, Color.Red);
            // display.DrawRectangle(40, 40, 40, 40, Color.Cyan);
            // display.DrawFilledRectangle(80, 80, 40, 40, Color.Blue);
            // display.DrawText(10, 30, "Hello nanoFramework", Color.Green);
            // display.DrawText(30, 60, "from ST7735 SPI", Color.Green);
            //
            // while (true)
            // {
            //     i++;
            //     display.DrawText(10, 10, i.ToString(), Color.Green);
            //
            //     Thread.Sleep(500);
            // }

            // Thread.Sleep(5000);
            //
            // SetBackLightStatus(false);
            */

            /*ILI9341_SPI oled = new ILI9341_SPI("ST7789", /*On STM32F401RE Nucleo board, I2C1 is configured for use#1#
                135, /*Width in pixel#1#
                240 /*height in pixel#1#,
                GpioController.GetDefault().OpenPin(16),
                GpioController.GetDefault().OpenPin(23),
                GpioController.GetDefault().OpenPin(5));
            /*
             * This companion library comes with a few default fonts. These fonts are pixel based fonts (7X9 means 7 pixel wide and 9 pixel high).
             * Commonly used symbols are supplied as pixel font too. If you want o build your own font to use with this library, 
             * use the font generator tool to design your own fonts.
             #1#
            oled.SetFont(new PixelFont7X9());
            
            oled.Initialize();
            oled.ClearScreen();
            oled.PrepareToWrite();
            oled.DrawRect(0, 0, 128, 32, 200);//draw a rectangle border
            oled.DrawText(4, 4, "Hello nanoFramework", 100); //There are 19 characters in the text, meaning total pixel width of 19 x 7 = 143 + 19 = 152...
            //so wrapping will happen...for each character, there is 1-pixel gutter provided. Also, when line
            //wraps, another 1-pixel gutter is provided in y-direction
            oled.Write();//Write buffer contents to display...
            Thread.Sleep(3000);
            
            oled.SetFont(new Symbols7X9());//We want to use symbols...each ASCII code (32-126) represents a symbol
            oled.ClearScreen();
            oled.PrepareToWrite();
            oled.DrawText(1, 1, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", 50); //Draw 26 symbols corresponding to ascii codes from A-Z
            oled.Write(); //Write buffer contents to display
            
            // oled.Dispose();*/



            /*
            // mind to set a pin that exists on the board being tested
            // PJ5 is LD2 in STM32F769I_DISCO
            _led = GpioController.GetDefault().OpenPin(4);
            // PG14 is LEDLD4 in F429I_DISCO
            //_led = GpioController.GetDefault().OpenPin(PinNumber('G', 14));

            _led.SetDriveMode(GpioPinDriveMode.Output);

            // create timer
            Console.WriteLine(DateTime.UtcNow.ToString() + ": creating timer, due in 1 second");

            Timer testTimer = new Timer(CheckStatusTimerCallback, null, 1000, 1000);

            // let it run for 5 seconds (will blink 5 times)
            Thread.Sleep(5000);

            Console.WriteLine(DateTime.UtcNow.ToString() + ": changing period to 2 seconds");

            // change timer period
            testTimer.Change(0, 2000);

            // let it run for 10 seconds (will blink 5 times)
            Thread.Sleep(10000);

            Console.WriteLine(DateTime.UtcNow.ToString() + ": destroying timer");

            // dispose timer
            testTimer.Dispose();

            // loop forever
            Thread.Sleep(Timeout.Infinite);*/
        }

        private static void CheckStatusTimerCallback(object state)
        {
            Console.WriteLine(DateTime.UtcNow.ToString() + ": blink");

            _led.Write(GpioPinValue.High);
            Thread.Sleep(125);
            _led.Write(GpioPinValue.Low);
        }

        static int PinNumber(char port, byte pin)
        {
            if (port < 'A' || port > 'J')
                throw new ArgumentException();

            return ((port - 'A') * 16) + pin;
        }

        private static void SetBackLightStatus(bool isOn)
        {
            if (BacklightPin == null)
            {
                BacklightPin = GpioController.GetDefault().OpenPin(BackLightPin);
                BacklightPin.SetDriveMode(GpioPinDriveMode.Output);
            }
            BacklightPin.Write(isOn ? GpioPinValue.High: GpioPinValue.Low);
        }
    }
}
