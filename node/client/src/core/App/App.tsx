import React from "react";
import {
	Route,
	Redirect,
	Switch,
	Router,
} from "react-router-dom"
import { createHashHistory } from 'history';

import { MemberLoginPage } from "~/member/MemberLoginPage";
import { ErrorBoundary } from "~/ui/ErrorBoundary/ErrorBoundary";

let history = createHashHistory();

export function App(): JSX.Element {
	return (
		<ErrorBoundary>
			<Router 
				history={history}
			>
				<Switch>
					<Route
						key="/"
						path="/"
						exact
					>
						<Redirect to={"/login"} />
					</Route>
					<Route
						path={"/login"}
						component={MemberLoginPage}
						exact
					/>
					{/* <Route
						component={fallbackRoute.component}
						params={fallbackRoute.params}
					/> */}
				</Switch>
			</Router>
		</ErrorBoundary>
	);
}
