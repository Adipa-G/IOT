namespace WebUI.Display.DriverST7789V
{
    internal class Commands
    {
        public const byte ST7789_NOP = 0x00;
        public const byte ST7789_SWRESET = 0x01;
        public const byte ST7789_RDDID = 0x04;
        public const byte ST7789_RDDST = 0x09;

        public const byte ST7789_RDDPM = 0x0A; // Read display power mode
        public const byte ST7789_RDD_MADCTL = 0x0B;     // Read display MADCTL
        public const byte ST7789_RDD_COLMOD = 0x0C;     // Read display pixel format
        public const byte ST7789_RDDIM = 0x0D; // Read display image mode
        public const byte ST7789_RDDSM = 0x0E; // Read display signal mode
        public const byte ST7789_RDDSR = 0x0F; // Read display self-diagnostic result (ST7789V)

        public const byte ST7789_SLPIN = 0x10;
        public const byte ST7789_SLPOUT = 0x11;
        public const byte ST7789_PTLON = 0x12;
        public const byte ST7789_NORON = 0x13;

        public const byte ST7789_INVOFF = 0x20;
        public const byte ST7789_INVON = 0x21;
        public const byte ST7789_GAMSET = 0x26;    // Gamma set
        public const byte ST7789_DISPOFF = 0x28;
        public const byte ST7789_DISPON = 0x29;
        public const byte ST7789_CASET = 0x2A;
        public const byte ST7789_PASET = 0x2B;
        public const byte ST7789_RAMWR = 0x2C;
        public const byte ST7789_RGBSET = 0x2D;    // Color setting for 4096, 64K and 262K colors
        public const byte ST7789_RAMRD = 0x2E;

        public const byte ST7789_PTLAR = 0x30;
        public const byte ST7789_VSCRDEF = 0x33;    // Vertical scrolling definition (ST7789V)
        public const byte ST7789_TEOFF = 0x34;// Tearing effect line off
        public const byte ST7789_TEON = 0x35;    // Tearing effect line on
        public const byte ST7789_MADCTL = 0x36;    // Memory data access control
        public const byte ST7789_IDMOFF = 0x38;    // Idle mode off
        public const byte ST7789_IDMON = 0x39;// Idle mode on
        public const byte ST7789_RAMWRC = 0x3C;    // Memory write continue (ST7789V)
        public const byte ST7789_RAMRDC = 0x3E;    // Memory read continue (ST7789V)
        public const byte ST7789_COLMOD = 0x3A;

        public const byte ST7789_RAMCTRL = 0xB0;    // RAM control
        public const byte ST7789_RGBCTRL = 0xB1;    // RGB control
        public const byte ST7789_PORCTRL = 0xB2;    // Porch control
        public const byte ST7789_FRCTRL1 = 0xB3;    // Frame rate control
        public const byte ST7789_PARCTRL = 0xB5;    // Partial mode control
        public const byte ST7789_GCTRL = 0xB7;// Gate control
        public const byte ST7789_GTADJ = 0xB8;// Gate on timing adjustment
        public const byte ST7789_DGMEN = 0xBA;// Digital gamma enable
        public const byte ST7789_VCOMS = 0xBB;// VCOMS setting
        public const byte ST7789_LCMCTRL = 0xC0;    // LCM control
        public const byte ST7789_IDSET = 0xC1;// ID setting
        public const byte ST7789_VDVVRHEN = 0xC2;    // VDV and VRH command enable
        public const byte ST7789_VRHS = 0xC3;    // VRH set
        public const byte ST7789_VDVSET = 0xC4;    // VDV setting
        public const byte ST7789_VCMOFSET = 0xC5;    // VCOMS offset set
        public const byte ST7789_FRCTR2 = 0xC6;    // FR Control 2
        public const byte ST7789_CABCCTRL = 0xC7;    // CABC control
        public const byte ST7789_REGSEL1 = 0xC8;    // Register value section 1
        public const byte ST7789_REGSEL2 = 0xCA;    // Register value section 2
        public const byte ST7789_PWMFRSEL = 0xCC;    // PWM frequency selection
        public const byte ST7789_PWCTRL1 = 0xD0;    // Power control 1
        public const byte ST7789_VAPVANEN = 0xD2;    // Enable VAP/VAN signal output
        public const byte ST7789_CMD2EN = 0xDF;    // Command 2 enable
        public const byte ST7789_PVGAMCTRL = 0xE0;// Positive voltage gamma control
        public const byte ST7789_NVGAMCTRL = 0xE1;// Negative voltage gamma control
        public const byte ST7789_DGMLUTR = 0xE2;    // Digital gamma look-up table for red
        public const byte ST7789_DGMLUTB = 0xE3;    // Digital gamma look-up table for blue
        public const byte ST7789_GATECTRL = 0xE4;    // Gate control
        public const byte ST7789_SPI2EN = 0xE7;    // SPI2 enable
        public const byte ST7789_PWCTRL2 = 0xE8;    // Power control 2
        public const byte ST7789_EQCTRL = 0xE9;    // Equalize time control
        public const byte ST7789_PROMCTRL = 0xEC;    // Program control
        public const byte ST7789_PROMEN = 0xFA;    // Program mode enable
        public const byte ST7789_NVMSET = 0xFC;    // NVM setting
        public const byte ST7789_PROMACT = 0xFE;    // Program action
    }
}
