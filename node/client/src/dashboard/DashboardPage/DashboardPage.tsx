import React from "react";
import { Link } from "react-router-dom";

import { Container } from "~/ui/Container/Container";

export default function DashboardPage(): JSX.Element {
	return (
		<Container>
			<h1>Dashboard</h1>
			<ul>
				<li>
					<Link to="examplemodule">
						Go to examplemodule page
					</Link>
				</li>
			</ul>
		</Container>
	);
}
