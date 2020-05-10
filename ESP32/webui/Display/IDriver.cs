namespace WebUI.Display
{
    public interface IDriver
    {
        int Height { get; }

        int Width { get; }

        int GetCharWidth(int scaleFactor);

        int GetCharHeight(int scaleFactor);

        void Reset();

        void Initialize(Orientation orientation);

        void Clear();

        void SetBackLight(bool isOn);

        void SetOrientation(Orientation orientation);

        void DrawFilledRectangle(int x, int y, int width, int height, Color color);

        void DrawLetters(int x, int y, char[] letters, Color color, int scaleFactor);

        void DrawImage(int x, int y, int width, int height, byte[] pixels);
    }
}
