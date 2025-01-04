import { fetchRankings } from '@/app/lib/data'; // Adjust path
import { FetchRankingsResult } from '@/app/lib/definitions';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const publication_ids = searchParams.get('publication_ids');
    const years = searchParams.get('years')
    const hidden = searchParams.get('hidden');

    const publication_ids_list = publication_ids?.split(',').map(Number);
    const years_list = years?.split(',').map(Number);
    if (publication_ids_list && years_list) {
        const newRankings = await fetchRankings(publication_ids_list, years_list);
        if (newRankings) {
            console.log(hidden)
            console.log(hidden)
            if (!(hidden?.toLowerCase() === 'true')) {
                const tempData = newRankings.map((entry: FetchRankingsResult) => { return entry.score === null ? { ...entry, score: "-10" } : entry })
                return Response.json({ newRankings: tempData, origRankings: newRankings })
            }
            const tempData = newRankings.filter((entry: FetchRankingsResult) => entry.score)
            return Response.json({ newRankings: tempData, origRankings: newRankings })


        }
    } else {
        return Response.json({ newRankings: [] })
    }
};