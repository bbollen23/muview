'use server'
import { createClient } from '@vercel/postgres';


export async function deleteAlbums(email: string, album_ids: number[]) {
    const client = createClient();
    await client.connect();
    const query = `DELETE FROM user_albums WHERE user_email = '${email}' and album_id IN (${album_ids.join(',')})`
    await client.query(query)
    return album_ids;
}

export async function addAlbums(email: string, album_ids: number[]) {
    const client = createClient();
    await client.connect();

    const album_ids_string = album_ids.map(album_id => `('${email}', ${album_id})`).join(', ')

    const query = `INSERT INTO user_albums (user_email, album_id) VALUES ${album_ids_string}`

    await client.query(query)

    return album_ids;
}
