'use client'
import React, { useState, useEffect } from 'react'
import { Vega } from "react-vega";
import { getCSSVariableValue } from '@/app/lib/getCSSVariableValue';
import { useTheme } from '@/providers/theme-provider';
import type { Review, Publication } from '@/app/lib/definitions';
import { useDataStore } from "@/providers/data-store-provider";
import useSWR from 'swr';
import { LoadingIcon } from '@bbollen23/brutal-paper';
import { fetcher } from '@/app/lib/fetcher';

interface BarChartProps {
    publication_id: number,
    years: number[]
}

interface BarData {
    bin0: number,
    bin1: number,
    count: number
}

function smallestScoreDifference(data: Review[]) {
    if (data) {
        // Extract the scores from the list of objects
        const scores = data.map(entry => entry.score);

        // Sort the scores in ascending order
        scores.sort((a, b) => a - b);

        // Initialize the smallest difference with a large value
        let smallestDifference = Infinity;

        // Loop through the sorted scores and find the smallest difference
        for (let i = 1; i < scores.length; i++) {
            if (scores[i] !== scores[i - 1]) {
                const difference = scores[i] - scores[i - 1];
                if (difference < smallestDifference) {
                    smallestDifference = difference;
                }
            }
        }
        return smallestDifference;
    }
    return 10;
}


const BarChart = ({ publication_id, years }: BarChartProps): JSX.Element => {
    // Grab theme
    const { theme } = useTheme();

    // Get store variables
    const publicationsSelected = useDataStore((state) => state.publicationsSelected);
    const chartColorScheme = useDataStore((state => state.chartColorScheme));
    const addReviews = useDataStore((state => state.addReviews))
    const clickBarSelection = useDataStore((state) => state.clickBarSelection);
    const selectedAlbumIds = useDataStore((state) => state.selectedAlbumIds);


    const color = chartColorScheme[publicationsSelected.findIndex(item => item.id === publication_id)]

    // Generate state for tracking marks for clicked bars
    const [clickedData, setClickedData] = useState<BarData[]>([]);

    const { data, error, isLoading } = useSWR(`/api/reviews?publication_ids=${[publication_id]}&years=${years}`, fetcher)
    console.log(data);

    // Generate step size for particular publication
    let stepSize = 5;
    if (data) {
        stepSize = Math.max(smallestScoreDifference(data.newReviews), 5);
        console.log(stepSize);
        if (isNaN(stepSize) || !Number.isFinite(stepSize)) {
            stepSize = 5;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClickData = (name: string, value: any) => {

        setClickedData((prev: BarData[]) => {
            let updatedState = [...prev];

            // Remove selection if all

            const allSelected = years.every((year) => selectedAlbumIds[year] && selectedAlbumIds[year][publication_id] && selectedAlbumIds[year][publication_id][`${value.bin0},${value.bin1}`])

            if (allSelected) {
                updatedState = prev.filter((entry: BarData) => entry.bin0 !== value.bin0)
                // Add all
            } else if (!updatedState.some(entry => entry.bin0 === value.bin0 && entry.bin1 === value.bin1)) {
                updatedState.push({ 'bin0': value.bin0, 'bin1': value.bin1, 'count': value.count })
            }

            clickBarSelection(value.bin0, value.bin1, publication_id, years);

            return updatedState;
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const handleHoverData = (name: any, value: any) => {
        // Placeholder for possible new stuff
    };

    const signalListeners = {
        "clickData": handleClickData, "hoverData": handleHoverData
    };


    useEffect(() => {

        // Handle initializing clicked bar marks when navigating back to page

        const allYears = years.every((year) => year in selectedAlbumIds && publication_id in selectedAlbumIds[year])
        if (!(allYears)) {
            return
        }
        const barsSelected: BarData[] = [];
        const trackedBins = Object.keys(selectedAlbumIds[years[0]][publication_id]);
        for (let i = 1; i < years.length; i++) {
            const year = years[i];
            const bins = Object.keys(selectedAlbumIds[year][publication_id]);
            // Remove anything from trackedBins that isn't in the current set of bins.
            trackedBins.filter((trackedBin) => bins.includes(trackedBin));
        }

        trackedBins.forEach(trackedBin => {
            const bins = trackedBin.split(',').map(Number);
            let total = 0;
            years.forEach(year => {
                console.log(total);
                total = total + selectedAlbumIds[year][publication_id][trackedBin].length;
            })
            // const total = years.reduce((sum, year) => sum + (selectedAlbumIds[year][publication_id][trackedBin]?.length || 0), 0);
            barsSelected.push({
                "bin0": bins[0],
                "bin1": bins[1],
                "count": total
            })
        })
        setClickedData(barsSelected)

    }, [])

    useEffect(() => {
        if (data) {
            addReviews(data.newReviews, years);
        }
    }, [data])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let spec: any = {};
    if (data) {
        spec = {
            "$schema": "https://vega.github.io/schema/vega/v5.json",
            "width": 450,
            "height": 275,
            "data": [{
                "name": "binned",
                "values": data.newReviews,
                "transform": [
                    {
                        "type": "bin", "field": "score",
                        "extent": [0, 100],
                        "anchor": 0,
                        "step": stepSize,
                        "nice": false,
                    },
                    {
                        "type": "aggregate",
                        "ops": ["count"],
                        "as": ["count"],
                        "fields": ["count"],
                        "groupby": ["bin0", "bin1"],
                        "key": "bin0"
                    }
                ]
            }, {
                "name": "clickedData",
                "values": clickedData
            }
            ],
            "autosize": {
                "type": "none",
                "contains": "padding"
            },
            "padding": {
                "left": 50,
                "right": 20,
                "top": 20,
                "bottom": 70
            },

            "scales": [
                {
                    "name": "xscale",
                    "type": "linear",
                    "domain": [0, 100],
                    "range": "width",
                    "padding": 0.3,
                },
                {
                    "name": "yscale",
                    "type": "linear",
                    "domain": { "data": "binned", "field": "count" },
                    "nice": true,
                    "range": "height"
                }
            ],

            "axes": [
                {
                    "orient": "bottom",
                    "scale": "xscale",
                    "labelColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                    "labelPadding": 10,
                    "title": "Score",  // Add the title property for the x-axis
                    "titleColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                    "titlePadding": 10,
                    "titleFontSize": 16,        // Set the font size
                    "titleFont": "'Inconsolata', sans-serif"
                },
                {
                    "orient": "left",
                    "scale": "yscale",
                    "labelColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                    "labelPadding": 2,
                    "title": "Number of Albums",  // Add the title property for the x-axis
                    "titleColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                    "titlePadding": 10,
                    "titleFontSize": 16,        // Set the font size
                    "titleFont": "'Inconsolata', sans-serif",
                    "grid": true,
                    "gridDash": [4, 4],
                    "gridOpacity": 0.2,
                    "gridColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                    "tickCount": 10
                }
            ],

            "marks": [
                {
                    "type": "rect",
                    "from": { "data": "binned" },
                    "encode": {
                        "enter": {
                            "x": { "scale": "xscale", "field": "bin0" },
                            "x2": { "scale": "xscale", "field": "bin1" },
                            "y": { "scale": "yscale", "field": "count" },
                            "y2": { "scale": "yscale", "value": 0 },
                            "fill": { "value": color },
                            "stroke": { "value": "#0C0A09" },
                        },
                        "update": {
                            "fillOpacity": {
                                "signal": "hoverData && hoverData.bin0 === datum.bin0 ? 1: 0.7"
                            },
                        },
                    }
                },
                {
                    "type": "rect",
                    "from": { "data": "clickedData" },
                    "encode": {
                        "update": {
                            "x": { "scale": "xscale", "field": "bin0" },
                            "x2": { "scale": "xscale", "field": "bin1" },
                            "y": { "scale": "yscale", "field": "count" },
                            "y2": { "scale": "yscale", "value": 0 },
                            "stroke": { "value": "#0C0A09" },
                            "strokeWidth": { "value": 2 },
                            "fill": { "value": "orange" }
                        }
                    }
                }
            ],
            "signals": [
                {
                    "name": "hoverData",
                    "value": null,
                    "on": [
                        { "events": "rect:mouseover", "update": "datum", "force": true },
                        { "events": "rect:mouseout", "update": "null", "force": true }
                    ]
                },
                {
                    "name": "clickData",
                    "value": null,
                    "type": "rect",
                    "on": [
                        { "events": "rect:click", "update": "datum", "force": true }
                    ]
                }
            ]
        }
    }

    if (isLoading) return (
        <div style={{ width: '450px', height: '275px', display: 'flex', flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '80px', fontSize: '1.2rem' }}>
                Loading<LoadingIcon visible={true} />
            </div>
        </div>)

    if (error) return <div>Oh no!</div>

    if (data && data.newReviews && data.newReviews.length == 0) return (
        <div style={{ width: '450px', height: '275px', display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ marginTop: '-80px' }}>
                There is no review data for {publicationsSelected.find((pub: Publication) => pub.id === publication_id)?.name}.
            </div>
        </div>
    )

    return (
        <Vega
            spec={spec}
            actions={false}
            signalListeners={signalListeners}
        />
    );

}

export default BarChart;