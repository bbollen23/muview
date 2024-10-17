import { createStore } from 'zustand/vanilla'
import type { AlbumsSelected, Publication, Review, Album, Ranking, AlbumsSelectedRankings, CurrentReviews, CurrentRankings, AlbumIdsSelected, AlbumIdsSelectedRanking } from '@/app/lib/definitions';


export type DataStoreState = {
    year: number;
    publicationsSelected: Publication[];
    albums: Album[];
    albumsSelected: AlbumsSelected;
    loading: boolean;
    loadingAlbums: boolean;
    chartColorScheme: string[];
    albumsSelectedRankings: AlbumsSelectedRankings;
    selectedYear: string;
    selectedYears: number[];

    // New stuff
    reviews: CurrentReviews;
    rankings: CurrentRankings;
    selectedAlbumIds: AlbumIdsSelected;
    selectedAlbumIdsRankings: AlbumIdsSelectedRanking;
}


export type DataStoreActions = {
    addPublication: (publication: Publication) => void;
    removePublication: (publication: Publication) => void;
    addReviews: (reviews: Review[], year: number) => void;
    removeReviews: (publication_id: number, year: number) => void;
    setLoading: (loading: boolean) => void;
    addAlbums: (newAlbums: Album[], bin0: number, bin1: number, publication_id: number) => void;
    removeAlbums: (bin0: number, bin1: number, publication_id: number) => void;
    setLoadingAlbums: (loadingAlbums: boolean) => void;
    addRankings: (rankings: Ranking[], year: number) => void;
    removeRankings: (publication_id: number, year: number) => void;
    addAlbumsRankings: (newAlbums: Album[], publication_id: number) => void;
    setSelectedYear: (year: string) => void;
    addYear: (year: string) => void;
    removeYear: (year: string) => void;
    clickBarSelection: (bin0: number, bin1: number, publication_id: number, year: number) => void;
    brushSelection: (x1: number, x2: number, y1: number, y2: number, year: number, publication_id: number) => void;
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
    chartColorScheme: [],
    selectedYear: '',
    selectedYears: [],
    selectedAlbumIds: {},
    selectedAlbumIdsRankings: {}
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
        selectedYear: '2024',
        selectedYears: [2024, 2023],
        chartColorScheme: [
            "#2563EB", //blue 600
            "#65A30D", // lime 600
            "#C026D3", // Fuchsia 600
            "#0D9488", // teal 600
            "#0EA5E9", // sky 500
            "#E11D48", // rose 600
        ],
        selectedAlbumIds: {},
        selectedAlbumIdsRankings: {}
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
        addReviews: (newReviews: Review[], year: number) => {
            set((state) => {
                // Get publication_id
                const publication_id = newReviews[0].publication_id;
                const updatedReviews = { ...state.reviews }

                if (!updatedReviews[year]) {
                    updatedReviews[year] = {};
                }

                updatedReviews[year][publication_id] = newReviews;
                return {
                    reviews: updatedReviews
                }
            })
        },
        removeReviews: (publication_id: number, year: number) => {
            set((state) => {
                const updatedReviews = { ...state.reviews };
                delete updatedReviews[year][publication_id];
                return { reviews: updatedReviews }
            })
        },
        addRankings: (newRankings: Ranking[], year: number) => {
            set((state) => {
                const updatedRankings = { ...state.rankings }
                if (newRankings.length > 0) {
                    // Get publication_id
                    const publication_id = newRankings[0].publication_id;


                    if (!updatedRankings[year]) {
                        updatedRankings[year] = {};
                    }

                    updatedRankings[year][publication_id] = newRankings;
                }
                return {
                    rankings: updatedRankings
                }
            })
        },
        removeRankings: (publication_id: number, year: number) => {
            set((state) => {
                const updatedRankings = { ...state.rankings };
                delete updatedRankings[year][publication_id];
                return { rankings: updatedRankings }
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

        addAlbumsRankings: (newAlbums: Album[], publication_id: number) => {
            set((state) => {
                const updatedAlbums = { ...state.albumsSelectedRankings };
                updatedAlbums[publication_id] = newAlbums;
                return {
                    albumsSelectedRankings: updatedAlbums
                }
            })
        },
        setSelectedYear: (year: string) => {
            set((state) => ({
                selectedYear: year
            }))
        },
        addYear: (year: string) => {
            set((state) => ({
                selectedYears: [...state.selectedYears, parseInt(year)]
            }))
        },
        removeYear: (year: string) => {
            set((state) => ({
                selectedYears: state.selectedYears.filter((entry: number) => entry !== parseInt(year))
            }))
        },
        clickBarSelection: (bin0: number, bin1: number, publication_id: number, year: number) => {
            set((state) => {
                let updatedAlbumIds: AlbumIdsSelected = { ...state.selectedAlbumIds };


                // What happens if no year, pubId? Not possible don't think. Always there
                const tempAlbumIds = [...state.reviews[year][publication_id]].filter((review: Review) => review.score >= bin0 && review.score <= bin1).map((entry: Review) => entry.album_id)

                // Initialize records if none exist
                if (!updatedAlbumIds[year]) {
                    updatedAlbumIds[year] = { [publication_id]: {} }
                } else if (!updatedAlbumIds[year][publication_id]) {
                    updatedAlbumIds[year][publication_id] = {}
                }

                updatedAlbumIds[year][publication_id][`${bin0},${bin1}`] = tempAlbumIds;
                return {
                    selectedAlbumIds: updatedAlbumIds
                }
            })
        },
        brushSelection: (x1: number, x2: number, y1: number, y2: number, year: number, publication_id: number) => {
            set((state) => {
                let updatedAlbumIds: AlbumIdsSelectedRanking = { ...state.selectedAlbumIdsRankings }


                const tempAlbumIds = [...state.rankings[year][publication_id]].filter((ranking: Ranking) => ranking.rank >= Math.min(x1, x2) && ranking.rank <= Math.max(x1, x2) && ranking.score >= Math.min(y1, y2) && ranking.score <= Math.max(y1, y2)).map((entry: Ranking) => entry.album_id);

                if (!updatedAlbumIds[year]) {
                    updatedAlbumIds[year] = {};
                }

                updatedAlbumIds[year][publication_id] = tempAlbumIds;

                return {
                    selectedAlbumIdsRankings: updatedAlbumIds
                }
            })
        }
    }))
}

