import { createStore } from 'zustand/vanilla'
import type { AlbumsSelected, Publication, Review, Album, Ranking, AlbumsSelectedRankings } from '@/app/lib/definitions';


export type DataStoreState = {
    year: number;
    publicationsSelected: Publication[];
    reviews: Record<number, Review[]>;
    albums: Album[];
    albumsSelected: AlbumsSelected;
    loading: boolean;
    loadingAlbums: boolean;
    chartColorScheme: string[];
    rankings: Record<number, Ranking[]>;
    albumsSelectedRankings: AlbumsSelectedRankings;
}


export type DataStoreActions = {
    addPublication: (publication: Publication) => void;
    removePublication: (publication: Publication) => void;
    addReviews: (reviews: Review[]) => void;
    removeReviews: (pub_id: number) => void;
    setLoading: (loading: boolean) => void;
    addAlbums: (newAlbums: Album[], bin0: number, bin1: number, publication_id: number) => void;
    removeAlbums: (bin0: number, bin1: number, publication_id: number) => void;
    setLoadingAlbums: (loadingAlbums: boolean) => void;
    addRankings: (rankings: Ranking[]) => void;
    removeRankings: (publication_id: number) => void;
    addAlbumsRankings: (newAlbums: Album[], publication_id: number) => void;
}



export type DataStore = DataStoreState & DataStoreActions;


export const defaultInitialState: DataStoreState = {
    year: 0,
    publicationsSelected: [],
    reviews: {},
    rankings: {},
    albums: [],
    albumsSelected: {},
    albumsSelectedRankings: {},
    loading: false,
    loadingAlbums: false,
    chartColorScheme: []
}

export const initDataStore = (): DataStoreState => {
    return {
        year: new Date().getFullYear(),
        publicationsSelected: [],
        reviews: {},
        rankings: {},
        albums: [],
        albumsSelected: {},
        albumsSelectedRankings: {},
        loading: false,
        loadingAlbums: false,
        chartColorScheme: [
            "#2563EB", //blue 600
            "#65A30D", // lime 600
            "#C026D3", // Fuchsia 600
            "#0D9488", // teal 600
            "#0EA5E9", // sky 500
            "#E11D48", // rose 600
        ]
    }
}

export const createDataStore = (
    initState: DataStoreState = defaultInitialState
) => {
    return createStore<DataStore>()((set) => ({
        ...initState,
        addPublication: (publication: Publication) => {
            set((state) => ({
                publicationsSelected: [...state.publicationsSelected, publication],
            }));
        },
        removePublication: (publication: Publication) => {
            set((state) => {
                const albumsSelected = { ...state.albumsSelected };
                // Remove associated publication reviews from albums
                if (publication.id in albumsSelected) {
                    delete albumsSelected[publication.id]
                }
                const reviews = { ...state.reviews }
                if (publication.id in reviews) {
                    delete reviews[publication.id]
                }
                return {
                    publicationsSelected: state.publicationsSelected.filter((currPublication) => publication.id !== currPublication.id),
                    albumsSelected,
                    reviews
                }
            });
        },
        addReviews: (newReviews: Review[]) => {
            set((state) => {
                const updatedReviews = { ...state.reviews }
                newReviews.forEach((review: Review) => {
                    const pubId = review.publication_id;

                    if (!(pubId in updatedReviews)) {
                        updatedReviews[pubId] = [];
                    }

                    updatedReviews[pubId].push(review);
                })
                return {
                    reviews: updatedReviews
                }
            })
        },
        removeReviews: (pubId: number) => {
            set((state) => {
                const updatedReviews = { ...state.reviews };
                delete updatedReviews[pubId];
                return { reviews: updatedReviews }
            })
        },
        setLoading: (loading: boolean) => {
            set((state) => ({
                loading
            }))
        },
        addAlbums: (newAlbums: Album[], bin0: number, bin1: number, publication_id: number) => {
            set((state) => {
                const updatedAlbums = { ...state.albumsSelected }
                if (!(publication_id in updatedAlbums)) {
                    updatedAlbums[publication_id] = {};
                }
                updatedAlbums[publication_id][`${bin0},${bin1}`] = newAlbums;
                return {
                    albumsSelected: updatedAlbums
                }
            })
        },
        removeAlbums: (bin0: number, bin1: number, publication_id: number) => {
            set((state) => {
                const updatedAlbums = { ...state.albumsSelected };
                delete updatedAlbums[publication_id][`${bin0},${bin1}`];
                return { albumsSelected: updatedAlbums };
            })
        },
        setLoadingAlbums: (loadingAlbums: boolean) => {
            set((state) => ({
                loadingAlbums
            }))
        },
        addRankings: (rankings: Ranking[]) => {
            set((state) => {
                const updatedRankings = { ...state.rankings }
                rankings.forEach((ranking: Ranking) => {
                    const pubId = ranking.publication_id;

                    if (!(pubId in updatedRankings)) {
                        updatedRankings[pubId] = [];
                    }

                    updatedRankings[pubId].push(ranking);
                })
                return {
                    rankings: updatedRankings
                }
            })
        },
        removeRankings: (publication_id: number) => {
            set((state) => {
                const rankings = { ...state.rankings }
                if (publication_id in rankings) {
                    delete rankings[publication_id];
                }
                return {
                    rankings
                }
            })
        },
        addAlbumsRankings: (newAlbums: Album[], publication_id: number) => {
            set((state) => {
                const updatedAlbums = { ...state.albumsSelectedRankings };
                updatedAlbums[publication_id] = newAlbums;
                return {
                    albumsSelectedRankings: updatedAlbums
                }
            })
        }
    }))
}

