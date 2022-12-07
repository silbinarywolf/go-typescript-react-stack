import axios from "axios";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { FieldHolder } from "~/form/FieldHolder/FieldHolder";

import { Button } from "~/ui/Button/Button";
import { Container } from "~/ui/Container/Container";
import { normalizeError } from "~/util/Fetch";
import { useMember } from "../useMember/useMember";

interface RegisterFormValues {
    Email: string;
    Password: string;
}

export default function RegisterPage(): JSX.Element {
	const { isLoggedIn } = useMember();
	if (isLoggedIn === true) {
		return <RegisterPageLoggedIn/>;
	}
	return <RegisterPageNotLoggedIn/>;
}


function RegisterPageLoggedIn(): JSX.Element {
	return (
		<Container>
			<h1>Register page</h1>
			<p>You are already logged in.</p>
		</Container>
	);
}

function RegisterPageNotLoggedIn(): JSX.Element {
	const history = useHistory();
	const { setIsLoggedIn } = useMember();
	const [formData, setFormData] = useState<RegisterFormValues>({
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
			resp = await axios.post("/api/member/register", formData);
		} catch (e) {
			setErrorMessage(normalizeError(e));
			return;
		} finally {
			setIsFormSubmitting(false);
		}
		setErrorMessage(resp.data);

		// note(jae): 2022-12-07
		// Disabled as its broken on the backend somehow.
		// await setIsLoggedIn(true);
		// const redirectToURL = getBackURLOrDashboard();
		// history.push(redirectToURL);
	}

	return (
		<Container>
			<h1>Register page</h1>
			<form onSubmit={onFormSubmit}>
				{errorMessage !== "" && (
					<div>
						<p>{errorMessage}</p>
					</div>
				)}
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
					label="Register"
					type="submit"
					disabled={isFormSubmitting}
				/>
			</form>
		</Container>
	);
}