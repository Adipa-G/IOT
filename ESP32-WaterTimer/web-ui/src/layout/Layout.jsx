import { Route, Switch, Redirect } from "react-router-dom";

import Menu from "./Menu";
import Routes from './../routes';

const Layout = () => {
    return (
        <div>
            <Menu />
            <Switch>
                <Route
                    exact
                    path="/"
                    render={() => {
                        return (
                            <Redirect to="/dashboard" />
                        )
                    }}
                />
                {Routes.map((route, i) => (
                    <Route key={i}
                        path={route.path}
                        component={() => route.component} />
                ))}
            </Switch>
        </div>
    );
}

export default Layout;