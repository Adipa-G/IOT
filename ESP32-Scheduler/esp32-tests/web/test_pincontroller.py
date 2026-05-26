from types import SimpleNamespace

from web.controllers.pincontroller import PinController
from tests.hal.mock_hal import MockPinFactory


def _request(payload=None):
    return SimpleNamespace(payload=payload or {})


def test_get_pin_value_returns_current_pin_state():
    """get_pin_value creates an output pin and returns its value as a string."""
    factory = MockPinFactory()
    ctrl = PinController(factory)

    result = ctrl.get_pin_value(_request(), pin="3")

    pin = factory.get_output_pin(3)
    assert pin is not None
    assert result == {"value": str(pin.value())}


def test_post_pin_value_sets_pin_state():
    """post_pin_value creates an output pin and calls value(int) on it."""
    factory = MockPinFactory()
    ctrl = PinController(factory)

    result = ctrl.post_pin_value(_request({"value": "1"}), pin="5")

    pin = factory.get_output_pin(5)
    assert pin is not None
    assert pin.current_value == 1
    assert result == {"result": "Success"}
