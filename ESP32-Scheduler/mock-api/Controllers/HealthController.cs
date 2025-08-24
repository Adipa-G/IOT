using Microsoft.AspNetCore.Mvc;

namespace mock_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [Route("status")]
        [HttpGet]
        public IActionResult GetStatus()
        {
            var rawJsonString = @"{ ""healthy"": true, ""voltage"": 3.78, ""memory"": 53214, ""tempreature"": 44, ""time"": [2025, 1, 1, 10, 22, 0, 0, 0] }";
            return Content(rawJsonString, "application/json");
        }
    }
}
