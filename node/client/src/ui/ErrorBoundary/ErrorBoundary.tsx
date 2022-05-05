import React from "react";

interface Props {
}

interface State {
	error: Error | undefined;
}

export class ErrorBoundary extends React.Component<Props, State> {
	state: State = {
		error: undefined,
	};

	static getDerivedStateFromError(error: Error): State {
		return {
			error: error,
		};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		// You can also log the error to an error reporting service
		// logErrorToMyService(error, errorInfo);
	}

	render(): React.ReactNode {
		const {
			error,
		} = this.state;
		if (error) {
			return (
				<React.Fragment>
					<h1>Something went wrong.</h1>
					<p>{String(error)}</p>
				</React.Fragment>
			);
		}

		return this.props.children;
	}
}
