export interface Publication {
    id: number,
    name: string,
    unique_name: string,
    description: string
}

export interface BinnedAlbums {
    [key: string]: Album[]
}

export type AlbumsSelected = Record<number, BinnedAlbums>;
export type AlbumsSelectedRankings = Record<number, Album[]>;

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