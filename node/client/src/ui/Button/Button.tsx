import React from "react";

import styles from "./Button.module.css"

interface ButtonProps {
	label: string;
	'data-testid'?: string;
}

export function Button(props: ButtonProps): JSX.Element {
	const {
		label
	} = props;
	return (
		<button
			type="button"
			className={[
				styles.button,
			].join(' ')}
			data-testid={props['data-testid']}
		>
			{label}
		</button>
	)
}
