using System;
using System.Threading;
using Windows.Devices.Gpio;
using Windows.Devices.Spi;
using First.Display;
using nanoFramework.Hardware.Esp32;

namespace nanoFramework.Driver
{
    /* source code taken from there 
     * https://github.com/bauland/TinyClrLib/blob/master/Modules/Gadgeteer/DisplayN18/
     * and modified to work with nanoFramework 
     */
    public class ST7735
    {
        private readonly SpiDevice _spi;
        private readonly GpioPin _controlPin;
        private readonly GpioPin _resetPin;
        private readonly GpioPin _backlightPin;
        private readonly GpioPin _chipSelectLine;

        private readonly byte[] _buffer1;
        private readonly byte[] _buffer2;
        private readonly byte[] _buffer4;
        private readonly byte[] _clearBuffer;
        private readonly byte[] _characterBuffer1;
        private readonly byte[] _characterBuffer2;
        private readonly byte[] _characterBuffer4;

        private const byte St7735Madctl = 0x36;
        private const byte MadctlMy = 0x80;
        private const byte MadctlMx = 0x40;
        private const byte MadctlMv = 0x20;
        private const byte MadctlBgr = 0x08;

        /// <summary>
        /// The width of the display in pixels.
        /// </summary>
        public const int Width = 240;

        /// <summary>
        /// The height of the display in pixels.
        /// </summary>
        public const int Height = 135;

        /// <summary>
        /// Constructor of Display ST7735
        /// </summary>
        /// <param name="resetPin">Reset Pin ST7735</param>
        /// <param name="backlightPin">BackLight Pin ST7735</param>
        /// <param name="controlPin">A0/DC Pin ST7735</param>
        /// <param name="spiBusLine">SCK=SPI SCK and SDA=SPI MOSI</param>
        /// <param name="chipSelectPin">CS Pin ST7735</param>
        public ST7735(int resetPin, int backlightPin, int controlPin, string spiLine, int chipSelectPin)
        {
            _buffer1 = new byte[1];
            _buffer2 = new byte[2];
            _buffer4 = new byte[4];
            _clearBuffer = new byte[40];
            _characterBuffer1 = new byte[80];
            _characterBuffer2 = new byte[320];
            _characterBuffer4 = new byte[1280];

            _controlPin = GpioController.GetDefault().OpenPin(controlPin);
            _controlPin.SetDriveMode(GpioPinDriveMode.Output);

            _resetPin = GpioController.GetDefault().OpenPin(resetPin);
            _resetPin.SetDriveMode(GpioPinDriveMode.Output);

            _backlightPin = GpioController.GetDefault().OpenPin(backlightPin);
            _backlightPin.SetDriveMode(GpioPinDriveMode.Output);
            _backlightPin.Write(GpioPinValue.Low);

            _chipSelectLine = GpioController.GetDefault().OpenPin(chipSelectPin);
            _chipSelectLine.SetDriveMode(GpioPinDriveMode.Output);


            Configuration.SetPinFunction(19, DeviceFunction.SPI1_MOSI);
            Configuration.SetPinFunction(18, DeviceFunction.SPI1_CLOCK);

            var spiSettings = new SpiConnectionSettings(_chipSelectLine.PinNumber);
            spiSettings.Mode = SpiMode.Mode3;

            _spi = SpiDevice.FromId(spiLine, spiSettings);

            Reset();

            Thread.Sleep(10);
            WriteCommand(0x11);
            Thread.Sleep(150);

            WriteCommand(0x36);
            WriteData(0x00);
            
            WriteCommand(0x3A);
            WriteData(0x05);

            WriteCommand(0xB2);
            WriteData(0x0C);
            WriteData(0x0C);

            WriteCommand(0xB7);
            WriteData(0x35);

            WriteCommand(0xBB);
            WriteData(0x1A);

            WriteCommand(0xC0);
            WriteData(0x2C);

            WriteCommand(0xC2);
            WriteData(0x01);

            WriteCommand(0xC3);
            WriteData(0x0B);

            WriteCommand(0xC4);
            WriteData(0x20);

            WriteCommand(0xC6);
            WriteData(0x0F);

            WriteCommand(0xD0);
            WriteData(0xA4);
            WriteData(0xA1);

            WriteCommand(0x21);

            WriteCommand(0xE0);
            WriteData(0x00);
            WriteData(0x19);
            WriteData(0x1E);
            WriteData(0x0A);
            WriteData(0x09);
            WriteData(0x15);
            WriteData(0x3D);
            WriteData(0x44);
            WriteData(0x51);
            WriteData(0x12);
            WriteData(0x03);
            WriteData(0x00);
            WriteData(0x3F);
            WriteData(0x3F);

            WriteCommand(0xE1);
            WriteData(0x00);
            WriteData(0x18);
            WriteData(0x1E);
            WriteData(0x0A);
            WriteData(0x09);
            WriteData(0x25);
            WriteData(0x3F);
            WriteData(0x43);
            WriteData(0x52);
            WriteData(0x33);
            WriteData(0x03);
            WriteData(0x00);
            WriteData(0x3F);
            WriteData(0x3F);
            WriteCommand(0x29);

            Thread.Sleep(100);

            Clear();
        }

        private void WriteData(byte[] data)
        {
            _controlPin.Write(GpioPinValue.High);

            if (data.Length > 4000)
            {
                int diff = data.Length - 4000;

                byte[] buffer1 = new byte[4000];
                byte[] buffer2 = new byte[diff];

                Array.Copy(data, 0, buffer1, 0, 3999);
                Array.Copy(data, 4000, buffer2, 0, diff - 1);

                _spi.Write(buffer1);
                _spi.Write(buffer2);
            }
            else
            {
                _spi.Write(data);
            }
        }

        private void WriteCommand(byte command)
        {
            _buffer1[0] = command;
            _controlPin.Write(GpioPinValue.Low);
            _spi.Write(_buffer1);
        }

        private void WriteData(byte data)
        {
            _buffer1[0] = data;
            _controlPin.Write(GpioPinValue.High);
            _spi.Write(_buffer1);
        }

        private void Reset()
        {
            _resetPin.Write(GpioPinValue.Low);
            Thread.Sleep(300);
            _resetPin.Write(GpioPinValue.High);
            Thread.Sleep(1000);
        }

        private void SetClip(int x, int y, int width, int height)
        {
            WriteCommand(0x2A);

            _controlPin.Write(GpioPinValue.High);
            _buffer4[1] = (byte)80;
            _buffer4[3] = (byte)120;
            _spi.Write(_buffer4);

            WriteCommand(0x2B);
            _controlPin.Write(GpioPinValue.High);
            _buffer4[1] = (byte)00;
            _buffer4[3] = (byte)160;
            _spi.Write(_buffer4);
        }

        /// <summary>
        /// Clears the Display.
        /// </summary>
        public void Clear()
        {
            SetClip(50, 50, 50, 50);
            WriteCommand(0x2C);

            for (int i = 0; i < 80; i++)
                WriteData(_clearBuffer);
        }

        /// <summary>
        /// Draws an image.
        /// </summary>
        /// <param name="data">The image as a byte array.</param>
        public void DrawImage(byte[] data)
        {
            if (data == null) throw new ArgumentNullException("data");
            if (data.Length == 0) throw new ArgumentException("data.Length must not be zero.", nameof(data));

            WriteCommand(0x2C);
            WriteData(data);
        }

        /// <summary>
        /// Draws an image at the given location.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="image">The image to draw.</param>
        public void DrawImage(int x, int y, Image image)
        {
            if (image == null) throw new ArgumentNullException("image");
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");

            SetClip(x, y, image.Width, image.Height);
            DrawImage(image.Pixels);
        }

        /// <summary>
        /// Draws a filled rectangle.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="width">The width of the rectangle.</param>
        /// <param name="height">The height of the rectangle.</param>
        /// <param name="color">The color to draw.</param>
        public void DrawFilledRectangle(int x, int y, int width, int height, Color color)
        {
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");
            if (width < 0) throw new ArgumentOutOfRangeException(nameof(width), "width must not be negative.");
            if (height < 0) throw new ArgumentOutOfRangeException(nameof(height), "height must not be negative.");

            SetClip(x, y, width, height);

            var data = new byte[width * height * 2];
            for (var i = 0; i < data.Length; i += 2)
            {
                data[i] = (byte)((color.As565 >> 8) & 0xFF);
                data[i + 1] = (byte)((color.As565 >> 0) & 0xFF);
            }

            DrawImage(data);
        }

        /// <summary>
        /// Turns the backlight on.
        /// </summary>
        public void TurnOn()
        {
            _backlightPin.Write(GpioPinValue.High);
        }

        /// <summary>
        /// Turns the backlight off.
        /// </summary>
        public void TurnOff()
        {
            _backlightPin.Write(GpioPinValue.Low);
        }

        /// <summary>
        /// Draws a pixel.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="color">The color to draw.</param>
        public void SetPixel(int x, int y, Color color)
        {
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");

            SetClip(x, y, 1, 1);

            _buffer2[0] = (byte)(color.As565 >> 8);
            _buffer2[1] = (byte)(color.As565 >> 0);

            DrawImage(_buffer2);
        }

        /// <summary>
        /// Draws a line.
        /// </summary>
        /// <param name="x0">The x coordinate to start drawing at.</param>
        /// <param name="y0">The y coordinate to start drawing at.</param>
        /// <param name="x1">The ending x coordinate.</param>
        /// <param name="y1">The ending y coordinate.</param>
        /// <param name="color">The color to draw.</param>
        public void DrawLine(int x0, int y0, int x1, int y1, Color color)
        {
            if (x0 < 0) throw new ArgumentOutOfRangeException(nameof(x0), "x0 must not be negative.");
            if (y0 < 0) throw new ArgumentOutOfRangeException(nameof(y0), "y0 must not be negative.");
            if (x1 < 0) throw new ArgumentOutOfRangeException(nameof(x1), "x1 must not be negative.");
            if (y1 < 0) throw new ArgumentOutOfRangeException(nameof(y1), "y1 must not be negative.");

            var steep = Math.Abs(y1 - y0) > Math.Abs(x1 - x0);
            int t, dX, dY, yStep, error;

            if (steep)
            {
                t = x0;
                x0 = y0;
                y0 = t;
                t = x1;
                x1 = y1;
                y1 = t;
            }

            if (x0 > x1)
            {
                t = x0;
                x0 = x1;
                x1 = t;

                t = y0;
                y0 = y1;
                y1 = t;
            }

            dX = x1 - x0;
            dY = Math.Abs(y1 - y0);

            error = (dX / 2);

            if (y0 < y1)
            {
                yStep = 1;
            }
            else
            {
                yStep = -1;
            }

            for (; x0 < x1; x0++)
            {
                if (steep)
                {
                    SetPixel(y0, x0, color);
                }
                else
                {
                    SetPixel(x0, y0, color);
                }

                error -= dY;

                if (error < 0)
                {
                    y0 += (byte)yStep;
                    error += dX;
                }
            }
        }


        //public int Abs(int Values)
        //{
        //    int retValue = 0;
        //    if (Values <= 0) retValue = Values * -1;
        //    if (Values > 0) retValue = Values;

        //    return retValue;
        //}

        /// <summary>
        /// Draws a circle.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="r">The radius of the circle.</param>
        /// <param name="color">The color to draw.</param>
        public void DrawCircle(int x, int y, int r, Color color)
        {
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");
            if (r <= 0) throw new ArgumentOutOfRangeException(nameof(r), "radius must be positive.");

            int f = 1 - r;
            int ddFx = 1;
            int ddFy = -2 * r;
            int dX = 0;
            int dY = r;

            SetPixel(x, y + r, color);
            SetPixel(x, y - r, color);
            SetPixel(x + r, y, color);
            SetPixel(x - r, y, color);

            while (dX < dY)
            {
                if (f >= 0)
                {
                    dY--;
                    ddFy += 2;
                    f += ddFy;
                }

                dX++;
                ddFx += 2;
                f += ddFx;

                SetPixel(x + dX, y + dY, color);
                SetPixel(x - dX, y + dY, color);
                SetPixel(x + dX, y - dY, color);
                SetPixel(x - dX, y - dY, color);

                SetPixel(x + dY, y + dX, color);
                SetPixel(x - dY, y + dX, color);
                SetPixel(x + dY, y - dX, color);
                SetPixel(x - dY, y - dX, color);
            }
        }

        /// <summary>
        /// Draws a rectangle.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="width">The width of the rectangle.</param>
        /// <param name="height">The height of the rectangle.</param>
        /// <param name="color">The color to use.</param>
        public void DrawRectangle(int x, int y, int width, int height, Color color)
        {
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");
            if (width < 0) throw new ArgumentOutOfRangeException(nameof(width), "width must not be negative.");
            if (height < 0) throw new ArgumentOutOfRangeException(nameof(height), "height must not be negative.");

            for (var i = x; i < x + width; i++)
            {
                SetPixel(i, y, color);
                SetPixel(i, y + height - 1, color);
            }

            for (var i = y; i < y + height; i++)
            {
                SetPixel(x, i, color);
                SetPixel(x + width - 1, i, color);
            }
        }

        static readonly byte[] Font = new byte[ /* 95 * 5*/ ] {
            0x00, 0x00, 0x00, 0x00, 0x00, /* Space	0x20 */
            0x00, 0x00, 0x4f, 0x00, 0x00, /* ! */
            0x00, 0x07, 0x00, 0x07, 0x00, /* " */
            0x14, 0x7f, 0x14, 0x7f, 0x14, /* # */
            0x24, 0x2a, 0x7f, 0x2a, 0x12, /* $ */
            0x23, 0x13, 0x08, 0x64, 0x62, /* % */
            0x36, 0x49, 0x55, 0x22, 0x20, /* & */
            0x00, 0x05, 0x03, 0x00, 0x00, /* ' */
            0x00, 0x1c, 0x22, 0x41, 0x00, /* ( */
            0x00, 0x41, 0x22, 0x1c, 0x00, /* ) */
            0x14, 0x08, 0x3e, 0x08, 0x14, /* // */
            0x08, 0x08, 0x3e, 0x08, 0x08, /* + */
            0x50, 0x30, 0x00, 0x00, 0x00, /* , */
            0x08, 0x08, 0x08, 0x08, 0x08, /* - */
            0x00, 0x60, 0x60, 0x00, 0x00, /* . */
            0x20, 0x10, 0x08, 0x04, 0x02, /* / */
            0x3e, 0x51, 0x49, 0x45, 0x3e, /* 0		0x30 */
            0x00, 0x42, 0x7f, 0x40, 0x00, /* 1 */
            0x42, 0x61, 0x51, 0x49, 0x46, /* 2 */
            0x21, 0x41, 0x45, 0x4b, 0x31, /* 3 */
            0x18, 0x14, 0x12, 0x7f, 0x10, /* 4 */
            0x27, 0x45, 0x45, 0x45, 0x39, /* 5 */
            0x3c, 0x4a, 0x49, 0x49, 0x30, /* 6 */
            0x01, 0x71, 0x09, 0x05, 0x03, /* 7 */
            0x36, 0x49, 0x49, 0x49, 0x36, /* 8 */
            0x06, 0x49, 0x49, 0x29, 0x1e, /* 9 */
            0x00, 0x36, 0x36, 0x00, 0x00, /* : */
            0x00, 0x56, 0x36, 0x00, 0x00, /* ; */
            0x08, 0x14, 0x22, 0x41, 0x00, /* < */
            0x14, 0x14, 0x14, 0x14, 0x14, /* = */
            0x00, 0x41, 0x22, 0x14, 0x08, /* > */
            0x02, 0x01, 0x51, 0x09, 0x06, /* ? */
            0x3e, 0x41, 0x5d, 0x55, 0x1e, /* @		0x40 */
            0x7e, 0x11, 0x11, 0x11, 0x7e, /* A */
            0x7f, 0x49, 0x49, 0x49, 0x36, /* B */
            0x3e, 0x41, 0x41, 0x41, 0x22, /* C */
            0x7f, 0x41, 0x41, 0x22, 0x1c, /* D */
            0x7f, 0x49, 0x49, 0x49, 0x41, /* E */
            0x7f, 0x09, 0x09, 0x09, 0x01, /* F */
            0x3e, 0x41, 0x49, 0x49, 0x7a, /* G */
            0x7f, 0x08, 0x08, 0x08, 0x7f, /* H */
            0x00, 0x41, 0x7f, 0x41, 0x00, /* I */
            0x20, 0x40, 0x41, 0x3f, 0x01, /* J */
            0x7f, 0x08, 0x14, 0x22, 0x41, /* K */
            0x7f, 0x40, 0x40, 0x40, 0x40, /* L */
            0x7f, 0x02, 0x0c, 0x02, 0x7f, /* M */
            0x7f, 0x04, 0x08, 0x10, 0x7f, /* N */
            0x3e, 0x41, 0x41, 0x41, 0x3e, /* O */
            0x7f, 0x09, 0x09, 0x09, 0x06, /* P		0x50 */
            0x3e, 0x41, 0x51, 0x21, 0x5e, /* Q */
            0x7f, 0x09, 0x19, 0x29, 0x46, /* R */
            0x26, 0x49, 0x49, 0x49, 0x32, /* S */
            0x01, 0x01, 0x7f, 0x01, 0x01, /* T */
            0x3f, 0x40, 0x40, 0x40, 0x3f, /* U */
            0x1f, 0x20, 0x40, 0x20, 0x1f, /* V */
            0x3f, 0x40, 0x38, 0x40, 0x3f, /* W */
            0x63, 0x14, 0x08, 0x14, 0x63, /* X */
            0x07, 0x08, 0x70, 0x08, 0x07, /* Y */
            0x61, 0x51, 0x49, 0x45, 0x43, /* Z */
            0x00, 0x7f, 0x41, 0x41, 0x00, /* [ */
            0x02, 0x04, 0x08, 0x10, 0x20, /* \ */
            0x00, 0x41, 0x41, 0x7f, 0x00, /* ] */
            0x04, 0x02, 0x01, 0x02, 0x04, /* ^ */
            0x40, 0x40, 0x40, 0x40, 0x40, /* _ */
            0x00, 0x00, 0x03, 0x05, 0x00, /* `		0x60 */
            0x20, 0x54, 0x54, 0x54, 0x78, /* a */
            0x7F, 0x44, 0x44, 0x44, 0x38, /* b */
            0x38, 0x44, 0x44, 0x44, 0x44, /* c */
            0x38, 0x44, 0x44, 0x44, 0x7f, /* d */
            0x38, 0x54, 0x54, 0x54, 0x18, /* e */
            0x04, 0x04, 0x7e, 0x05, 0x05, /* f */
            0x08, 0x54, 0x54, 0x54, 0x3c, /* g */
            0x7f, 0x08, 0x04, 0x04, 0x78, /* h */
            0x00, 0x44, 0x7d, 0x40, 0x00, /* i */
            0x20, 0x40, 0x44, 0x3d, 0x00, /* j */
            0x7f, 0x10, 0x28, 0x44, 0x00, /* k */
            0x00, 0x41, 0x7f, 0x40, 0x00, /* l */
            0x7c, 0x04, 0x7c, 0x04, 0x78, /* m */
            0x7c, 0x08, 0x04, 0x04, 0x78, /* n */
            0x38, 0x44, 0x44, 0x44, 0x38, /* o */
            0x7c, 0x14, 0x14, 0x14, 0x08, /* p		0x70 */
            0x08, 0x14, 0x14, 0x14, 0x7c, /* q */
            0x7c, 0x08, 0x04, 0x04, 0x00, /* r */
            0x48, 0x54, 0x54, 0x54, 0x24, /* s */
            0x04, 0x04, 0x3f, 0x44, 0x44, /* t */
            0x3c, 0x40, 0x40, 0x20, 0x7c, /* u */
            0x1c, 0x20, 0x40, 0x20, 0x1c, /* v */
            0x3c, 0x40, 0x30, 0x40, 0x3c, /* w */
            0x44, 0x28, 0x10, 0x28, 0x44, /* x */
            0x0c, 0x50, 0x50, 0x50, 0x3c, /* y */
            0x44, 0x64, 0x54, 0x4c, 0x44, /* z */
            0x08, 0x36, 0x41, 0x41, 0x00, /* { */
            0x00, 0x00, 0x77, 0x00, 0x00, /* | */
            0x00, 0x41, 0x41, 0x36, 0x08, /* } */
            0x08, 0x08, 0x2a, 0x1c, 0x08  /* ~ */
        };

        private void DrawLetter(int x, int y, char letter, Color color, int scaleFactor)
        {
            var index = 5 * (letter - 32);
            var upper = (byte)(color.As565 >> 8);
            var lower = (byte)(color.As565 >> 0);
            var characterBuffer = scaleFactor == 1 ? _characterBuffer1 : (scaleFactor == 2 ? _characterBuffer2 : _characterBuffer4);

            var i = 0;

            for (var j = 1; j <= 64; j *= 2)
            {
                for (var k = 0; k < scaleFactor; k++)
                {
                    for (var l = 0; l < 5; l++)
                    {
                        for (var m = 0; m < scaleFactor; m++)
                        {
                            var show = (Font[index + l] & j) != 0;

                            characterBuffer[i++] = show ? upper : (byte)0x00;
                            characterBuffer[i++] = show ? lower : (byte)0x00;
                        }
                    }
                }
            }

            SetClip(x, y, 5 * scaleFactor, 8 * scaleFactor);
            DrawImage(characterBuffer);
        }

        /// <summary>
        /// Draws a letter at the given location.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="letter">The letter to draw.</param>
        /// <param name="color">The color to use.</param>
        public void DrawLetter(int x, int y, char letter, Color color)
        {
            if (letter > 126 || letter < 32) throw new ArgumentOutOfRangeException(nameof(letter), "This letter cannot be drawn.");
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");

            DrawLetter(x, y, letter, color, 1);
        }

        /// <summary>
        /// Draws a large letter at the given location.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="letter">The letter to draw.</param>
        /// <param name="color">The color to use.</param>
        public void DrawLargeLetter(int x, int y, char letter, Color color)
        {
            if (letter > 126 || letter < 32) throw new ArgumentOutOfRangeException(nameof(letter), "This letter cannot be drawn.");
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");

            DrawLetter(x, y, letter, color, 2);
        }

        /// <summary>
        /// Draws an extra large letter at the given location.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="letter">The letter to draw.</param>
        /// <param name="color">The color to use.</param>
        public void DrawExtraLargeLetter(int x, int y, char letter, Color color)
        {
            if (letter > 126 || letter < 32) throw new ArgumentOutOfRangeException(nameof(letter), "This letter cannot be drawn.");
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");

            DrawLetter(x, y, letter, color, 4);
        }

        /// <summary>
        /// Draws text at the given location.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="text">The string to draw.</param>
        /// <param name="color">The color to use.</param>
        public void DrawText(int x, int y, string text, Color color)
        {
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");
            if (text == null) throw new ArgumentNullException("data");

            for (var i = 0; i < text.Length; i++)
                DrawLetter(x + i * 6, y, text[i], color, 1);
        }

        /// <summary>
        /// Draws large text at the given location.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="text">The string to draw.</param>
        /// <param name="color">The color to use.</param>
        public void DrawLargeText(int x, int y, string text, Color color)
        {
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");
            if (text == null) throw new ArgumentNullException("data");

            for (var i = 0; i < text.Length; i++)
                DrawLetter(x + i * 6 * 2, y, text[i], color, 2);
        }

        /// <summary>
        /// Draws extra large text at the given location.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="text">The string to draw.</param>
        /// <param name="color">The color to use.</param>
        public void DrawExtraLargeText(int x, int y, string text, Color color)
        {
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");
            if (text == null) throw new ArgumentNullException("data");

            for (var i = 0; i < text.Length; i++)
                DrawLetter(x + i * 6 * 4, y, text[i], color, 4);
        }

        /// <summary>
        /// Draws a number at the given location.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="number">The number to draw.</param>
        /// <param name="color">The color to use.</param>
        public void DrawNumber(int x, int y, double number, Color color)
        {
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");

            DrawText(x, y, number.ToString("N2"), color);
        }

        /// <summary>
        /// Draws a large number at the given location.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="number">The number to draw.</param>
        /// <param name="color">The color to use.</param>
        public void DrawLargeNumber(int x, int y, double number, Color color)
        {
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");

            DrawLargeText(x, y, number.ToString("N2"), color);
        }

        /// <summary>
        /// Draws an extra large number at the given location.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="number">The number to draw.</param>
        /// <param name="color">The color to use.</param>
        public void DrawExtraLargeNumber(int x, int y, double number, Color color)
        {
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");

            DrawExtraLargeText(x, y, number.ToString("N2"), color);
        }

        /// <summary>
        /// Draws a number at the given location.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="number">The number to draw.</param>
        /// <param name="color">The color to use.</param>
        public void DrawNumber(int x, int y, long number, Color color)
        {
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");

            DrawText(x, y, number.ToString("N0"), color);
        }

        /// <summary>
        /// Draws a large number at the given location.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="number">The number to draw.</param>
        /// <param name="color">The color to use.</param>
        public void DrawLargeNumber(int x, int y, long number, Color color)
        {
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");

            DrawLargeText(x, y, number.ToString("N0"), color);
        }

        /// <summary>
        /// Draws an extra large number at the given location.
        /// </summary>
        /// <param name="x">The x coordinate to draw at.</param>
        /// <param name="y">The y coordinate to draw at.</param>
        /// <param name="number">The number to draw.</param>
        /// <param name="color">The color to use.</param>
        public void DrawExtraLargeNumber(int x, int y, long number, Color color)
        {
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");

            DrawExtraLargeText(x, y, number.ToString("N0"), color);
        }
    }

    /// <summary>
    /// Represents an image that can be reused.
    /// </summary>
    public class Image
    {
        /// <summary>
        /// Width of image
        /// </summary>
        public int Width { get; private set; }

        /// <summary>
        /// Height of image
        /// </summary>
        public int Height { get; private set; }

        /// <summary>
        /// Data of each pixel of image
        /// </summary>
        public byte[] Pixels { get; private set; }

        /// <summary>
        /// Constructs a new image with the given dimensions.
        /// </summary>
        /// <param name="width">The image width.</param>
        /// <param name="height">The image height.</param>
        public Image(int width, int height)
        {
            if (width < 0) throw new ArgumentOutOfRangeException(nameof(width), "width must not be negative.");
            if (height < 0) throw new ArgumentOutOfRangeException(nameof(height), "height must not be negative.");

            Width = width;
            Height = height;
            Pixels = new byte[width * height * 2];
        }

        /// <summary>
        /// Sets the given pixel to the given color.
        /// </summary>
        /// <param name="x">The x coordinate of the pixel to set.</param>
        /// <param name="y">The y coordinate of the pixel to set.</param>
        /// <param name="color">The color to set the pixel to.</param>
        public void SetPixel(int x, int y, Color color)
        {
            if (x < 0) throw new ArgumentOutOfRangeException(nameof(x), "x must not be negative.");
            if (y < 0) throw new ArgumentOutOfRangeException(nameof(y), "y must not be negative.");
            if (x > Width) throw new ArgumentOutOfRangeException(nameof(x), "x must not exceed Width.");
            if (y > Height) throw new ArgumentOutOfRangeException(nameof(y), "y must not exceed Height.");

            Pixels[(x * Width + y) * 2 + 0] = (byte)(color.As565 >> 8);
            Pixels[(x * Width + y) * 2 + 1] = (byte)(color.As565 >> 0);
        }
    }
}