import { fetchReviews } from '@/app/lib/data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const publication_ids = searchParams.get('publication_ids');
    const years = searchParams.get('years')

    const publication_ids_list = publication_ids?.split(',').map(Number);
    const years_list = years?.split(',').map(Number);
    if (publication_ids_list && years_list) {
        const newReviews = await fetchReviews(publication_ids_list, years_list);
        console.log(newReviews);
        if (newReviews) {
            return Response.json({ newReviews })
        }
    } else {
        return Response.json({ newReviews: [] })
    }
};