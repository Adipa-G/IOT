﻿using System;
using System.Threading;
using Windows.Devices.Gpio;
using Windows.Devices.Spi;
using nanoFramework.Hardware.Esp32;

namespace First.Display.DriverST7789V
{
    public class ST7789V : IDriver
    {
        private const byte TFT_MAD_RGB = 0x00;
        private const byte TFT_MAD_MY = 0x80;
        private const byte TFT_MAD_MX = 0x40;
        private const byte TFT_MAD_MV = 0x20;
        private const byte TFT_MAD_ML = 0x10;
        private const int DefaultWidth = 135;
        private const int DefaultHeight = 240;
        private const Orientation DefaultOrientation = Orientation.Portrait;
        
        private readonly SpiDevice _spi;
        private readonly GpioPin _controlPin;
        private readonly GpioPin _resetPin;
        private readonly GpioPin _backlightPin;
        private readonly GpioPin _chipSelectLine;

        private int _width;
        private int _height;
        private int _xOffset = 0;
        private int _yOffset = 0;
        
        private Orientation _orientation;

        private readonly byte[] _buffer1;
        private readonly byte[] _buffer4;

        public ST7789V(string spiLine,
            int resetPin,
            int backlightPin,
            int controlPin,
            int chipSelectPin,
            int mosiPin,
            int sClkPin)
        {
            _width = DefaultWidth;
            _height = DefaultHeight;
            _orientation = DefaultOrientation;

            _buffer1 = new byte[1];
            _buffer4 = new byte[4];

            _controlPin = GpioController.GetDefault().OpenPin(controlPin);
            _controlPin.SetDriveMode(GpioPinDriveMode.Output);

            _resetPin = GpioController.GetDefault().OpenPin(resetPin);
            _resetPin.SetDriveMode(GpioPinDriveMode.Output);

            _backlightPin = GpioController.GetDefault().OpenPin(backlightPin);
            _backlightPin.SetDriveMode(GpioPinDriveMode.Output);
            _backlightPin.Write(GpioPinValue.Low);

            _chipSelectLine = GpioController.GetDefault().OpenPin(chipSelectPin);
            _chipSelectLine.SetDriveMode(GpioPinDriveMode.Output);


            Configuration.SetPinFunction(mosiPin, DeviceFunction.SPI1_MOSI);
            Configuration.SetPinFunction(sClkPin, DeviceFunction.SPI1_CLOCK);

            var spiSettings = new SpiConnectionSettings(_chipSelectLine.PinNumber);
            spiSettings.Mode = SpiMode.Mode3;

            _spi = SpiDevice.FromId(spiLine, spiSettings);
        }

        public int Height => _height;
        public int Width => _width;

        public int[] GetCharSize(int scaleFactor)
        {
            return new[] {6 * scaleFactor, 10 * scaleFactor};
        }

        public void Reset()
        {
            _resetPin.Write(GpioPinValue.Low);
            Thread.Sleep(300);
            _resetPin.Write(GpioPinValue.High);
            Thread.Sleep(1000);
        }

        public void Initialize(Orientation orientation)
        {
            WriteCommand(Commands.ST7789_SLPOUT);
            Thread.Sleep(255);

            WriteCommand(Commands.ST7789_COLMOD);
            WriteData(0x55);

            Thread.Sleep(10);

            WriteCommand(Commands.ST7789_MADCTL);
            WriteData(0x00);

            WriteCommand(Commands.ST7789_INVON);
            Thread.Sleep(10);
            
            WriteCommand(Commands.ST7789_NORON);
            Thread.Sleep(10);

            SetBuffer4(Width);
            WriteCommand(Commands.ST7789_CASET);    // Column address set
            WriteData(_buffer4);

            SetBuffer4(Height);
            WriteCommand(Commands.ST7789_PASET);    // Column address set
            WriteData(_buffer4);

            WriteCommand(Commands.ST7789_DISPON);
            Thread.Sleep(255);

            SetOrientation(_orientation);
        }

        public void SetBackLight(bool isOn)
        {
            _backlightPin.Write(isOn ? GpioPinValue.High : GpioPinValue.Low);
        }

        public void Clear()
        {
            var clearBuffer = new byte[Width];
            SetClip(0, 0, Width, Height);

            WriteCommand(Commands.ST7789_RAMWR);
            for (int i = 0; i < Height * 2; i++)
                WriteData(clearBuffer);
        }

        public void SetOrientation(Orientation orientation)
        {
            this._orientation = orientation;
            WriteCommand(Commands.ST7789_MADCTL);

            switch (_orientation)
            {
                case Orientation.Portrait:
                    _xOffset = 52;
                    _yOffset = 40;
                    _width = DefaultWidth;
                    _height = DefaultHeight;
                    WriteData(TFT_MAD_RGB);
                    break;
                case Orientation.Landscape:
                    _xOffset = 40;
                    _yOffset = 53;
                    _width = DefaultHeight;
                    _height = DefaultWidth;
                    WriteData(TFT_MAD_MX | TFT_MAD_MV | TFT_MAD_RGB);
                    break;
                case Orientation.InvertedPortrait:
                    _xOffset = 53;
                    _yOffset = 40;
                    _width = DefaultWidth;
                    _height = DefaultHeight;
                    WriteData(TFT_MAD_MX | TFT_MAD_MY | TFT_MAD_RGB);
                    break;
                case Orientation.InvertedLandacape:
                    _xOffset = 40;
                    _yOffset = 52;
                    _width = DefaultHeight;
                    _height = DefaultWidth;
                    WriteData(TFT_MAD_MV | TFT_MAD_MY | TFT_MAD_RGB);
                    break;
            }
        }
        
        public void DrawFilledRectangle(int x, int y, int width, int height, Color color)
        {
            SetClip(x, y, width, height);

            var data = new byte[width * height * 2];
            for (var i = 0; i < data.Length; i += 2)
            {
                data[i] = (byte)((color.As565 >> 8) & 0xFF);
                data[i + 1] = (byte)((color.As565 >> 0) & 0xFF);
            }

            DrawImage(data);
        }

        public void DrawLetter(int x, int y, char letter, Color color, int scaleFactor)
        {
            byte[] dataBuffer = scaleFactor == 1 ? new byte[80] : scaleFactor == 2 ? new byte[320] : new byte[1280];
            
            var index = 5 * (letter - 32);
            var upper = (byte)(color.As565 >> 8);
            var lower = (byte)(color.As565 >> 0);
            
            var i = 0;
            for (var j = 1; j <= 64; j *= 2)
            {
                for (var k = 0; k < scaleFactor; k++)
                {
                    for (var l = 0; l < 5; l++)
                    {
                        for (var m = 0; m < scaleFactor; m++)
                        {
                            var show = (Font.Fonts[index + l] & j) != 0;

                            dataBuffer[i++] = show ? upper : (byte)0x00;
                            dataBuffer[i++] = show ? lower : (byte)0x00;
                        }
                    }
                }
            }

            SetClip(x, y, 5 * scaleFactor, 8 * scaleFactor);
            DrawImage(dataBuffer);
        }

        public void DrawImage(int x, int y, int width, int height, byte[] pixels)
        {
            SetClip(x,y,width, height);
            DrawImage(pixels);
        }

        private void SetClip(int x, int y, int width, int height)
        {
            ValidateAndThrow(x,y,width,height);

            WriteCommand(Commands.ST7789_CASET);
            _controlPin.Write(GpioPinValue.High);
            SetBuffer4(_xOffset + x, _xOffset + x + width - 1);
            _spi.Write(_buffer4);

            WriteCommand(Commands.ST7789_PASET);
            _controlPin.Write(GpioPinValue.High);
            SetBuffer4(_yOffset + y, _yOffset + y + height - 1);
            _spi.Write(_buffer4);
        }

        private void DrawImage(byte[] data)
        {
            WriteCommand(Commands.ST7789_RAMWR);
            WriteData(data);
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

        private void WriteData(byte[] data)
        {
            _controlPin.Write(GpioPinValue.High);

            var length = data.Length;
            var chunckSize = 1024;

            if (length < chunckSize)
            {
                _spi.Write(data);
            }
            else
            {
                var loopCount = 0;
                while (length > 0)
                {
                    if (length > chunckSize)
                    {
                        byte[] buffer = new byte[chunckSize];
                        Array.Copy(data, loopCount * chunckSize, buffer, 0, chunckSize - 1);
                        _spi.Write(buffer);
                        length -= chunckSize;
                    }
                    else
                    {
                        byte[] buffer = new byte[length];
                        Array.Copy(data, loopCount * chunckSize, buffer, 0, length - 1);
                        _spi.Write(buffer);
                        length = 0;
                    }

                    loopCount++;
                }
            }
        }

        private void SetBuffer4(int value)
        {
            _buffer4[0] = 0x00;
            _buffer4[1] = 0x00;
            _buffer4[2] = (byte)(value / 255); 
            _buffer4[3] = (byte)(value % 255);
        }

        private void SetBuffer4(int first, int second)
        {
            _buffer4[0] = (byte)(first / 255);
            _buffer4[1] = (byte)(first % 255);
            _buffer4[2] = (byte)(second / 255);
            _buffer4[3] = (byte)(second % 255);
        }

        // private void SetBuffer2(int value)
        // {
        //     _buffer2[0] = (byte) (value / 255);
        //     _buffer2[1] = (byte) (value % 255);
        // }

        private void ValidateAndThrow(int x, int y, int width, int height)
        {
            if (x < 0 || y < 0 || x + width > _width || y + height > _height)
            {
                throw new Exception("Supplied coordinates are out of bound");
            }
        }
    }
}
