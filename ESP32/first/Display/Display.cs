using System;

namespace First.Display
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
                _driver.DrawFilledRectangle(x, y, width, height, color);
            }
            _driver.DrawFilledRectangle(x,y,width,1,color);
            _driver.DrawFilledRectangle(x, y, 1, height, color);
            _driver.DrawFilledRectangle(x + width, y, 1, height, color);
            _driver.DrawFilledRectangle(x, y + height, width,1, color);
        }

        public void DrawText(int x, int y, string text, Color color, TextSize size)
        {
            var scaleFactor = size == TextSize.Small ? 1: size == TextSize.Medium? 2 : 3;
            var letterSize = _driver.GetCharSize(scaleFactor);
            
            var lines = text.Split(new char[]{'\n','\r'});
            var maxCols = (_driver.Width - x) / letterSize[0];
            var maxRows = (_driver.Height - y) / letterSize[1];
            
            for (var rowIndex = 0; rowIndex < lines.Length; rowIndex++)
            {
                if (rowIndex > maxRows)
                    return;
            
                var line = lines[rowIndex];
                var chars = line.Trim().Length == 0 ? new char[] {' '} :
                    line.Length > maxCols ? line.Substring(0, maxCols).ToCharArray() : line.ToCharArray();
            
                for (var colIndex = 0; colIndex < chars.Length; colIndex++)
                {
                    char c = chars[colIndex];
                    _driver.DrawLetter(x + letterSize[0] * colIndex, y + letterSize[1] * rowIndex, c, color, scaleFactor);
                }
            }
        }

        public void DrawImage(int x, int y, int width, int height, byte[] pixels)
        {
            _driver.DrawImage(x, y, width, height, pixels);
        }
    }
}
