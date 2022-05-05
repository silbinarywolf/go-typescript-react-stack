import React from "react";

import Main from "~/core/Main/Main";
import { ErrorBoundary } from "~/ui/ErrorBoundary/ErrorBoundary";
import { MemberProvider } from "~/member/useMember/useMember";

interface GlobalProvidersProps {
	children?: React.ReactNode;
}

// GlobalProviders are were all providers that need to be accessed across the entire application
// go.
//
// note(jae): 2021-08-17
// We put our providers in a seperate function so that if/when we need to add more in the future
// it's clear that only the providers were updated, not routes/etc within the main "App" render function
function GlobalProviders({children}: GlobalProvidersProps): JSX.Element {
	return (
		<MemberProvider>
			{children}
		</MemberProvider>
	);
}

export default function App(): JSX.Element {
	return (
		<React.StrictMode>
			<ErrorBoundary>
				<GlobalProviders>
					{
					// note(jae): 2021-08-18
					// The reasoning for having a seperate "Main" component is so that
					// it has access to any global state providers and if it has an error, it's caught
					// by the error boundary
					}
					<Main/>
				</GlobalProviders>
			</ErrorBoundary>
		</React.StrictMode>
	);
}
