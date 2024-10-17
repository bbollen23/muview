export interface Publication {
    id: number,
    name: string,
    unique_name: string,
    description: string
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



export interface Album {
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
    youtube_url: string,
    reviews?: Review[]
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




/**
 * Examples
 * 
 * selectedAlbumIds : {2024: { 1: { '7,8' : [ bar_selected_reviews_for_pub_1_2024 ] } } }
 * selectedAlbumIdsRankings: {2024: { 1: [ brushed_rankings_for_pub_1_2024 ] } }
 * 
 * 
 * 
 */