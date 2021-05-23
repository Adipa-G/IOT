import Admin from './modules/admin/Admin';
import Dashboard from './modules/dashboard/Dashboard';
import PinConfig from './modules/pinconfig/PinConfig';
import PowerConfig from './modules/powerconfig/PowerConfig';
import WlanConfig from './modules/wlanconfig/WlanConfig';

const Routes = [
    {
        path: "/admin",
        component: <Admin />
    },
    {
        path: "/dashboard",
        component: <Dashboard />
    },
    {
        path: "/pin-config",
        component: <PinConfig />
    },
    {
        path: "/power-config",
        component: <PowerConfig />
    },
    {
        path: "/wlan-config",
        component: <WlanConfig />
    }
];

export default Routes;