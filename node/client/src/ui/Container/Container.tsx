import React, { Children } from "react";

import styles from "./Container.module.css";

interface ContainerProps {
	children: React.ReactNode;
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
