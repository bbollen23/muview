import { fetchReviews } from '@/app/lib/data'; // Adjust path

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const publication_ids = searchParams.get('publication_ids');
    const year = searchParams.get('year')
    const publication_ids_list = publication_ids?.split(',').map(Number);
    if (publication_ids_list && year) {
        const newReviews = await fetchReviews(publication_ids_list, year);
        if (newReviews) {
            return Response.json({ newReviews })
        }
    } else {
        return Response.json({ newReviews: [] })
    }
};