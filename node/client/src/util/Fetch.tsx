import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

/**
 * normalizeError will take a raw caught error and normalize it into a readable string.
 */
export function normalizeError(err: AxiosError | Error | string): string {
    if (err === undefined ||
        err === null) {
        return '';
    }
    if (typeof err === 'string') {
        return err;
    }
    if (err.message) {
        return err.message;
    }
    return err.toString();
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
}
 */