using System.Threading;
using WebUI.Display;


namespace WebUI
{
    public class Program
    {
        public static void Main()
        {
            var orientation = Orientation.Portrait;

            ServiceLocator.InitDisplay(orientation);
            ServiceLocator.Display.DrawRectangle(0, 0, ServiceLocator.Display.Width, ServiceLocator.Display.Height, Color.Green, false);

            if (orientation == Orientation.Portrait || orientation == Orientation.InvertedPortrait)
            {
                ServiceLocator.Display.DrawImage(42, 92, 50, 50, CSharpIcon.GetBytes());
                ServiceLocator.Display.DrawText(42, 150, "Initializing..", Color.Green, TextSize.Small);
            }
            else
            {
                ServiceLocator.Display.DrawImage(92, 42, 50, 50, CSharpIcon.GetBytes());
                ServiceLocator.Display.DrawText(92, 100, "Initializing..", Color.Green, TextSize.Small);
            }
            
            ServiceLocator.InitConsole1(1, 1, ServiceLocator.Display.Width - 2, ServiceLocator.Display.Height -2, TextSize.Small);

            var x = new Thread(Log);
            x.Start();
        }

        private static void Log()
        {
            for (int i = 0; i < 1000; i++)
            {
                Thread.Sleep(1000);
                ServiceLocator.Console1.Log("row " + i + " __________________________++++++++++++++++++++++++++++++++++++___________________________________________", i % 5 == 0 ? Color.Red : Color.Green);
            }
        }
    }
}
