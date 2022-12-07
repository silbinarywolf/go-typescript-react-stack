import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import z from "zod"

import { FieldHolder } from "~/form/FieldHolder/FieldHolder";
import { useMember } from "~/member/useMember/useMember";
import { Button } from "~/ui/Button/Button";

import { Container } from "~/ui/Container/Container";
import { extractStatusCode, normalizeError } from "~/util/Fetch";

const todoItemItemAPIDecoder = z.object({
    title: z.string(),
    description: z.string(),
})

type TodoItemItemAPI = z.infer<typeof todoItemItemAPIDecoder>;

const todoListResponseDecoder = z.object({
    items: z.nullable(z.array(todoItemItemAPIDecoder)),
})

type TodoListResponse = z.infer<typeof todoListResponseDecoder>;

export default function ExampleModulePage(): JSX.Element {
    const { setIsLoggedIn } = useMember();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [pageData, setPageData] = useState<TodoListResponse | undefined>(undefined);

    const loadPage = useCallback(async () => {
        // Clear existing error message
        setErrorMessage('');

        let data: TodoListResponse;
        try {
            const resp = await axios.get("/api/examplemodule/list", {withCredentials: true});
            data = todoListResponseDecoder.parse(resp.data)
        } catch (err) {
            if (extractStatusCode(err) === 401) {
				// If unauthorized, ensure user is logged out
				await setIsLoggedIn(false);
                return;
			}
            setErrorMessage(normalizeError(err));
            return;
        }
        setPageData(data);
    }, [])

    // On page-load do this...
    useEffect(() => {
        if (isLoading === true) {
            return;
        }
        setIsLoading(true);
        loadPage();
    }, [isLoading, loadPage])

	return (
		<Container>
			<h1>Example Module</h1>
            {errorMessage !== "" && (
                <div>
                    <p>{errorMessage}</p>
                </div>
            )}
            {(errorMessage === "" && pageData === undefined) && (
                <p>Loading todo list items...</p>
            )}
            {(pageData !== undefined) && (
                <React.Fragment>
                    <div>
                        <h2>List items</h2>
                        {(pageData.items === null || pageData.items.length === 0) && (
                            <p>No todo items</p>
                        )}
                        {(pageData.items !== null && pageData.items.map((item: TodoItemItemAPI, i) => {
                            return (
                                <div key={i}>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            )
                        }))}
                    </div>
                    <h2>Add new todo item</h2>
                    <ExampleModuleForm/>
                </React.Fragment>
            )}
		</Container>
	);
}

interface ExampleModuleFormValues {
    Title: string;
    Description: string;
}

function ExampleModuleForm(): JSX.Element {
    const { setIsLoggedIn } = useMember();
    const [formData, setFormData] = useState<ExampleModuleFormValues>({
		Title: "",
		Description: "",
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
			resp = await axios.post("/api/examplemodule/call", formData, {withCredentials: true});
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
		setErrorMessage(resp.data);
	}

    return (
        <form onSubmit={onFormSubmit}>
            {errorMessage !== "" && (
                <div>
                    <p>{errorMessage}</p>
                </div>
            )}
            <FieldHolder
                id="Form_Title"
                label="Title"
            >
                <input
                    id="Form_Title"
                    name="Title"
                    type="text"
                    value={formData.Title}
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
                id="Form_Description"
                label="Description"
            >
                <textarea
                    id="Form_Description"
                    name="Description"
                    value={formData.Description}
                    onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prevFormData) => {
                            return {
                                ...prevFormData,
                                Description: value,
                            };
                        });
                    }}
                />
            </FieldHolder>
            <Button
                label="Submit"
                type="submit"
                disabled={isFormSubmitting}
            />
        </form>
    );
}