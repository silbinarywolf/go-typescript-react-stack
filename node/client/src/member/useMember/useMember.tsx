import React, { createContext, useEffect, useState } from "react";
import localforage from "localforage";

const MemberContext = createContext<MemberContextProps | undefined>(undefined);

export function useMember(): MemberContextProps {
	const context = React.useContext(MemberContext);
	if (context === undefined) {
		throw new Error("useMember must be used within a MemberProvider");
	}
	return context;
}

interface MemberContextProps {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => Promise<void>;
}

interface MemberProviderProps {
    children?: React.ReactNode;
}

export function MemberProvider({children}: MemberProviderProps): JSX.Element | null {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [hasLoaded, setHasLoaded] = useState(false);
	const [isLoggedIn, _setIsLoggedIn] = useState<boolean>(false);

	// On MemberProvider load, update internal state based on local storage
	useEffect(() => {
		if (isLoading === true) {
			return;
		}
		async function load() {
			try {
				const isLoggedIn = await localforage.getItem("isLoggedIn");
				_setIsLoggedIn(isLoggedIn === true);
			} finally {
				setHasLoaded(true);
			}
		}
		setIsLoading(true);
		load();
	}, [isLoading])

	async function setIsLoggedIn(value: boolean): Promise<void> {
		if (value !== true) {
			await localforage.removeItem("isLoggedIn");
			_setIsLoggedIn(false);
			return;
		}
		await localforage.setItem("isLoggedIn", true);
		_setIsLoggedIn(true);
	}

	const consumerValue = {
		isLoggedIn: isLoggedIn,
		setIsLoggedIn: setIsLoggedIn,
	};
	if (hasLoaded === false) {
		// Render nothing underneath this until we've loaded our login state
		return null;
	}
	return (
		<MemberContext.Provider
			value={consumerValue}
		>
			{children}
		</MemberContext.Provider>
	);
}
