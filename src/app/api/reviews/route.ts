import { fetchReviews, fetchRankings } from '@/app/lib/data'; // Adjust path

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const publication_ids = searchParams.get('publication_ids');
    const publication_ids_list = publication_ids?.split(',').map(Number);
    if (publication_ids_list) {
        const newReviews = await fetchReviews(publication_ids_list);
        const newRankings = await fetchRankings(publication_ids_list);
        if (newReviews && newRankings) {
            return Response.json({ newReviews, newRankings })
        }
    } else {
        return Response.json({ newReviews: [], newRankings: [] })
    }
};