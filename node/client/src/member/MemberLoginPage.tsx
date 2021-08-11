import React from "react";
import { Link } from "react-router-dom";

import { Button } from "~/ui/Button/Button";

export default function MemberLoginPage(): JSX.Element {
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
					type="password"
					value=""
				/>
			</div>
			<div>
				<Link to="/register">
					Click here to register
				</Link>
			</div>
			<Button
				label="Test Button"
				data-testid="testButton"
			/>
		</div>
	);
}
