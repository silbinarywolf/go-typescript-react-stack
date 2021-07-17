import React from "react";
import ReactDOM from "react-dom";

import { Button } from "~/ui/Button/Button"

function main(): void {
    ReactDOM.render(
		<React.Fragment>
			<Button
                label="Test Button"
            />
	    </React.Fragment>,
	    document.getElementById("app")
	);
}
main();
