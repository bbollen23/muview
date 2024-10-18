'use client'
import React, { useState, useEffect } from 'react'
import { Vega } from "react-vega";
import { getCSSVariableValue } from '@/app/lib/getCSSVariableValue';
import { useTheme } from '@/providers/theme-provider';
import type { Review } from '@/app/lib/definitions';
import { useDataStore } from "@/providers/data-store-provider";
import useSWR from 'swr';
import { LoadingIcon } from '@bbollen23/brutal-paper';
import { fetcher } from '@/app/lib/fetcher';


// const fetcher = async (url: string) => {
//     const res = await fetch(url);
//     if (!res.ok) {
//         throw new Error('Failed to fetch');
//     }
//     const data = await res.json();
//     console.log('Fetched data:', data); // Log the fetched data
//     return data;
// };

interface UpsetData {
    setLabel: string;
    sets: number[];
    intersectionSize: number;
    x1: number;
    x2: number;
}

interface MatrixData {
    setLabel: string;
    x: number;
    visible: boolean;
}





const generateMatrixData = (data: UpsetData[]): MatrixData[] => {
    const matrixData: MatrixData[] = [];

    data.forEach((entry: UpsetData) => {
        entry.sets.forEach((set: number, index: number) => {
            matrixData.push({
                setLabel: entry.setLabel,
                x: index,
                visible: set === 1
            })
        })
    })

    return matrixData
}


const UpsetPlot = (): JSX.Element => {
    // Grab theme
    const { theme } = useTheme();

    const selectedAlbumIds = useDataStore((state) => state.selectedAlbumIds);
    const selectedAlbumIdsRankings = useDataStore((state => state.selectedAlbumIdsRankings));

    const generateGroups = () => {
        const groupList: Record<string, number[]> = {};
        Object.entries(selectedAlbumIds).forEach(([year, pubIdRecord]) => {
            let yearString: string = `${year}`;
            Object.entries(pubIdRecord).forEach(([pubId, binnedAlbums]) => {
                let pubIdString = `${yearString}-${pubId}`;
                Object.entries(binnedAlbums).forEach(([bin, albumIds]) => {
                    let binString = `${pubIdString}-${bin}`;
                    groupList[binString] = albumIds;
                })
            })
        });

        Object.entries(selectedAlbumIdsRankings).forEach(([year, pubIdRecord]) => {
            let yearString: string = `${year}`;
            Object.entries(pubIdRecord).forEach(([pubId, albumIds]) => {
                let pubIdString = `${yearString}-${pubId}-brush`;
                groupList[pubIdString] = albumIds;
            })

        });
        return groupList;
    }


    const generateUpsetDataExclusive = (groupList: Record<string, number[]>): UpsetData[] => {
        const keys = Object.keys(groupList);  // The keys of the groups (e.g., "2023-19-65,70", etc.)
        const numSets = keys.length;  // Number of sets
        const numIntersections = Math.pow(2, numSets);  // 2^numSets combinations
        let intersections: UpsetData[] = [];

        // Helper function to calculate the intersection of a specific combination of sets
        const calculateIntersection = (sets: number[]): number[] => {
            return sets.reduce((intersection: number[], currentSet, index) => {
                if (currentSet === 1) {
                    // Intersect the current set with the accumulated intersection
                    const setData = groupList[keys[index]];
                    if (intersection.length === 0) return setData; // Start intersection
                    return intersection.filter(item => setData.includes(item)); // Perform intersection
                }
                return intersection;
            }, []);
        };

        // Keep track of elements already accounted for in larger intersections
        let accountedElements = new Set<number>();

        // Iterate over all possible intersections, starting from the largest combinations (highest number of 1s)
        for (let i = numIntersections - 1; i > 0; i--) {
            let binaryStr = i.toString(2).padStart(numSets, '0');
            const sets = binaryStr.split('').map(Number);  // Convert the binary string to an array of 1s and 0s

            let intersectingElements = calculateIntersection(sets);

            // Remove any elements already accounted for in larger intersections
            intersectingElements = intersectingElements.filter(item => !accountedElements.has(item));

            const intersectionSize = intersectingElements.length;  // Number of elements in the intersection

            const x1 = sets.indexOf(1);   // First set involved in the intersection
            const x2 = sets.lastIndexOf(1); // Last set involved in the intersection

            // Construct the label based on the sets involved (e.g., "2023-19-65,70#2024-19-75,80")
            const setLabel = sets.map((s, index) => (s === 1 ? keys[index] : null)).filter(Boolean).join('#');

            // Add the intersection to the final data structure if it has any elements
            if (intersectionSize > 0) {
                intersections.push({
                    setLabel,
                    sets,  // Array of 1s and 0s
                    intersectionSize,
                    x1,
                    x2
                });
                // Mark these elements as accounted for
                intersectingElements.forEach(item => accountedElements.add(item));
            }
        }
        return intersections;
    };



    const groupList = generateGroups();
    const groupListData = Object.entries(groupList).map((entry) => {
        return {
            "label": entry[0],
            "count": entry[1].length
        }
    })

    console.log(groupListData);
    console.log(groupList);
    const myUpsetData = generateUpsetDataExclusive(groupList);
    const myMatrixData = generateMatrixData(myUpsetData);

    let barFillColor = '#1e40af';
    let circleFillColor = '#1e40af';
    if (theme === 'dark') {
        barFillColor = '#60a5fa';
        circleFillColor = '#60a5fa';
    }


    // const signalListeners = {
    //     "hoverData": handleHoverData
    // };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let spec: any = {};
    spec = {
        "$schema": "https://vega.github.io/schema/vega/v5.json",
        "width": 600,
        "height": 700,
        "data": [
            {
                "name": "upsetData",
                "values": myUpsetData,
                "transform": [
                    {
                        "type": "collect",
                        "sort": {
                            "field": "intersectionSize",
                            "order": "descending"
                        }
                    }
                ]
            },
            {
                "name": "matrixData",
                "values": myMatrixData
            },
            {
                "name": "setData",
                "values": groupListData
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
                "domain": { "data": "upsetData", "field": "intersectionSize" },
                "nice": true,
                "range": [{ "signal": "width * 0.3" }, { "signal": "width" }]
                // "range": "width"
            },
            {
                "name": "y",
                "type": "band",
                "range": [100, { "signal": "height" }],
                "domain": { "data": "upsetData", "field": "setLabel" },
                "padding": 0.3,
            },
            {
                "name": "xMatrix",
                "type": "band",
                "domain": Array.from({ length: Object.keys(groupList).length }, (_, index) => index),
                "range": [0, { "signal": "width * 0.3" }],
                "padding": 0.3
            },
            {
                "name": "ySets",
                "type": "linear",
                "domain": { "data": "setData", "field": "count" },
                "range": [90, 0]
            },
            {
                "name": "xSets",
                "type": "band",
                "domain": { "data": "setData", "field": "label" },
                "range": [0, { "signal": "width * 0.3" }],
                "padding": 0.3,
            },
            {
                "name": "xMatrixRect",
                "type": "band",
                "domain": Array.from({ length: Object.keys(groupList).length }, (_, index) => index),
                "range": [-10, { "signal": "(width * 0.3) + 10" }],  // Map to first 30% of the width
                // "padding": 0.2
            }
        ],

        "axes": [
            {
                "orient": "bottom",
                "scale": "x",
                "labelColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                "labelPadding": 10,
                "title": "Number of Albums In Intersection",  // Add the title property for the x-axis
                "titleColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                "titlePadding": 10,
                "titleFontSize": 16,        // Set the font size
                "titleFont": "'Inconsolata', sans-serif"
            },
            // {
            //     "orient": "left",
            //     "scale": "y",
            //     "labelColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
            //     "labelPadding": 2,
            //     "title": "Number of Albums",  // Add the title property for the x-axis
            //     "titleColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
            //     "titlePadding": 10,
            //     "titleFontSize": 16,        // Set the font size
            //     "titleFont": "'Inconsolata', sans-serif",
            // }
        ],

        "marks": [
            {
                "type": "rect",
                "from": { "data": "upsetData" },
                "encode": {
                    "enter": {
                        "y": { "scale": "y", "field": "setLabel" },
                        "height": { "scale": "y", "band": "true" },
                        "x": { "scale": "x", "field": "intersectionSize" },
                        "x2": { "scale": "x", "value": 0 },
                    },
                    "update": {
                        "fill": {
                            "signal": `hoverData && hoverData.setLabel === datum.setLabel ? 'orange': '${barFillColor}'`
                        },
                    },
                },
            },
            {
                "type": "rect",
                "from": { "data": "setData" },
                "encode": {
                    "enter": {
                        "x": { "scale": "xSets", "field": "label", "offset": -5 },  // Removed band: true
                        "width": { "scale": "xSets", "band": 1 },  // Auto-size bar width to band
                        "y": { "scale": "ySets", "field": "count" },  // Use 'count' for height
                        "y2": { "scale": "ySets", "value": 0 },  // Set y2 at the bottom
                        "fill": { "value": barFillColor }
                    },
                    "update": {
                        "fill": {
                            "signal": `hoverData && hoverData.setLabel && replace(hoverData.setLabel, datum.label, ' ') !== hoverData.setLabel ? 'orange': hoverData && hoverData.label === datum.label ? 'orange' : '${barFillColor}'`
                        },
                    },
                }
            },
            {
                "type": "rule",
                "from": { "data": "upsetData" },
                "encode": {
                    "enter": {
                        "x": { "scale": "xMatrix", "field": "x1" },
                        "y": { "scale": "y", "field": "setLabel", "band": 0.5 },
                        "x2": { "scale": "xMatrix", "field": "x2" },
                        "y2": { "scale": "y", "field": "setLabel", "band": 0.5 },
                        "stroke": { "value": circleFillColor },
                        "strokeWidth": { "value": 1 },
                        "opacity": { "value": 1 }  // Temporarily set to 1 for debugging
                    },
                    "update": {
                        "stroke": {
                            "signal": `hoverData && hoverData.setLabel === datum.setLabel ? 'orange': '${barFillColor}'`
                        },
                    },

                }
            },
            {
                "type": "symbol",
                "from": { "data": "matrixData" },
                "encode": {
                    "enter": {
                        "x": { "scale": "xMatrix", "field": "x", "offset": 0 },
                        "y": {
                            "scale": "y",
                            "field": "setLabel",
                            "band": 0.5
                        },
                        "size": { "value": 150 },
                        "fill": { "value": circleFillColor },
                        "fillOpacity": { "signal": "datum.visible ? 1 : 0.05" }
                    },
                    "update": {
                        "fill": {
                            "signal": `hoverData && hoverData.setLabel === datum.setLabel && datum.visible ? 'orange': hoverData && hoverData.label && datum.visible && scale('xSets', hoverData.label) === scale('xMatrix',datum.x) ? 'orange' : '${barFillColor}'`
                        },
                    },
                }
            },

            {
                "type": "text",
                "from": { "data": "upsetData" },
                "encode": {
                    "enter": {
                        // "dx": { "signal": "width" }, // Use x scale for the end position
                        "x": { "scale": "x", "field": "intersectionSize" },
                        "dx": { "value": 12 }, // Use x scale for the end position
                        "y": { "scale": "y", "field": "setLabel" }, // Position vertically based on setLabel
                        "dy": { "value": 20 }, // Adjust dy to vertically center the text (can be modified)
                        "fontSize": { "value": 12 },
                        "text": { "field": "intersectionSize" },
                        "fill": { "value": `${getCSSVariableValue('--bp-theme-text-color', theme)}` },
                        "font": { "value": "'Inconsolata', sans-serif" }
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
        ]
    }

    return (
        <Vega
            spec={spec}
            actions={false}
        // signalListeners={signalListeners}

        />
    );

}

export default UpsetPlot;