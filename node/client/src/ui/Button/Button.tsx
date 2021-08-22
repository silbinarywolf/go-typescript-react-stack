import React from "react";

import styles from "./Button.module.css";

type ButtonType = "button" | "submit";

interface ButtonProps {
	label: string;
	type?: ButtonType;
	disabled?: boolean;
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	"data-testid"?: string;
}

export function Button(props: ButtonProps): JSX.Element {
	const {
		label,
		disabled,
		type,
		onClick,
	} = props;
	return (
		<button
			type={type ? type : "button"}
			className={[
				styles.button,
			].join(" ")}
			disabled={disabled}
			onClick={onClick}
			data-testid={props["data-testid"]}
		>
			{label}
		</button>
	);
}
