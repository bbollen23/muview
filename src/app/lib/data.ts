import { sql, createClient } from '@vercel/postgres';
import type { Publication } from './definitions';

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

export async function fetchReviews(publication_ids: number[], years_list: number[]) {
    const publication_ids_string = publication_ids.join(',');
    const years_string = years_list.join(',')
    const client = createClient();
    await client.connect();
    try {
        const data = await client.query(`
            SELECT *
            FROM reviews
            WHERE publication_id IN (${publication_ids_string}) AND year IN (${years_string})`);
        const reviews = data.rows;
        console.log(reviews)
        return reviews;
    } catch (error) {
        console.error('Database Error:', error)
        throw new Error('Failed to fetch reviews.')
    } finally {
        await client.end();
    }
}

export async function fetchRankings(publication_ids: number[], years_list: number[]) {
    const publication_ids_string = publication_ids.join(',');
    const years_string = years_list.join(',')

    const client = createClient();
    await client.connect();
    try {
        const data = await client.query(`
        SELECT t1.id as id, t1.publication_id as publication_id, t1.album_id as album_id, t1.rank as rank, t1.year as year, t2.score as score
        FROM rankings as t1
        LEFT JOIN reviews as t2
        ON t1.album_id = t2.album_id AND t1.publication_id = t2.publication_id
        WHERE t1.publication_id IN (${publication_ids_string}) AND t1.year IN (${years_string})`);
        const rankings = data.rows;
        return rankings;
    } catch (error) {
        console.error('Database Error:', error)
        throw new Error('Failed to fetch rankings.')
    } finally {
        await client.end();
    }
}


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

export async function fetchGenres(album_ids: number[]) {
    const album_ids_string = album_ids.join(',');
    const client = createClient();
    await client.connect();

    try {
        const data = await client.query(`
            SELECT id, genres, subgenres
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
