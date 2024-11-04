import { fetchAlbumReviews } from '@/app/lib/data';


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const album_id = searchParams.get('album_id')

    if (album_id) {
        const albumReviews = await fetchAlbumReviews(album_id);
        if (albumReviews) {
            return Response.json({ albumReviews })
        }
    } else {
        return Response.json({ albumReviews: [] })
    }
};