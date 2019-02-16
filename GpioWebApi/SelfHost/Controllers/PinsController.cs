using Bifrost.Devices.Gpio.Abstractions;
using Bifrost.Devices.Gpio.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace SelfHost.Controllers
{
    [Route("api/pins")]
    public class PinsController : Controller
    {
        private readonly ILogger<PinsController> logger;
        private readonly IGpioController gpioController;

        public PinsController(ILogger<PinsController> logger,
            IGpioController gpioController)
        {
            this.logger = logger;
            this.gpioController = gpioController;
        }

        [HttpGet]
        public IActionResult Get()
        {
            logger.Log(LogLevel.Information,"About to list pin statuses.");
            return Ok(gpioController.Pins);
        }

        [HttpGet("{pinId}")]
        public IActionResult Get(int pinId)
        {
            logger.Log(LogLevel.Information, $"About to get pin {pinId} status.");
            var pin = gpioController.OpenPin(pinId);

            var pinStatus = pin.Read();

            logger.Log(LogLevel.Information, $"Returning pin {pinId} status.");
            return Ok(pinStatus.ToString());
        }

        [HttpPost("{pinId}/{status}")]
        public void SwitchPin(int pinId, int status)
        {
            logger.Log(LogLevel.Information, $"About to change pin {pinId} status {status}.");
            var pin = gpioController.OpenPin(pinId);

            pin.SetDriveMode(GpioPinDriveMode.Output);

            if (status == 1)
            {
                logger.Log(LogLevel.Information, $"pin {pinId} is On.");
                pin.Write(GpioPinValue.High);
            }
            else
            {
                logger.Log(LogLevel.Information, $"pin {pinId} is Off.");
                pin.Write(GpioPinValue.Low);
            }
        }
    }
}
