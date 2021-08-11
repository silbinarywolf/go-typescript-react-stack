import axios from "axios";
import React, { useState } from "react";
import { FieldHolder } from "~/form/FieldHolder/FieldHolder";

import { Button } from "~/ui/Button/Button";
import { Container } from "~/ui/Container/Container";
import { normalizeError } from "~/util/Fetch";

interface RegisterFormValues {
    Username: string;
    Password: string;
}

export default function MemberRegisterPage(): JSX.Element {
    const [formData, setFormData] = useState<RegisterFormValues>({
        Username: '',
        Password: '',
    })
    const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isFormSubmitting) {
            return;
        }
        setIsFormSubmitting(true);
        setErrorMessage('');
        try {
            await axios.post('/api/register', formData);
        } catch (e) {
            setErrorMessage(normalizeError(e));
            return;
        } finally {
            setIsFormSubmitting(false);
        }
    }

	return (
		<Container>
			<h1>Register page</h1>
            <form onSubmit={onFormSubmit}>
                {errorMessage !== '' && 
                    <div>
                        <p>{errorMessage}</p>
                    </div>
                }
                <FieldHolder
                    id="Form_Username"
                    label="Username"
                >
                    <input
                        id="Form_Username"
                        name="Username"
                        type="text"
                        onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prevFormData) => {
                                return {
                                    ...prevFormData,
                                    Username: value,
                                }
                            })
                        }}
                        value={formData.Username}
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
                        onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prevFormData) => {
                                return {
                                    ...prevFormData,
                                    Password: value,
                                }
                            })
                        }}
                        value={formData.Password}
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
