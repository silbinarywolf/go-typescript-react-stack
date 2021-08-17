import axios from "axios";
import React, { useState } from "react";
import { FieldHolder } from "~/form/FieldHolder/FieldHolder";

import { Button } from "~/ui/Button/Button";
import { Container } from "~/ui/Container/Container";
import { normalizeError } from "~/util/Fetch";

interface LoginFormValues {
    Email: string;
    Password: string;
}

export default function MemberLoginPage(): JSX.Element {
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
		} catch (e) {
			setErrorMessage(normalizeError(e));
			return;
		} finally {
			setIsFormSubmitting(false);
		}
		setErrorMessage(resp.data)
	}

	async function onNavSubmit(e: React.MouseEvent<HTMLButtonElement>) {
		let resp;
		try {
			resp = await axios.post("/api/member/menu", formData, {withCredentials: true});
		} catch (e) {
			setErrorMessage(normalizeError(e));
			return;
		} finally {
			setIsFormSubmitting(false);
		}
	}

	return (
		<Container>
			<h1>Login page</h1>
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
				<Button
					label="Test Nav Load"
					data-testid="navButton"
					onClick={onNavSubmit}
				/>
			</form>
		</Container>
	);
}
