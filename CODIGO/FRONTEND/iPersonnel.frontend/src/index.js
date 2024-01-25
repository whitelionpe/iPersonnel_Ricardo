/**
 * Create React App entry point. This and `public/index.html` files can not be
 * changed or moved.
 */
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter} from 'react-router-dom';
import axios from "axios";
import store, { persistor } from "./app/store/store";
import App from "./App";
import { setupAxios } from "./_metronic";

import "./index.scss"; // Standard version
// import "./sass/style.react.rtl.css"; // RTL version
// IE 11 polyfills
import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
// Fonts
import "socicon/css/socicon.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./_metronic/_assets/plugins/line-awesome/css/line-awesome.css";
import "./_metronic/_assets/plugins/flaticon/flaticon.css";
import "./_metronic/_assets/plugins/flaticon2/flaticon.css";
//:::::::::::::::: TEMPLATE 1 :::::::
import "./_metronic/_assets/css/custom_v2.css";
/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */
const { PUBLIC_URL } = process.env; //mockAxios(axios);

/**
 * Creates `axios-mock-adapter` instance for provided `axios` instance, add
 * basic Metronic mocks and returns it.
 *
 * @see https://github.com/ctimmerm/axios-mock-adapter
 */
/* const mock = */ /**
 * Inject metronic interceptors for axios.
 *
 * @see https://github.com/axios/axios#interceptors
 */
setupAxios(axios, store);

ReactDOM.render(<HashRouter><App store={store} persistor={persistor} basename={PUBLIC_URL} /></HashRouter>, document.getElementById("root"));
