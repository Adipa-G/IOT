using System;
using WebUI.Display;
using WebUI.Display.DriverST7789V;

namespace WebUI
{
    public class ServiceLocator
    {
        public static void InitDisplay(Orientation orientation)
        {   
            Driver = new ST7789V("SPI1", 23, 4, 16, 5, 19, 18);
            Display = new Display.Display(Driver, orientation);
            Display.Initialize();
            Display.TurnOn();
            Display.SetOrientation(orientation);
        }

        public static void InitConsole1(int x, int y, int width, int height, TextSize textSize)
        {
            if (Display == null)
                throw new Exception("Ensure display is initialized");
            Console1 = new DisplayConsole(Display, x, y, width, height, textSize);
        }

        public static IDriver Driver { get; private set; }

        public static Display.Display Display { get; private set; }

        public static DisplayConsole Console1 { get; private set; }
    }
}
