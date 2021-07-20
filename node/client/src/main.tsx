import React from "react";
import ReactDOM from "react-dom";

import { App } from "~/core/App/App"

function main(): void {
	if (!VERSION) {
		throw new Error("Missing VERSION constant.");
	}
    ReactDOM.render(
		<App/>,
	    document.getElementById("app")
	);
}
main();
