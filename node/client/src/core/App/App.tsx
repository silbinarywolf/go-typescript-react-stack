import React from "react";
import {
	Route,
	Redirect,
	Switch,
	Router,
} from "react-router-dom";
import { createHashHistory } from "history";

import LoadingPage from "~/core/App/LoadingPage";
import { ErrorBoundary } from "~/ui/ErrorBoundary/ErrorBoundary";

const history = createHashHistory();

const MemberLoginPage = React.lazy(() => import("~/member/MemberLoginPage"));
const MemberRegisterPage = React.lazy(() => import("~/member/MemberRegisterPage"));

export default function App(): JSX.Element {
	return (
		<ErrorBoundary>
			<Router
				history={history}
			>
				<React.Suspense 
					fallback={<LoadingPage/>}
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
						<Route
							path={"/register"}
							component={MemberRegisterPage}
							exact
						/>
						{/* <Route
							component={fallbackRoute.component}
							params={fallbackRoute.params}
						/> */}
					</Switch>
				</React.Suspense>
			</Router>
		</ErrorBoundary>
	);
}
