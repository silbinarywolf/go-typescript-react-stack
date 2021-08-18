import axios from "axios";
import React, { useState } from "react";

import { FieldHolder } from "~/form/FieldHolder/FieldHolder";
import { useMember } from "~/member/useMember/useMember";
import { Button } from "~/ui/Button/Button";
import { Container } from "~/ui/Container/Container";
import { normalizeError } from "~/util/Fetch";

interface LoginFormValues {
    Email: string;
    Password: string;
}

export default function LoginPage(): JSX.Element {
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
			if (err && err.response && err.response.status === 401) {
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
	}

	return (
		<Container>
			<h1>Login page</h1>
			{(isLoggedIn === true) &&
				<p>You are aleady logged in.</p>
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
						data-testid="loginButton"
					/>
				</form>
			}
		</Container>
	);
}
