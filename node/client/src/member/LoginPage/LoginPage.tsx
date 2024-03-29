import axios from "axios";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";

import { FieldHolder } from "~/form/FieldHolder/FieldHolder";
import { useMember } from "~/member/useMember/useMember";
import { Button } from "~/ui/Button/Button";
import { Container } from "~/ui/Container/Container";
import { extractStatusCode, getBackURLOrDashboard, normalizeError } from "~/util/Fetch";

interface LoginFormValues {
    Email: string;
    Password: string;
}

/**
 * getSearchParams extracts parameters after the ? in the URL.
 *
 * We use our own implementation to have stronger browser support and to support
 * hash-style URLs, ie. "localhost:8080/#/home?myparam=1"
 */
function getSearchParams(queryString: string): {[key: string]: string | undefined} {
	const params: {[key: string]: string} = {};
	queryString = queryString.replace(/.*?\?/,"");
	if (queryString.length > 0) {
		const keyValPairs = queryString.split("&");
		for (const pairNum in keyValPairs) {
			if (!Object.prototype.hasOwnProperty.call(keyValPairs, pairNum)) {
				continue;
			}
			const keyAndValue = keyValPairs[pairNum].split("=");
			const key = keyAndValue[0];
			if (!key.length) {
				continue;
			}
			params[key] = decodeURIComponent(keyAndValue[1]);
		}
	}
	return params;
}

export default function LoginPage(): JSX.Element {
	const history = useHistory();
	const { isLoggedIn, setIsLoggedIn } = useMember();
	const [formData, setFormData] = useState<LoginFormValues>({
		Email: "",
		Password: "",
	});
	const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (isFormSubmitting) {
			return;
		}
		setIsFormSubmitting(true);
		setErrorMessage("");
		let resp;
		try {
			resp = await axios.post("/api/member/login", formData, {withCredentials: true});
		} catch (err) {
			if (extractStatusCode(err) === 401) {
				// If unauthorized, ensure user is logged out
				await setIsLoggedIn(false);
			}
			setErrorMessage(normalizeError(err));
			return;
		} finally {
			setIsFormSubmitting(false);
		}
		await setIsLoggedIn(true);
		setErrorMessage(resp.data);

		const redirectToURL = getBackURLOrDashboard();
		history.push(redirectToURL);
	}

	return (
		<Container>
			<h1>Login page</h1>
			{(isLoggedIn === true) &&
				<p>You are already logged in.</p>
			}
			{(isLoggedIn === false) &&
				<form onSubmit={onFormSubmit}>
					{errorMessage !== "" &&
						<div>
							<p>{errorMessage}</p>
						</div>
					}
					<FieldHolder
						id="Form_Email"
						label="Email"
					>
						<input
							id="Form_Email"
							name="Email"
							type="text"
							value={formData.Email}
							onChange={(e) => {
								const value = e.target.value;
								setFormData((prevFormData) => {
									return {
										...prevFormData,
										Email: value,
									};
								});
							}}
						/>
					</FieldHolder>
					<FieldHolder
						id="Form_Password"
						label="Password"
					>
						<input
							id="Form_Password"
							name="Password"
							type="password"
							value={formData.Password}
							onChange={(e) => {
								const value = e.target.value;
								setFormData((prevFormData) => {
									return {
										...prevFormData,
										Password: value,
									};
								});
							}}
						/>
					</FieldHolder>
					<Button
						label="Login"
						type="submit"
						disabled={isFormSubmitting}
					/>
					<div>
						<Link to="register">
							New? Register a new account by clicking here.
						</Link>
					</div>
					<div>
						<Link to="examplemodule">
							Lets just go to the examplemodule page.
						</Link>
					</div>
				</form>
			}
		</Container>
	);
}
