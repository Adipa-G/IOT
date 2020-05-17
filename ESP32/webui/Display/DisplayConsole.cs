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

        private string[] messages;
        private Color[] colors;
        private int minMessages = 0;
        private int messageCount = 0;
        private int lastDraw = 0;

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
            messages = new string[(_height - 1) / _charHeight];
            minMessages = (messages.Length / 4);
            colors = new Color[(_height - 1) / _charHeight];
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
                for (int i = 0; i <= minMessages; i++)
                {
                    messages[minMessages - i] = messages[messages.Length - 1 - i];
                    colors[minMessages - i] = colors[messages.Length - 1 - i];
                }
                lastDraw = 0;
                messageCount = minMessages + 1;
            }

            messages[messageCount] = message;
            colors[messageCount] = color;
            messageCount++;
        }

        private void Draw()
        {
            if (lastDraw == 0)
            {
                _display.DrawRectangle(_x,_y,_width,_height,Color.Black,true);
            }

            var maxCols = (_width - 1) / _charWidth;
            var maxRows = (_height - 1) / _charHeight;
            var startRow = messageCount - maxRows;
            if (startRow < 0)
                startRow = 0;

            for (var index = lastDraw; index < maxRows; index++)
            {
                var arrayIndex = startRow + index;
                var message = messages[arrayIndex];
                if (arrayIndex >= messageCount)
                {
                    lastDraw = arrayIndex;
                    return;
                }

                message = message.Length > maxCols ? message.Substring(0, maxCols) : message;
                _display.DrawText(_x,_y + _charHeight * index, message, colors[arrayIndex],_textSize);
            }
        }
    }
}
