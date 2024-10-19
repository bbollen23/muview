'use client'
import React, { useState, useEffect } from 'react'
import { Vega } from "react-vega";
import { getCSSVariableValue } from '@/app/lib/getCSSVariableValue';
import { useTheme } from '@/providers/theme-provider';
import { useDataStore } from "@/providers/data-store-provider";
import { AlbumIdsSelected, AlbumIdsSelectedRanking, Filter } from '@/app/lib/definitions';
import useSWR from "swr";
import { fetcher } from '@/app/lib/fetcher';
import { LoadingIcon, Scrollable, Modal, ModalContent, ModalHeader, Button, Icon } from '@bbollen23/brutal-paper';
import { getAlbumIdsFromFilters } from '@/app/lib/filterAlbums';
import styles from './component.module.scss'

interface AlbumGenres {
    id: number,
    genres: string[],
    subgenres: string[]
}



interface GenreChartData {
    label: string,
    count: number
}


const getUniqueList = (albumsSelected: AlbumIdsSelected, albumsSelectedRankings: AlbumIdsSelectedRanking): number[] => {
    const uniqueIdSet = new Set<number>(); // Use a set to keep track of unique album IDs

    // Iterate over each year in albumsSelected
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(albumsSelected).forEach(([_year, pubIdAlbums]) => {
        // Iterate over each pub id
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(pubIdAlbums).forEach(([_pubId, binnedAlbums]) => {
            // Get values of each bin (which is list of albumIds)
            Object.values(binnedAlbums).forEach((albumIds) => {
                // ids is an array of numbers (album IDs)
                albumIds.forEach(albumId => {
                    uniqueIdSet.add(albumId); // Add the album ID to the set
                });
            });
        });
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(albumsSelectedRankings).forEach(([_year, pubIdAlbums]) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(pubIdAlbums).forEach(([_pubId, albumIds]) => {
            albumIds.forEach((albumId => {
                uniqueIdSet.add(albumId);
            }))
        })
    })

    return Array.from(uniqueIdSet); // Return unique items as an array
};


const generateGenreData = (albumGenres: AlbumGenres[]) => {
    const currentGenres: Record<string, number[]> = {};
    // const currentSubgenres = {};
    albumGenres.forEach((album: AlbumGenres) => {
        album.genres.forEach((genre: string) => {
            if (!(genre.includes('/')) && genre !== '- ') {
                if (!(genre in currentGenres)) {
                    currentGenres[genre] = [];
                }
                currentGenres[genre].push(album.id);
            }

        })
    })
    return currentGenres;
}

const convertGenreDataForPlot = (genreData: Record<string, number[]>) => {
    const chartData: GenreChartData[] = [];
    Object.entries(genreData).forEach(([key, value]) => {
        chartData.push({
            label: key,
            count: value.length
        })
    })
    return chartData;
}

interface GenrePlotProps {
    onHover: (filter: Filter) => void;
}



const GenrePlot = ({ onHover }: GenrePlotProps) => {
    const { theme } = useTheme();
    const selectedAlbumIds = useDataStore((state) => state.selectedAlbumIds);
    const selectedAlbumIdsRankings = useDataStore((state) => state.selectedAlbumIdsRankings)
    const selectedFilters = useDataStore((state) => state.selectedFilters);

    const [modalOpened, setModalOpened] = useState<boolean>(false);

    const toggleModal = () => {
        setModalOpened((prev) => !prev);
    }


    let barFillColor = '#1e40af';
    let circleFillColor = '#1e40af';
    if (theme === 'dark') {
        barFillColor = '#60a5fa';
        circleFillColor = '#60a5fa';
    }

    const [genreData, setGenreData] = useState<Record<string, number[]>>({});
    const [chartData, setChartData] = useState<GenreChartData[]>([]);

    const flatAlbumIds = selectedFilters.length === 0 ? getUniqueList(selectedAlbumIds, selectedAlbumIdsRankings) :
        getAlbumIdsFromFilters(selectedFilters);


    const { data, isLoading } = useSWR(
        `/api/genres?album_ids=${flatAlbumIds}`,
        fetcher)

    // const handleHoverData = (name: string, value: any) => {
    //     // console.log(value);
    // }

    const handleHoverData = (name: string, value: any) => {
        if (value) {
            const albumIds = genreData[value.label];
            onHover({
                id: `${value.label}-genre`,
                albumIds,
                groupLabels: [`${value.label}-genre`],
                type: 'genre-filter'
            })
        }
    }


    const signalListeners = {
        "hoverData": handleHoverData
    };

    console.log('rendering');

    let spec: any = {};
    spec = {
        "$schema": "https://vega.github.io/schema/vega/v5.json",
        "width": 620,
        "height": Math.max(chartData.length * 20, 800),
        "data": [
            {
                "name": "genreData",
                "values": chartData,
                "transform": [
                    {
                        "type": "collect",
                        "sort": {
                            "field": "count",
                            "order": "descending"
                        }
                    }
                ]
            }
        ],
        "autosize": {
            "type": "fit",
            "contains": "padding"
        },
        "padding": {
            "left": 10,
            "right": 40,
            "top": 0,
            "bottom": 70
        },

        "scales": [
            {
                "name": "x",
                "type": "linear",
                "domain": { "data": "genreData", "field": "count" },
                "nice": true,
                "range": "width"
                // "range": "width"
            },
            {
                "name": "y",
                "type": "band",
                "range": "height",
                "domain": { "data": "genreData", "field": "label" },
                "padding": 0.3,
            },
        ],

        "axes": [
            {
                "orient": "top",
                "scale": "x",
                "labelColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                "labelPadding": 10,
                "title": "Number of Albums With Genre",  // Add the title property for the x-axis
                "titleColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                "titlePadding": 10,
                "titleFontSize": 16,        // Set the font size
                "titleFont": "'Inconsolata', sans-serif"
            },
            {
                "orient": "left",
                "scale": "y",
                "ticks": false,
                "labels": false,
                "labelColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                "labelPadding": 2,
                // "title": "Number of Albums",  // Add the title property for the x-axis
                "titleColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                "titlePadding": 10,
                "titleFontSize": 16,        // Set the font size
                "titleFont": "'Inconsolata', sans-serif",
            }
        ],

        "marks": [
            {
                "type": "rect",
                "from": { "data": "genreData" },
                "encode": {
                    "enter": {
                        "y": { "scale": "y", "field": "label" },
                        "height": { "scale": "y", "band": "true" },
                        "x": { "scale": "x", "field": "count" },
                        "x2": { "scale": "x", "value": 0 },
                    },
                    "update": {
                        "fill": {
                            "signal": `hoverData && hoverData.label === datum.label ? 'orange' : '${barFillColor}'`
                        }
                    }
                },
            },
            {
                "type": "text",
                "from": { "data": "genreData" },
                "encode": {
                    "enter": {
                        "x": { "scale": "x", "field": "count" },
                        "dx": { "value": 12 },
                        "y": { "scale": "y", "field": "label" },
                        "dy": { "value": 10 },
                        "fontSize": { "value": 12 },
                        "text": { "field": "count" },
                        "fill": { "value": `${getCSSVariableValue('--bp-theme-text-color', theme)}` },
                        "font": { "value": "'Inconsolata', sans-serif" }
                    },
                    "update": {
                        "fill": {
                            "signal": `hoverData && hoverData.label === datum.label ? 'orange' : '${getCSSVariableValue('--bp-theme-text-color', theme)}'`
                        }
                    }
                }
            },
            {
                "type": "text",
                "from": { "data": "genreData" },
                "encode": {
                    "enter": {
                        "x": { "scale": "x", "value": 0 },
                        "dx": { "value": -5 },
                        "align": { "value": "right" },
                        "y": { "scale": "y", "field": "label" },
                        "dy": { "value": 10 },
                        "fontSize": { "value": 12 },
                        "text": { "field": "label" },
                        "fill": { "value": `${getCSSVariableValue('--bp-theme-text-color', theme)}` },
                        "font": { "value": "'Inconsolata', sans-serif" }
                    },
                    "update": {
                        "fill": {
                            "signal": `hoverData && hoverData.label === datum.label ? 'orange' : '${getCSSVariableValue('--bp-theme-text-color', theme)}'`
                        }
                    }
                }
            }
        ],
        "signals": [
            {
                "name": "hoverData",
                "value": null,
                "on": [
                    { "events": "rect:mouseover", "update": `datum`, "force": true },
                    // { "events": "rect:mouseover", "update": "datum", "force": true },
                    { "events": "text:mouseover", "update": "datum" }
                    // { "events": "rect:mouseout", "update": "null", "force": true }
                ]
            }
        ]
    }

    useEffect(() => {
        if (data) {
            const _genreData = generateGenreData(data.albums);
            const _dataForPlot = convertGenreDataForPlot(_genreData);
            setGenreData(_genreData)
            setChartData(_dataForPlot)
        }
    }, [data])

    if (isLoading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '200px' }}>
                <div style={{ fontSize: '1.2rem' }}>Loading</div>
                <LoadingIcon visible={true} />
            </div>
        </div>
    )
    return (
        <>
            <Scrollable style={{ marginTop: '20px' }} height="calc(100vh - 110px)" width="100%">
                <Icon icon='bi bi-question-circle' onClick={toggleModal} style={{ zIndex: 5, position: 'absolute', top: 5, right: 5 }} size='xs' />
                <Vega
                    spec={spec}
                    actions={false}
                    signalListeners={signalListeners}
                />
                <Modal
                    style={{ maxWidth: '500px' }}
                    opened={modalOpened}
                    setOpened={setModalOpened}
                    closeOnOutside
                    actions={
                        <>
                            <Button flat label='Close' onClick={toggleModal} />
                        </>
                    }>                <ModalHeader
                        closeButton={true}
                        title='Genre Filtering'
                    />
                    <ModalContent style={{ marginBottom: '20px' }}>

                        <div className="flex-col gap-10">
                            <div>
                                <p>Genre filtering works slightly different than UpsetPlot filtering. Whenever you add a Genre Filter, your Album list will always be filtered down to the albums which include that genre. Adding more genre filters continues to filter the dataset down so that all albums must have all included genres.</p>
                            </div>
                        </div>
                    </ModalContent>
                </Modal>
            </Scrollable>
        </>
    )

}

export default GenrePlot