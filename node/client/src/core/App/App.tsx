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
import { MemberProvider } from "~/member/useMember/useMember";

const history = createHashHistory();

const MemberLoginPage = React.lazy(() => import("~/member/MemberLoginPage/MemberLoginPage"));
const MemberRegisterPage = React.lazy(() => import("~/member/MemberRegisterPage/MemberRegisterPage"));

interface GlobalProvidersProps {
	children: JSX.Element
}

// GlobalProviders are were all providers that need to be accessed across the entire application
// go. 
//
// note(jae): 2021-08-17
// We put our providers in a seperate function so that if/when we need to add more in the future
// it's clear that only the providers were updated, not routes/etc within the main "App" render function
function GlobalProviders({children}: GlobalProvidersProps): JSX.Element {
	return (
		<MemberProvider>
			{children}
		</MemberProvider>
	);
}

export default function App(): JSX.Element {
	return (
		<ErrorBoundary>
			<GlobalProviders>
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
			</GlobalProviders>
		</ErrorBoundary>
	);
}
