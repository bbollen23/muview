import { createStore } from 'zustand/vanilla'
import type { Filter, Publication, Review, Ranking, CurrentReviews, CurrentRankings, AlbumIdsSelected, AlbumIdsSelectedRanking, CurrentBarChartMetadata } from '@/app/lib/definitions';


export interface BrushState {
    x: number,
    y: number,
    width: number,
    height: number
}

export type DataStoreState = {
    // Used
    publicationsSelected: Publication[];
    selectedYears: number[];
    reviews: CurrentReviews;
    rankings: CurrentRankings;
    selectedAlbumIds: AlbumIdsSelected;
    selectedAlbumIdsRankings: AlbumIdsSelectedRanking;
    combineYearsDashboard: boolean;
    selectedFilters: Filter[];
    upsetConsolidate: boolean;
    upsetInclusive: boolean;
    barChartMetadata: CurrentBarChartMetadata;
    brushState: Record<string, Record<string, BrushState>>;
    noScoreRankHiddenState: Record<string, Record<string, boolean>>;

    // Coloring
    chartColorScheme: string[];
    filterPlotSelectionColors: Record<string, string>;
    filterPlotBarColors: Record<string, string>

    // Currently unused
    loading: boolean;
    selectedYear: string;

}



export type DataStoreActions = {
    addPublication: (publication: Publication) => void;
    removePublication: (publication: Publication) => void;
    initializeBarChart: (publication_id: number, years: number[], stepSize: number) => void;
    clickBarSelection: (bin0: number, bin1: number, publication_id: number, years: number[]) => void;
    clearBarSelection: (publication_id: number, years: number[]) => void;
    selectAllBarSelection: (publication_id: number, years: number[]) => void;
    brushSelection: (x1: number, x2: number, y1: number, y2: number, x: number, y: number, width: number, height: number, years: number[], publication_id: number) => void;
    addReviews: (reviews: Review[], years: number[]) => void;
    addRankings: (rankings: Ranking[], years: number[]) => void;
    setSelectedYears: (year: string[]) => void;
    toggleCombineYears: () => void;
    addFilter: (filter: Filter) => void;
    removeFilter: (filter: Filter) => void;
    toggleConsolidate: () => void;
    toggleInclusive: () => void;
    toggleNoScoreRankHiddenState: (years: number[], publication_id: number) => void;


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
    selectedFilters: [],
    filterPlotSelectionColors: {},
    filterPlotBarColors: {},
    upsetConsolidate: false,
    upsetInclusive: false,
    barChartMetadata: {},
    brushState: {},
    noScoreRankHiddenState: {}
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
        selectedFilters: [],
        filterPlotSelectionColors: {
            "dark": 'orange',
            "light": '#c2410c'
        },
        filterPlotBarColors: {
            'light': '#1e40af',
            "dark": '#60a5fa'
        },
        upsetConsolidate: false,
        upsetInclusive: false,
        barChartMetadata: {},
        brushState: {},
        noScoreRankHiddenState: {}

    }
}

export const createDataStore = (
    initState: DataStoreState = defaultInitialState
) => {
    return createStore<DataStore>()((set) => ({
        ...initState,
        toggleConsolidate: () => {
            set((state) => ({
                upsetConsolidate: !state.upsetConsolidate
            }))
        },
        toggleInclusive: () => {
            set((state) => {
                return {
                    upsetInclusive: !state.upsetInclusive
                }
            })
        },
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
        initializeBarChart: (publication_id: number, years: number[], stepSize: number) => {
            set((state) => {
                const updatedBarChartMetadata = { ...state.barChartMetadata }
                years.forEach(year => {
                    if (!updatedBarChartMetadata[year]) {
                        updatedBarChartMetadata[year] = {
                            [publication_id]: {
                                stepSize
                            }
                        }
                    } else if (!updatedBarChartMetadata[year][publication_id]) {
                        updatedBarChartMetadata[year][publication_id] = { stepSize }
                    } else {
                        updatedBarChartMetadata[year][publication_id].stepSize = stepSize;
                    }
                })
                return {
                    barChartMetadata: updatedBarChartMetadata
                }
            })
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
        clearBarSelection: (publication_id: number, years: number[]) => {
            set((state) => {
                const updatedAlbumIds: AlbumIdsSelected = { ...state.selectedAlbumIds };
                years.forEach((year) => {
                    if (updatedAlbumIds[year] && updatedAlbumIds[year][publication_id]) {
                        delete updatedAlbumIds[year][publication_id];
                    }

                })
                return {
                    selectedAlbumIds: updatedAlbumIds
                }
            })
        },
        selectAllBarSelection: (publication_id: number, years: number[]) => {
            set((state) => {
                const updatedAlbumIds: AlbumIdsSelected = { ...state.selectedAlbumIds };
                years.forEach((year) => {
                    const stepSize = state.barChartMetadata[year][publication_id].stepSize;
                    if (!updatedAlbumIds[year]) {
                        updatedAlbumIds[year] = { [publication_id]: {} }
                    } else if (!updatedAlbumIds[year][publication_id]) {
                        updatedAlbumIds[year][publication_id] = {};
                    }
                    // Generate bins
                    const bins = [];
                    for (let i = 0; i < 100; i += stepSize) {
                        bins.push(`${i},${i + stepSize}`);
                    }

                    bins.forEach(bin => {
                        const binSplit = bin.split(',');
                        const bin0 = parseInt(binSplit[0]);
                        const bin1 = parseInt(binSplit[1]);
                        const tempAlbumIds = [...state.reviews[year][publication_id]].filter((review: Review) => review.score >= bin0 && (bin1 === 100 ? review.score <= bin1 : review.score < bin1)).map((entry: Review) => entry.album_id)

                        updatedAlbumIds[year][publication_id][`${bin0},${bin1}`] = tempAlbumIds;
                    })
                })
                return {
                    selectedAlbumIds: updatedAlbumIds
                }
            })
        },
        brushSelection: (x1: number, x2: number, y1: number, y2: number, x: number, y: number, width: number, height: number, years: number[], publication_id: number) => {
            set((state) => {
                console.log(x1, x2, y1, y2, x, y, width, height);
                const updatedAlbumIds: AlbumIdsSelectedRanking = { ...state.selectedAlbumIdsRankings }
                const updatedBrushState = { ...state.brushState }
                years.forEach((year) => {
                    if (state.rankings[year] && state.rankings[year][publication_id]) {
                        const tempAlbumIds = [...state.rankings[year][publication_id]].filter((ranking: Ranking) => ranking.rank >= Math.min(x1, x2) && ranking.rank <= Math.max(x1, x2) && ranking.score >= Math.min(y1, y2) && ranking.score <= Math.max(y1, y2)).map((entry: Ranking) => entry.album_id);

                        if (!updatedAlbumIds[year]) {
                            updatedAlbumIds[year] = {};
                        }

                        if (!updatedBrushState[year]) {
                            updatedBrushState[year] = {}
                        }

                        updatedAlbumIds[year][publication_id] = tempAlbumIds;
                        updatedBrushState[year][publication_id] = { x, y, width, height };
                    }

                })

                return {
                    selectedAlbumIdsRankings: updatedAlbumIds,
                    brushState: updatedBrushState
                }
            })
        },
        toggleNoScoreRankHiddenState: (years: number[], publication_id: number) => {
            set((state) => {
                const updatedHiddenState = { ...state.noScoreRankHiddenState }
                years.forEach((year) => {
                    if (!updatedHiddenState[year]) {
                        updatedHiddenState[year] = {}
                    }
                    updatedHiddenState[year][publication_id] = updatedHiddenState[year][publication_id] === undefined ? false : !updatedHiddenState[year][publication_id]
                })
                return {
                    noScoreRankHiddenState: updatedHiddenState
                }
            })
        }
    }))
}

