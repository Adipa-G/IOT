namespace WebUI.Display
{
    public class Display
    {
        private readonly IDriver _driver;
        private Orientation _orientation;
        
        public Display(IDriver driver, Orientation orientation)
        {
            this._driver = driver;
            this._orientation = orientation;
        }

        public int Width => _driver != null ? _driver.Width : 0;

        public int Height => _driver != null ? _driver.Height : 0;

        public int GetCharWidth(TextSize textSize) =>
            _driver != null ? _driver.GetCharWidth(GetScaleFactor(textSize)) : 1;

        public int GetCharHeight(TextSize textSize) =>
            _driver != null ? _driver.GetCharHeight(GetScaleFactor(textSize)) : 1;

        public void Initialize()
        {
            _driver.Reset();
            _driver.Initialize(_orientation);
            _driver.Clear();
        }

        public void TurnOn()
        {
            _driver.SetBackLight(true);
        }

        public void TurnOff()
        {
            _driver.SetBackLight(false);
        }

        public void SetOrientation(Orientation orientation)
        {
            _orientation = orientation;
            _driver.SetOrientation(orientation);
        }

        public void DrawRectangle(int x, int y, int width, int height, Color color, bool isFilled)
        {
            if (isFilled)
            {
                _driver.DrawFilledRectangle(x, y, width - 1, height - 1, color);
            }
            _driver.DrawFilledRectangle(x,y,width,1, color);
            _driver.DrawFilledRectangle(x, y, 1, height, color);
            _driver.DrawFilledRectangle(x + width - 1, y, 1, height, color);
            _driver.DrawFilledRectangle(x, y + height - 1, width,1, color);
        }

        public void DrawText(int x, int y, string text, Color color, TextSize size)
        {
            var scaleFactor = GetScaleFactor(size);
            var letterWidth = _driver.GetCharWidth(scaleFactor);
            var letterHeight = _driver.GetCharHeight(scaleFactor);

            var lines = text.Split(new char[]{'\n','\r'});
            var maxCols = (_driver.Width - x - 1) / letterWidth;
            var maxRows = (_driver.Height - y - 1) / letterHeight;
            
            for (var rowIndex = 0; rowIndex < lines.Length; rowIndex++)
            {
                if (rowIndex > maxRows)
                    return;
            
                var line = lines[rowIndex];
                var chars = line.Trim().Length == 0 ? new char[] {' '} :
                    line.Length > maxCols ? line.Substring(0, maxCols).ToCharArray() : line.ToCharArray();
                _driver.DrawLetters(x, y + letterHeight * rowIndex, chars, color, scaleFactor);
            }
        }

        public void DrawImage(int x, int y, int width, int height, byte[] pixels)
        {
            _driver.DrawImage(x, y, width, height, pixels);
        }

        private int GetScaleFactor(TextSize size)
        {
            return size == TextSize.Small ? 1 : size == TextSize.Medium ? 2 : 3;
        }
    }
}
