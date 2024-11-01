import { fetchUserAlbums } from '@/app/lib/data'; // Adjust path

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (email) {
        const albums = await fetchUserAlbums(email)
        if (albums) {
            return Response.json({ albums })
        }
    } else {
        return Response.json({ albums: [] })
    }
};

