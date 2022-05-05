
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
