import Dashboard from './modules/dashboard/Dashboard';
import PinConfig from './modules/pinconfig/PinConfig';

const Routes = [
    {
        path: "/dashboard",
        component: <Dashboard />
    },
    {
        path: "/pin-config",
        component: <PinConfig />
    }
];

export default Routes;