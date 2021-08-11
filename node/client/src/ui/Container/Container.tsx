import React, { Children } from "react";

import styles from "./Container.module.css";

interface ContainerProps {
	children: JSX.Element | JSX.Element[];
}

export function Container(props: ContainerProps): JSX.Element {
	return (
		<div
			className={[
				styles.container,
			].join(" ")}
		>
			{props.children}
		</div>
	);
}
