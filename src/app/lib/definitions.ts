export interface Publication {
    id: number,
    name: string,
    unique_name: string,
    description: string,
    avg_score?: number,
    number_of_reviews?: number
}


export interface BinnedAlbums {
    [key: string]: Album[]
}

export interface BinnedIds {
    [key: string]: number[]
}

export type AlbumsSelected = Record<number, BinnedAlbums>;
export type AlbumsSelectedRankings = Record<number, Album[]>;

// Year, PubId, Bin, Album_ids
export type AlbumIdsSelected = Record<number, Record<number, BinnedIds>>;
// Year, PubId, Album_ids
export type AlbumIdsSelectedRanking = Record<number, Record<number, number[]>>;

//Year, Pub_ID, Reviews
export type CurrentReviews = Record<number, Record<number, Review[]>>;
export type CurrentRankings = Record<number, Record<number, Ranking[]>>;


export interface BarChartMetadata {
    stepSize: number,
    name?: string,
    years?: number[]
}

// Houses metadata for each bar chart, segmented by year then pub id
export type CurrentBarChartMetadata = Record<number, Record<number, BarChartMetadata>>;



export type FilterType = 'upset-filter' | 'upset-set-filter' | 'genre-filter';

export interface Filter {
    id: string,
    groupLabels: string[],
    albumIds: number[],
    type?: FilterType
}

export interface Album {
    [key: string]: string | number | null | string[] | undefined | Review[]; // Adjust types to match your data
    id: number,
    album_title: string,
    artists: string[],
    genres: string[],
    subgenres: string[],
    release_date: string,
    url?: string,
    spotify_url?: string,
    apple_music_url?: string,
    bandcamp_url?: string,
    soundcloud_url?: string,
    youtube_url: string
}

export interface AlbumWithScore extends Album {
    avg_score: number;
    reviews: Review[];
}

export interface Review {
    id: number,
    publication_id: number,
    album_id: number,
    score: number,
    review_url: string,
    year: number
}

export interface Ranking {
    id: number,
    publication_id: number,
    album_id: number,
    rank: number,
    year: number,
    score: number // Generated during SQL query to get original score
}

// Basic user, not anything else added yet.
export interface User {
    email: string,
    password: string
}




/**
 * Examples
 * 
 * selectedAlbumIds : {2024: { 1: { '7,8' : [ bar_selected_reviews_for_pub_1_2024 ] } } }
 * selectedAlbumIdsRankings: {2024: { 1: [ brushed_rankings_for_pub_1_2024 ] } }
 * 
 * 
 * 
 */