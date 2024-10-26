import { AlbumWithScore, Review, Publication } from "./definitions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isReviewArray(value: any[]): value is Review[] {
    return value.every(
        (item) => {
            return (
                typeof item.id === 'number' &&
                typeof item.publication_id === 'number' &&
                typeof item.album_id === 'number' &&
                (typeof item.score === 'number' || typeof item.score === 'string') &&
                typeof item.review_url === 'string' &&
                typeof item.year === 'number'
            )
        }

    );
}


export function downloadCsv(sortedAlbumList: AlbumWithScore[], selectedPublications: Publication[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const replacer = (key: string, value: any) => {
        if (value === null) {
            return '';
        }
        if (Array.isArray(value)) {
            if (value.length > 0 && isReviewArray(value)) {
                const reviewListString = value.map((review: Review) => {
                    const publicationName = selectedPublications.find((publication: Publication) => publication.id === review.publication_id)?.name
                    return `${publicationName} - ${review.score}`
                }).join('|');
                return reviewListString;
            }
            return value.join('|'); // Join array elements with "|"
        }
        return value
    }; // Handle null values

    // Convert your data to CSV format
    const headers = ['album_title', 'artists', 'genres', 'subgenres', 'release_date', 'avg_score', 'reviews'];
    const csvRows = [
        headers.join(','), // Header row
        ...sortedAlbumList.map(row => headers.map(field => JSON.stringify(row[field], replacer)).join(',')) // Data rows
    ].join('\n');

    // Create a Blob from the CSV
    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    // Create a link and simulate a click to download the CSV file
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace(/T/g, '-').replace(/:/g, '-'); // Format: YYYY-MM-DD-HH-MM
    link.download = `muview-albums-${formattedDate}.csv`;
    link.click();

    // Clean up the object URL after download
    URL.revokeObjectURL(url);
}
