import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import z from "zod";

import { FieldHolder } from "~/form/FieldHolder/FieldHolder";
import { useMember } from "~/member/useMember/useMember";
import { Button } from "~/ui/Button/Button";

import { Container } from "~/ui/Container/Container";
import { extractStatusCode, normalizeError } from "~/util/Fetch";

const todoItemItemAPIDecoder = z.object({
	title: z.string(),
	description: z.string(),
});

type TodoItemItemAPI = z.infer<typeof todoItemItemAPIDecoder>;

const todoListResponseDecoder = z.object({
	items: z.nullable(z.array(todoItemItemAPIDecoder)),
});

type TodoListResponse = z.infer<typeof todoListResponseDecoder>;

export default function ExampleModulePage(): JSX.Element {
	const { setIsLoggedIn } = useMember();
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [pageData, setPageData] = useState<TodoListResponse | undefined>(undefined);

	const loadPage = useCallback(async () => {
		// Clear existing error message
		setErrorMessage("");

		let data: TodoListResponse;
		try {
			const resp = await axios.get("/api/examplemodule/list", {withCredentials: true});
			data = todoListResponseDecoder.parse(resp.data);
		} catch (err) {
			if (extractStatusCode(err) === 401) {
				// If unauthorized, ensure user is logged out
				await setIsLoggedIn(false);
			}
			setErrorMessage(normalizeError(err));
			return;
		}
		setPageData(data);
	}, [setIsLoggedIn]);

	// On page-load do this...
	useEffect(() => {
		if (isLoading === true) {
			return;
		}
		setIsLoading(true);
		loadPage();
	}, [isLoading, loadPage]);

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
						<h2>Todo items</h2>
						{(pageData.items === null || pageData.items.length === 0) && (
							<p>No todo items currently...</p>
						)}
						{(pageData.items !== null && pageData.items.map((item: TodoItemItemAPI, i) => {
							return (
								<TodoItem
									key={i}
									title={item.title}
									description={item.description}
								/>
							);
						}))}
					</div>
					<ExampleModuleForm
						loadPage={loadPage}
					/>
				</React.Fragment>
			)}
		</Container>
	);
}

interface TodoItemProps {
    title: string;
    description: string;
}

function TodoItem({
	title,
	description,
}: TodoItemProps) {
	return (
		<div>
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	);
}

interface ExampleModuleFormProps {
    loadPage: () => Promise<void>;
}

interface ExampleModuleFormValues {
    Title: string;
    Description: string;
}

function ExampleModuleForm({
	loadPage,
}: ExampleModuleFormProps): JSX.Element {
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
			resp = await axios.post("/api/examplemodule/add", formData, {withCredentials: true});
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

		await loadPage();
	}

	return (
		<React.Fragment>
			<h2>Add new todo item</h2>
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
									Title: value,
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
		</React.Fragment>
	);
}