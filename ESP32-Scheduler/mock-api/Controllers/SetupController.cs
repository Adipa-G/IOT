using Microsoft.AspNetCore.Mvc;

namespace mock_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SetupController : ControllerBase
    {
        [Route("io_config")]
        [HttpGet("raw")]
        public IActionResult GetIoConfig()
        {
            var rawJsonString = @"{ ""schedules"": [
                { ""title"": ""pin 2"", ""pin"": ""2"", ""highDurationUtc"": ""12:00-20:00"" },
                { ""title"": ""pin 3"", ""pin"": ""3"", ""highDurationUtc"": ""14:00-22:00"" }
            ]}";
            return Content(rawJsonString, "application/json");
        }

        [Route("io_config")]
        [HttpPost]
        public IActionResult SetIoConfig()
        {
            var result = @"{ ""result"": ""Success""}";
            return Content(result, "application/json");
        }

        [Route("power_config")]
        [HttpGet]
        public IActionResult GetPowerConfig()
        {
            var rawJsonString = @"{
                ""screenOnSeconds"": 300,
                ""voltageSensorPin"": 31,
                ""voltageMultiplier"": 1.33,
                ""highBattery.minVoltage"": 4.0,
                ""highBattery.cpuFreqMHz"": 240,
                ""mediumBattery.minVoltage"": 3.2,
                ""mediumBattery.cpuFreqMHz"": 160,
                ""mediumBattery.deepSleepDurationUtc"": ""12:00-20:00"",
                ""lowBattery.minVoltage"": 3.0,
                ""lowBattery.cpuFreqMHz"": 80,
                ""lowBattery.deepSleepDurationUtc"": ""07:00-22:00"",
                ""extraLowBattery.continousDeepSleepHours"": 8
            }";
            return Content(rawJsonString, "application/json");
        }

        [Route("power_config")]
        [HttpPost]
        public IActionResult SetPowerConfig()
        {
            var result = @"{ ""result"": ""Success""}";
            return Content(result, "application/json");
        }

        [Route("wlan_creds")]
        [HttpPost]
        public IActionResult SetWlanCreds()
        {
            var result = @"{ ""result"": ""Success""}";
            return Content(result, "application/json");
        }

        [Route("restart")]
        [HttpPost]
        public IActionResult Restart()
        {
            var result = @"{ ""result"": ""Success""}";
            return Content(result, "application/json");
        }
    }
}
