import React from "react";
import {Wrapper} from "./components/Wrapper";
import {Route, Switch, withRouter} from "react-router-dom";

const App = () => {
    return (
        <Switch>
            <Route path='/' component={Wrapper}/>
        </Switch>
    );
};

export default withRouter(App);
