using Microsoft.AspNetCore.Mvc;

namespace mock_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PinController : ControllerBase
    {
        [Route("pin_value/{pinNumber}")]
        [HttpGet("raw")]
        public IActionResult GetPinValue(string pinNumber)
        {
            var state = int.Parse(pinNumber) % 2 == 0 ? "1" : "0";
            return Content(state, "application/json");
        }

        [Route("pin_value/{pinNumber}")]
        [HttpPost]
        public IActionResult SetPinValue(string pinNumber)
        {
            var result = @"{ ""result"": ""Success""}";
            return Content(result, "application/json");
        }
    }
}
