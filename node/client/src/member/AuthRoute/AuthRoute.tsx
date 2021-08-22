import React from "react";

import { Redirect, Route } from "react-router-dom";
import type { RouteProps } from "react-router-dom";
import { useMember } from "~/member/useMember/useMember";

interface AuthRouteProps extends RouteProps {
    // note(jae): 2021-08-19
    // stubbed incase we need additional props, such as expected permissions
    // or similar
}

/**
 * AuthRoute is a wrapped around the Route component that requires user login.
 * If the user is not logged in, it will redirect them to the login page.
 */
export function AuthRoute(props: AuthRouteProps): JSX.Element {
	const {isLoggedIn} = useMember();
	if (!isLoggedIn) {
		let wantedPath: string = "";
		if (Array.isArray(props.path)) {
			wantedPath = props.path[0];
		}
		if (typeof props.path === "string") {
			wantedPath = props.path;
		}
		return (
			<Redirect 
				to={"/login?back_url="+encodeURIComponent(wantedPath)}
			/>
		);
	}
	return (
		<Route
			{...props}
		/>
	);
}
