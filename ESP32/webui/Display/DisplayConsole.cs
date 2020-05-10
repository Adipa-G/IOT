namespace WebUI.Display
{
    public class DisplayConsole
    {
        private Display _display;
        private int _x;
        private int _y;
        private int _width;
        private int _height;
        private int _charWidth;
        private int _charHeight;
        private TextSize _textSize;

        private string[] messages = new string[50];
        private Color[] colors = new Color[50];
        private int messageCount = 0;

        public DisplayConsole(Display display,
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
            _charWidth = _display.GetCharWidth(textSize);
            _charHeight = _display.GetCharHeight(textSize);
        }

        public void Log(string message, Color color)
        {
            var lines = message.Split(new char[] { '\n', '\r' });
            foreach (var line in lines)
            {
                if (line.Trim().Length > 0)
                {
                    AddMessage(line.Trim(), color);
                }
            }

            Draw();
        }

        private void AddMessage(string message, Color color)
        {
            if (messageCount == messages.Length)
            {
                for (int i = 1; i < messages.Length; i++)
                {
                    messages[i - 1] = messages[i];
                    colors[i - 1] = colors[i];
                }
                messages[messages.Length - 1] = message;
                colors[messages.Length - 1] = color;
            }
            else
            {
                messages[messageCount] = message;
                colors[messageCount] = color;
                messageCount++;
            }
        }

        private void Draw()
        {
            var maxCols = _width / _charWidth;
            var maxRows = _height / _charHeight;
            var startRow = messageCount - maxRows;
            if (startRow < 0)
                startRow = 0;

            for (var index = 0; index < maxRows; index++)
            {
                var arrayIndex = startRow + index;
                var message = messages[arrayIndex];
                if (arrayIndex >= messageCount)
                {
                    return;
                }

                message = message.Length > maxCols ? message.Substring(0, maxCols) : message;
                _display.DrawText(_x,_y + _charHeight * index, message, colors[arrayIndex],_textSize);
            }
        }
    }
}
