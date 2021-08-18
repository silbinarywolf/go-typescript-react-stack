import React, { createContext, useState } from "react";
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

export function MemberProvider({children}: MemberProviderProps): JSX.Element {
	const [isLoggedIn, _setIsLoggedIn] = useState<boolean>(false);

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
	return (
		<MemberContext.Provider 
			value={consumerValue}
		>
			{children}
		</MemberContext.Provider>
	);
}
