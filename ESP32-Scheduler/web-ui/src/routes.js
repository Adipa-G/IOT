import Admin from './modules/admin/Admin';
import Dashboard from './modules/dashboard/Dashboard';
import PinConfig from './modules/pinconfig/PinConfig';
import PowerConfig from './modules/powerconfig/PowerConfig';
import WlanConfig from './modules/wlanconfig/WlanConfig';

const RouteList = [
    {
        path: "/admin",
        element: <Admin />
    },
    {
        path: "/dashboard",
        element: <Dashboard />
    },
    {
        path: "/pin-config",
        element: <PinConfig />
    },
    {
        path: "/power-config",
        element: <PowerConfig />
    },
    {
        path: "/wlan-config",
        element: <WlanConfig />
    },
    {
        path: "*",
        element: <Dashboard />
    }
];

export default RouteList;