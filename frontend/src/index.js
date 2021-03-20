import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {ChakraProvider} from "@chakra-ui/react";
import {ColorModeScript} from "@chakra-ui/color-mode";
import {Router} from "react-router-dom";

import theme from "./theme";
import history from './history';

import moment from "moment";
import 'moment/locale/ru';

moment.locale('ru');

ReactDOM.render(
    <React.StrictMode>
        <ChakraProvider>
            <ColorModeScript initialColorMode={theme.config.initialColorMode}/>
            <Router history={history}>
                <App/>
            </Router>
        </ChakraProvider>
    </React.StrictMode>,
    document.getElementById('root')
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
