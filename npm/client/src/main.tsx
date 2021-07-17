import React from "react";
import ReactDOM from "react-dom";

import { App } from "~/core/App/App"

function main(): void {
    ReactDOM.render(
		<App/>,
	    document.getElementById("app")
	);
}
main();
