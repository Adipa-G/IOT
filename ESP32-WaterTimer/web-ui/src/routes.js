import Dashboard from './modules/dashboard/Dashboard';
import PinConfig from './modules/pinconfig/PinConfig';
import PowerConfig from './modules/powerconfig/PowerConfig';

const Routes = [
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
    }
];

export default Routes;