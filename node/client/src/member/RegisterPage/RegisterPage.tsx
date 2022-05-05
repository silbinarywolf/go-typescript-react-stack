import axios from "axios";
import React, { useState } from "react";
import { FieldHolder } from "~/form/FieldHolder/FieldHolder";

import { Button } from "~/ui/Button/Button";
import { Container } from "~/ui/Container/Container";
import { normalizeError } from "~/util/Fetch";

interface RegisterFormValues {
    Email: string;
    Password: string;
}

export default function RegisterPage(): JSX.Element {
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
					data-testid="registerButton"
				/>
			</form>
		</Container>
	);
}
