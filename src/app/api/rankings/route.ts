import { fetchRankings } from '@/app/lib/data'; // Adjust path


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const publication_ids = searchParams.get('publication_ids');
    const year = searchParams.get('year')
    const publication_ids_list = publication_ids?.split(',').map(Number);
    if (publication_ids_list && year) {
        const newRankings = await fetchRankings(publication_ids_list, year);
        if (newRankings) {
            return Response.json({ newRankings })
        }
    } else {
        return Response.json({ newRankings: [] })
    }
};