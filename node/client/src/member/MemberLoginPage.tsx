import React from "react";

import { Button } from "~/ui/Button/Button";

export function MemberLoginPage(): JSX.Element {
	return (
		<div>
			Login page
			<div>
				<label htmlFor="Username">
					Username
				</label>
				<input
					id="Username"
					name="Username"
					type="text"
					value=""
				/>
			</div>
			<div>
				<label htmlFor="Password">
					Password
				</label>
				<input
					id="Password"
					name="Password"
					type="text"
					value=""
				/>
			</div>
			<Button
				label="Test Button"
				data-testid="testButton"
			/>
		</div>
	);
}
