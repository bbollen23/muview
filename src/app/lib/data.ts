import { sql, createClient } from '@vercel/postgres';
import type { Publication } from './definitions';

export async function fetchPublications() {
    try {
        const data = await sql<Publication>`
        SELECT p.id AS id, p.name AS name, p.unique_name AS unique_name, p.description AS description, round(avg(r.score) / 10, 2) AS avg_score, count(distinct r.id) AS number_of_reviews
        FROM publications AS p
        LEFT JOIN reviews AS r
        ON p.id = r.publication_id
        GROUP BY p.id, p.name, p.unique_name, p.description
        ORDER BY number_of_reviews desc`;

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


export async function fetchPubYearStats(publication_id: string, years_list: number[]) {
    const years_string = years_list.join(',')
    const client = createClient();
    await client.connect();
    try {
        const data = await client.query(`
        SELECT p.id, round(avg(r.score)/10,2) as avg_score, count(distinct r.id) as number_of_reviews
        FROM publications AS p
        LEFT JOIN reviews as r
        ON p.id = r.publication_id
        WHERE p.id = ${publication_id} AND r.year IN (${years_string})
        GROUP BY p.id
        ORDER BY number_of_reviews desc`);
        const stats = data.rows;
        return stats;
    } catch (error) {
        console.error('Database Error:', error)
        throw new Error('Failed to fetch reviews.')
    } finally {
        await client.end();
    }
}