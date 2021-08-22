import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";

/**
 * errorToStatusCode will take an Error object and give back the status code if it has one.
 * If it does not have a status code, it will return 0.
 */
export function errorToStatusCode(err: AxiosError): number {
	if (err &&
        err.response &&
        err.response.status &&
        typeof err.response.status === "number") {
		return err.response.status;
	}
	return 0;
}

/**
 * normalizeError will take an Error object and normalize it into a readable string.
 */
export function normalizeError(err: (AxiosError & Error) | string): string {
	if (err === undefined ||
        err === null) {
		return "";
	}
	if (typeof err === "string") {
		return err;
	}
	if (err.response && err.response.data && typeof err.response.data === "string") {
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

// note(jae): 2021-08-11
// look at exploring an "easy to use hook" if need be.
/* export function useFetch(url: string) {
  const [data, setData] = useState<{} | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setIsLoading(true)
    setData(undefined);
    setError('');
    const source = axios.CancelToken.source();
    axios.get(url, { cancelToken: source.token }).then(res => {
        const data = res.data.content;
        if (data === undefined ||
            data === null) {
            return;
        }
        setData(data);
    })
    .catch((err) => {
        setError(getErrorMessage(err));
    })
    .finally(() => {
        setIsLoading(false);
    })
    return () => {
        source.cancel();
    }
  }, [url]);
  return { data, isLoading, error }
}*/
