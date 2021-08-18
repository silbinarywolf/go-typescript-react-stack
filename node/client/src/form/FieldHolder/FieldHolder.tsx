import React from "react";

import styles from "./FieldHolder.module.css";

interface FieldHolderProps {
    label: string;
    id: string;
    children?: React.ReactNode
}

export function FieldHolder(props: FieldHolderProps): JSX.Element {
	const {
		label,
		id,
		children,
	} = props;
	return (
		<div
			className={[
				styles.holder,
			].join(" ")}
		>
			<label
				className={[
					styles.label,
				].join(" ")}
				htmlFor={id}
			>
				{label}
			</label>
			{children}
		</div>
	);
}