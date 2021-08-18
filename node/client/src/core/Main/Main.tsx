import React, { useEffect, useState } from "react";
import {
	Route,
	Redirect,
	Switch,
	Router,
} from "react-router-dom";
import { createHashHistory } from "history";

import LoadingPage from "~/core/LoadingPage/LoadingPage";
import { useMember } from "~/member/useMember/useMember";
import axios from "axios";
import { errorToStatusCode } from "~/util/Fetch";
import Error404Page from "../Error404Page/Error404Page";

const history = createHashHistory();

const LoginPage = React.lazy(() => import("~/member/LoginPage/LoginPage"));
const RegisterPage = React.lazy(() => import("~/member/RegisterPage/RegisterPage"));
const DashboardPage = React.lazy(() => import("~/dashboard/DashboardPage/DashboardPage"));

export default function App(): JSX.Element {
	const {isLoggedIn, setIsLoggedIn} = useMember();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isFetchingMe, setIsFetchingMe] = useState<boolean>(false);

	useEffect(() => {
		async function getMe(): Promise<void> {
			if (isFetchingMe) {
				return;
			}
			setIsFetchingMe(true);
			let resp;
			try {
				resp = await axios.get("/api/member/me", {withCredentials: true});
			} catch (err) {
				if (errorToStatusCode(err) === 401) {
					setIsLoggedIn(false);
					setIsLoading(false);
					return;
				}
				// todo(Jae): 2021-08-18
				// add generic error handling
				return;
			}
			// If no error occurred, then we are logged in
			setIsLoggedIn(true);
			setIsLoading(false);
		}
		if (!isLoggedIn) {
			// If already logged in, avoid firing request
			setIsLoading(false);
			return;
		}
		getMe();
	}, []);

	return (
		<React.Fragment>
			{(isLoading === true) && 
                <LoadingPage/>
			}
			{(isLoading === false) && 
                <Router
                	history={history}
                >
                	<React.Suspense 
                		fallback={<LoadingPage/>}
                	>
                		<Switch>
                			{(isLoggedIn === true) &&
                                <React.Fragment>
                                	<Route
                                		key="/"
                                		path="/"
                                		exact
                                	>
                                		<Redirect to={"/dashboard"} />
                                	</Route>
                                </React.Fragment>
                			}
                			{(isLoggedIn === false) &&
                                <Route
                                	key="/"
                                	path="/"
                                	exact
                                >
                                	<Redirect to={"/login"} />
                                </Route>
                			}
                			<Route
                				path={"/login"}
                				component={LoginPage}
                				exact
                			/>
                			<Route
                				path={"/register"}
                				component={RegisterPage}
                				exact
                			/>
                			<Route
                				path={"/dashboard"}
                				component={DashboardPage}
                				exact
                			/>
                			<Route
                				component={Error404Page}
                			/>
                		</Switch>
                	</React.Suspense>
                </Router>
			}
		</React.Fragment>
	);
}
