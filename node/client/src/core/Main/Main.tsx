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
import Error404Page from "~/core/Error404Page/Error404Page";
import { AuthRoute } from "~/member/AuthRoute/AuthRoute";

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
					return;
				}
				// todo(Jae): 2021-08-18
				// add generic error handling
				return;
			} finally {
				setIsLoading(false);
			}
			// If no error occurred, then we are logged in
			setIsLoggedIn(true);
		}
		if (isLoggedIn) {
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
                			<Route
                				key="/"
                				path="/"
                				exact
                			>
                				<Redirect to={isLoggedIn ? "/dashboard" : "/login"} />
                			</Route>
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
                			<AuthRoute
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
