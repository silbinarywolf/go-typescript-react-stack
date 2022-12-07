
/**
 * extractStatusCode will take an Error object or Response and give back the status code if it has one.
 * If it does not have a status code, it will return 0.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function extractStatusCode(errOrResponse: any): number {
	if (typeof errOrResponse === "object" &&
		errOrResponse &&
		errOrResponse.response &&
		errOrResponse.response.status &&
		typeof errOrResponse.response.status === "number") {
		return errOrResponse.response.status;
	}
	if (typeof errOrResponse === "object" &&
		errOrResponse &&
		errOrResponse.status &&
		typeof errOrResponse.status === "number") {
		return errOrResponse.status;
	}
	return 0;
}

/**
 * normalizeError will take an Error object and normalize it into a readable string.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function normalizeError(err: any): string {
	if (err === undefined || err === null) {
		return "";
	}
	switch (typeof err) {
	case "string":
		return err;
	case "number":
		return String(err);
	}
	if (err.response && err.response.data && typeof err.response.data === "string" && err.response.data.trim() !== "") {
		// get error message from backend response (AxiosError)
		return err.response.data;
	}
	if (err.message) {
		// use default error message
		// - if this is used for response errors, then you'd get an error like "Request failed with status code 500"
		return err.message;
	}
	// unexpected case, just try to convert the error to a string naively
	return String(err);
}

/**
 * getSearchParams extracts parameters after the ? in the URL.
 *
 * We use our own implementation to have stronger browser support and to support
 * hash-style URLs, ie. "localhost:8080/#/home?myparam=1"
*/
function getSearchParams(queryString: string): {[key: string]: string | undefined} {
	const params: {[key: string]: string} = {};
	queryString = queryString.replace(/.*?\?/,"");
	if (queryString.length > 0) {
		const keyValPairs = queryString.split("&");
		for (const pairNum in keyValPairs) {
			if (!Object.prototype.hasOwnProperty.call(keyValPairs, pairNum)) {
				continue;
			}
			const keyAndValue = keyValPairs[pairNum].split("=");
			const key = keyAndValue[0];
			if (!key.length) {
				continue;
			}
			params[key] = decodeURIComponent(keyAndValue[1]);
		}
	}
	return params;
}

export function getBackURLOrDashboard(): string {
	// Handle redirecting the user after login
	const searchParams = getSearchParams(location.search);
	if (searchParams && searchParams.back_url) {
		// Go to expected URL
		//
		// note(jae): 2021-08-19
		// I've tested putting an outside URL in the "back_url" and the react-router-dom
		// library seems to keep URL navigation local to the current website, so this
		// can't be abused.
		// - input:  http://localhost:9000/#/login?back_url=www.google.com/dashboard
		// - output: http://localhost:9000/#/www.google.com/dashboard
		return searchParams.back_url;
	}
	return "/dashboard"
}
