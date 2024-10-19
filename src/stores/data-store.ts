import { createStore } from 'zustand/vanilla'
import type { Filter, Publication, Review, Ranking, CurrentReviews, CurrentRankings, AlbumIdsSelected, AlbumIdsSelectedRanking } from '@/app/lib/definitions';


export type DataStoreState = {
    // Used
    publicationsSelected: Publication[];
    chartColorScheme: string[];
    selectedYears: number[];
    reviews: CurrentReviews;
    rankings: CurrentRankings;
    selectedAlbumIds: AlbumIdsSelected;
    selectedAlbumIdsRankings: AlbumIdsSelectedRanking;
    combineYearsDashboard: boolean;
    selectedFilters: Filter[];

    // Currently unused
    loading: boolean;
    selectedYear: string;

}


export type DataStoreActions = {
    addPublication: (publication: Publication) => void;
    removePublication: (publication: Publication) => void;
    clickBarSelection: (bin0: number, bin1: number, publication_id: number, years: number[]) => void;
    brushSelection: (x1: number, x2: number, y1: number, y2: number, years: number[], publication_id: number) => void;
    addReviews: (reviews: Review[], years: number[]) => void;
    addRankings: (rankings: Ranking[], years: number[]) => void;
    setSelectedYears: (year: string[]) => void;
    toggleCombineYears: () => void;
    addFilter: (filter: Filter) => void;
    removeFilter: (filter: Filter) => void;


    // Currently Unused
    removeReviews: (publication_id: number, year: number) => void;
    removeRankings: (publication_id: number, year: number) => void;
    setSelectedYear: (year: string) => void;
    setLoading: (loading: boolean) => void;

}



export type DataStore = DataStoreState & DataStoreActions;


export const defaultInitialState: DataStoreState = {
    publicationsSelected: [],
    reviews: {},
    rankings: {},
    loading: false,
    chartColorScheme: [],
    selectedYear: '',
    selectedYears: [],
    selectedAlbumIds: {},
    selectedAlbumIdsRankings: {},
    combineYearsDashboard: false,
    selectedFilters: []
}

export const initDataStore = (): DataStoreState => {
    return {
        publicationsSelected: [],
        reviews: {},
        rankings: {},
        loading: false,
        selectedYear: '2024',
        selectedYears: [2024],
        chartColorScheme: [
            "#2563EB", //blue 600
            "#65A30D", // lime 600
            "#C026D3", // Fuchsia 600
            "#0D9488", // teal 600
            "#0EA5E9", // sky 500
            "#E11D48", // rose 600
        ],
        selectedAlbumIds: {},
        selectedAlbumIdsRankings: {},
        combineYearsDashboard: false,
        selectedFilters: []
    }
}

export const createDataStore = (
    initState: DataStoreState = defaultInitialState
) => {
    return createStore<DataStore>()((set) => ({
        ...initState,
        addFilter: ((filter: Filter) => {
            set((state) => ({
                selectedFilters: [...state.selectedFilters, filter]
            }))
        }),
        removeFilter: ((filter: Filter) => {
            set((state) => ({
                selectedFilters: state.selectedFilters.filter((currFilter) => filter.id !== currFilter.id)
            }))
        }),
        toggleCombineYears: () => {
            set((state) => ({
                combineYearsDashboard: !state.combineYearsDashboard
            }));
        },
        addPublication: (publication: Publication) => {
            set((state) => ({
                publicationsSelected: [...state.publicationsSelected, publication],
            }));
        },
        removePublication: (publication: Publication) => {
            set((state) => {
                const updatedSelectedAlbumIds = { ...state.selectedAlbumIds };
                const updatedSelectedAlbumIdsRankings = { ...state.selectedAlbumIdsRankings };
                const updatedReviews = { ...state.reviews }
                const updatedRankings = { ...state.rankings }

                // Remove associated publication reviews from albums
                state.selectedYears.forEach((year: number) => {
                    if (year in updatedSelectedAlbumIds) {
                        delete updatedSelectedAlbumIds[year][publication.id]
                    }
                    if (year in updatedSelectedAlbumIdsRankings) {
                        delete updatedSelectedAlbumIdsRankings[year][publication.id]
                    }
                    if (year in updatedReviews) {
                        delete updatedReviews[year][publication.id]
                    }
                    if (year in updatedRankings) {
                        delete updatedRankings[year][publication.id]
                    }

                })
                return {
                    publicationsSelected: state.publicationsSelected.filter((currPublication) => publication.id !== currPublication.id),
                    selectedAlbumIds: updatedSelectedAlbumIds,
                    selectedAlbumIdsRankings: updatedSelectedAlbumIdsRankings,
                    reviews: updatedReviews,
                    rankings: updatedRankings
                }
            });
        },
        addReviews: (newReviews: Review[], years: number[]) => {
            set((state) => {
                // Get publication_id
                const updatedReviews = { ...state.reviews }
                if (newReviews.length > 0) {
                    const publication_id = newReviews[0].publication_id;
                    years.forEach((year) => {
                        if (!updatedReviews[year]) {
                            updatedReviews[year] = {};
                        }

                        updatedReviews[year][publication_id] = newReviews.filter((review: Review) => review.year === year);
                    })

                }

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
        addRankings: (newRankings: Ranking[], years: number[]) => {
            set((state) => {
                const updatedRankings = { ...state.rankings }
                if (newRankings.length > 0) {
                    // Get publication_id
                    const publication_id = newRankings[0].publication_id;

                    years.forEach((year) => {
                        if (!updatedRankings[year]) {
                            updatedRankings[year] = {};
                        }

                        updatedRankings[year][publication_id] = newRankings.filter((ranking: Ranking) => ranking.year === year);
                    })
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
            set(() => ({
                loading
            }))
        },

        // removeAlbums: (bin0: number, bin1: number, publication_id: number) => {
        //     set((state) => {
        //         const updatedAlbums = { ...state.albumsSelected };
        //         delete updatedAlbums[publication_id][`${bin0},${bin1}`];
        //         return { albumsSelected: updatedAlbums };
        //     })
        // },
        // setLoadingAlbums: (loadingAlbums: boolean) => {
        //     set((state) => ({
        //         loadingAlbums
        //     }))
        // },

        setSelectedYear: (year: string) => {
            set(() => ({
                selectedYear: year
            }))
        },
        setSelectedYears: (years: string[]) => {
            set(() => ({
                selectedYears: years.map(Number)
            }))
        },
        clickBarSelection: (bin0: number, bin1: number, publication_id: number, years: number[]) => {
            set((state) => {

                const updatedAlbumIds: AlbumIdsSelected = { ...state.selectedAlbumIds };

                const allSelected = years.every((year) => updatedAlbumIds[year] && updatedAlbumIds[year][publication_id] && updatedAlbumIds[year][publication_id][`${bin0},${bin1}`])

                if (allSelected) {
                    years.forEach(year => {
                        delete updatedAlbumIds[year][publication_id][`${bin0},${bin1}`]
                    })

                } else {
                    years.forEach((year) => {

                        // What happens if no year, pubId? Not possible don't think. Always there
                        const tempAlbumIds = [...state.reviews[year][publication_id]].filter((review: Review) => review.score >= bin0 && (bin1 === 100 ? review.score <= bin1 : review.score < bin1)).map((entry: Review) => entry.album_id)

                        // Initialize records if none exist
                        if (!updatedAlbumIds[year]) {
                            updatedAlbumIds[year] = { [publication_id]: {} }
                        } else if (!updatedAlbumIds[year][publication_id]) {
                            updatedAlbumIds[year][publication_id] = {}
                        }

                        updatedAlbumIds[year][publication_id][`${bin0},${bin1}`] = tempAlbumIds;


                    })
                }

                return {
                    selectedAlbumIds: updatedAlbumIds
                }

            })
        },
        brushSelection: (x1: number, x2: number, y1: number, y2: number, years: number[], publication_id: number) => {
            set((state) => {
                const updatedAlbumIds: AlbumIdsSelectedRanking = { ...state.selectedAlbumIdsRankings }

                years.forEach((year) => {
                    const tempAlbumIds = [...state.rankings[year][publication_id]].filter((ranking: Ranking) => ranking.rank >= Math.min(x1, x2) && ranking.rank <= Math.max(x1, x2) && ranking.score >= Math.min(y1, y2) && ranking.score <= Math.max(y1, y2)).map((entry: Ranking) => entry.album_id);

                    if (!updatedAlbumIds[year]) {
                        updatedAlbumIds[year] = {};
                    }

                    updatedAlbumIds[year][publication_id] = tempAlbumIds;
                })

                return {
                    selectedAlbumIdsRankings: updatedAlbumIds
                }
            })
        }
    }))
}

