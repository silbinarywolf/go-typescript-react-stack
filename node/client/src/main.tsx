import axios from "axios";
import React from "react";
import ReactDOM from "react-dom";

import App from "~/core/App/App";

import "~/main.module.css";

function main(): void {
	if (!VERSION) {
		throw new Error("Missing VERSION constant.");
	}

	// Use API_ENDPOINT (configured in Webpack build settings)
	// This tells us where to send our API requests by default
	if (API_ENDPOINT) {
		let baseURL = API_ENDPOINT;
		if (baseURL.startsWith(":")) {
			// If only port is specified, use current host name
			baseURL = window.location.protocol + "//" + window.location.hostname+API_ENDPOINT;
		}
		axios.defaults.baseURL = baseURL;
	}
	
	ReactDOM.render(
		<App/>,
	    document.getElementById("app")
	);
}
main();
