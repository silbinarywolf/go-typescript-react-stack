import React from "react";

import { Button } from "~/ui/Button/Button"
import { ErrorBoundary } from "~/ui/ErrorBoundary/ErrorBoundary";

export function App(): JSX.Element {
    return (
		<ErrorBoundary>
			<React.Fragment>
				<Button
					label="Test Button"
				/>
			</React.Fragment>
		</ErrorBoundary>
	);
}
