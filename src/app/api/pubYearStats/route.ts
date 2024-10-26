import { fetchPubYearStats } from '@/app/lib/data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const publication_id = searchParams.get('publication_id');
    const years = searchParams.get('years')

    const years_list = years?.split(',').map(Number);
    if (publication_id && years_list) {
        const newStats = await fetchPubYearStats(publication_id, years_list);
        if (newStats) {
            return Response.json({ newStats })
        }
    } else {
        return Response.json({ newStats: [] })
    }
};