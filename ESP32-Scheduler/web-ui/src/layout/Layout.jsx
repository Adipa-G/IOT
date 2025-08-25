import { Route, Routes, Navigate } from "react-router";

import Menu from "./Menu";
import RouteList from './../routes';

const Layout = () => {
    return (
        <div>
            <Menu />
            <Routes>
                {RouteList.map((route, i) => (
                    <Route key={i}
                        path={route.path}
                        element={route.element} />
                ))}
            </Routes>
        </div>
    );
}

export default Layout;