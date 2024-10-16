import { fetchAlbums } from '@/app/lib/data'; // Adjust path

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const album_ids = searchParams.get('album_ids');
    const album_ids_list = album_ids?.split(',').map(Number);
    if (album_ids_list) {
        const albums = await fetchAlbums(album_ids_list)
        if (albums) {
            return Response.json({ albums })
        }
    } else {
        return Response.json({ albums: [] })
    }
};