
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export function useUser() {
    const { data, error, mutate } = useSWR('/api/auth/session', fetcher);

    return {
        user: data?.user,
        isLoading: !error && !data,
        isError: error,
        mutateUser: mutate,
    };
}
