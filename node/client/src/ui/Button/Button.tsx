import React from "react";

import styles from "./Button.module.css";

type ButtonType = "button" | "submit";

interface ButtonProps {
	label: string;
	type?: ButtonType;
	disabled?: boolean;
	"data-testid"?: string;
}

export function Button(props: ButtonProps): JSX.Element {
	const {
		label,
		disabled,
		type,
	} = props;
	return (
		<button
			type={type ? type : "button"}
			className={[
				styles.button,
			].join(" ")}
			disabled={disabled}
			data-testid={props["data-testid"]}
		>
			{label}
		</button>
	);
}
