import { fetchRankings } from '@/app/lib/data'; // Adjust path


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const publication_ids = searchParams.get('publication_ids');
    const years = searchParams.get('years')

    const publication_ids_list = publication_ids?.split(',').map(Number);
    const years_list = years?.split(',').map(Number);
    if (publication_ids_list && years_list) {
        const newRankings = await fetchRankings(publication_ids_list, years_list);
        if (newRankings) {
            return Response.json({ newRankings })
        }
    } else {
        return Response.json({ newRankings: [] })
    }
};