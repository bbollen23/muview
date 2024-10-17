export const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch');
    }
    const data = await res.json();
    console.log('Fetched data:', data); // Log the fetched data
    return data;
};