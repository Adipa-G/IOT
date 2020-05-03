using System;

namespace First.Display
{
    public class Console
    {
        private Display _display;
        private int _x;
        private int _y;
        private int _width;
        private int _height;
        private TextSize _textSize;

        private string[] messages = new string[50];
        private Color[] colors = new Color[50];
        private int messageCount = 0;

        public Console(Display display,
            int x, 
            int y, 
            int width, 
            int height, 
            TextSize textSize)
        {
            _display = display;
            _x = x;
            _y = y;
            _width = width;
            _height = height;
            _textSize = textSize;
        }

        public void Log(string message, Color color)
        {
            if (messageCount == messages.Length)
            {
                for (int i = 0; i < messages.Length; i++)
                {
                    
                }
            }
            else
            {
                messages[messageCount] = message;
                colors[messageCount] = color;
                messageCount++;
            }
        }
    }
}
