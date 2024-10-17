import { sql, db, createClient } from '@vercel/postgres';
import type { Review, Publication, Album } from './definitions';

export async function fetchPublications() {
    try {
        const data = await sql<Publication>`
            SELECT *
            FROM publications`;

        const publications = data.rows;
        return publications;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch publications.')
    }
}

export async function fetchReviews(publication_ids: number[], year: string) {
    const publication_ids_string = publication_ids.join(',');
    const client = createClient();
    await client.connect();
    try {
        const data = await client.query(`
            SELECT *
            FROM reviews
            WHERE publication_id IN (${publication_ids_string}) AND year = ${year}`);
        console.log('I am here as well')
        console.log(data.rows.length);
        const reviews = data.rows;
        return reviews;
    } catch (error) {
        console.error('Database Error:', error)
        throw new Error('Failed to fetch reviews.')
    } finally {
        await client.end();
    }
}

export async function fetchRankings(publication_ids: number[], year: string) {
    const publication_ids_string = publication_ids.join(',');
    const client = createClient();
    await client.connect();
    try {
        const data = await client.query(`
        SELECT t1.id as id, t1.publication_id as publication_id, t1.album_id as album_id, t1.rank as rank, t1.year as year, t2.score as score
        FROM rankings as t1
        LEFT JOIN reviews as t2
        ON t1.album_id = t2.album_id AND t1.publication_id = t2.publication_id
        WHERE t1.publication_id IN (${publication_ids_string}) AND t1.year = ${year}`);
        const rankings = data.rows;
        return rankings;
    } catch (error) {
        console.error('Database Error:', error)
        throw new Error('Failed to fetch rankings.')
    } finally {
        await client.end();
    }
}

// select t1.id as id, t1.publication_id as publication_id, t1.album_id as album_id, t1.rank as rank, t1.year as year, t2.score as score
// from rankings as t1
// left join reviews as t2
// on t1.album_id = t2.album_id
// where t1.publication_id = 19 and t1.year = 2023;

export async function fetchAlbums(album_ids: number[]) {
    const album_ids_string = album_ids.join(',');
    const client = createClient();
    await client.connect();

    try {
        const data = await client.query(`
            SELECT *
            FROM albums
            WHERE id IN (${album_ids_string})`)

        const albums = data.rows;
        return albums;
    } catch (error) {
        console.error('Database Error:', error)
        throw new Error('Failed to fetch albums.')
    } finally {
        await client.end(); // Close the connection
    }
}
