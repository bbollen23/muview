'use client'
import React from 'react'
import { Vega } from "react-vega";
import { getCSSVariableValue } from '@/app/lib/getCSSVariableValue';
import { useTheme } from '@/providers/theme-provider';
import type { Ranking } from '../lib/definitions';
import { useDataStore } from "@/providers/data-store-provider";


interface ScatterPlotProps {
    rankingData: Ranking[],
    publication_id: number
}

interface BrushSelectionData {
    x1: number,
    x2: number,
    y1: number,
    y2: number
}


const ScatterPlot = ({ publication_id, rankingData }: ScatterPlotProps): JSX.Element => {

    const setLoadingAlbums = useDataStore((state) => state.setLoadingAlbums);
    const addAlbums = useDataStore((state) => state.addAlbums);
    const removeAlbums = useDataStore((state) => state.removeAlbums);
    const albumsSelected = useDataStore((state) => state.albumsSelected);
    const addAlbumsRankings = useDataStore((state) => state.addAlbumsRankings)
    const publicationsSelected = useDataStore((state) => state.publicationsSelected);
    const chartColorScheme = useDataStore((state => state.chartColorScheme))

    console.log(rankingData);

    const color = chartColorScheme[publicationsSelected.findIndex(item => item.id === publication_id)]


    const { theme } = useTheme();


    // What should happen for notification when we switch brushing?? Find difference somehow?
    // How should we handle cancelling brush?
    // How should we handle highlighting when albums have already been selected from distribution??

    const handleBrushedData = async (name: string, value: any) => {
        setLoadingAlbums(true);

        const { x1, x2, y1, y2 } = value as BrushSelectionData;
        const album_ids = rankingData.filter((ranking: Ranking) => {
            return ranking.rank >= Math.min(x1, x2) && ranking.rank <= Math.max(x1, x2)
                && ranking.score >= Math.min(y1, y2) && ranking.score <= Math.max(y1, y2);
        }).map((entry: Ranking) => entry.album_id);

        if (album_ids.length > 0) {
            const response = await fetch(`/api/albums?album_ids=${album_ids}`);
            if (!response.ok) {
                console.error('Error fetching album data');
                return
            }

            const data = await response.json();
            addAlbumsRankings(data.albums, publication_id);
        }
        setLoadingAlbums(false);
        // addAlbums(data.albums, value.bin0, value.bin1, publication_id);


    }


    const signalListeners = {
        "brushedData": handleBrushedData
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spec: any = {
        "$schema": "https://vega.github.io/schema/vega/v5.json",
        "width": 450,
        "height": 275,
        "data": {
            "name": "table",
            "values": rankingData
        },
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
                "round": true,
                "nice": true,
                "zero": true,
                "domain": { "data": "table", "field": "rank" },
                "range": "width",
                "reverse": true
            },
            {
                "name": "yscale",
                "type": "linear",
                "round": true,
                "nice": true,
                "zero": false,
                "domain": { "data": "table", "field": "score" },
                "range": "height",
            }
        ],

        "axes": [
            {
                "orient": "bottom",
                "scale": "xscale",
                "labelColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                "labelPadding": 10,
                "title": "Year End Ranking",  // Add the title property for the x-axis
                "titleColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                "titlePadding": 10,
                "titleFontSize": 16,        // Set the font size
                "titleFont": "'Inconsolata', sans-serif",
                "offset": 10
            },
            {
                "orient": "left",
                "scale": "yscale",
                "labelColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                "labelPadding": 2,
                "title": "Original Score",  // Add the title property for the x-axis
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
                "from": { "data": "table" },
                "encode": {
                    "update": {
                        "x": { "signal": "brush.x" },
                        "y": { "signal": "brush.y" }, // Adjust for Y scale
                        "width": { "signal": "brush.width" },
                        "height": { "signal": "brush.height" },
                        "stroke": { "value": "black" },
                        "strokeWidth": { "value": 2 },
                        "fill": { "value": "#334155" }, // Semi-transparent fill
                        "fillOpacity": { "value": 0.1 }
                    }
                }
            },
            {
                "type": "symbol",
                "from": { "data": "table" },
                "encode": {
                    "enter": {
                        "x": { "scale": "xscale", "field": "rank" },
                        "y": { "scale": "yscale", "field": "score" },
                        "size": { "value": 100 },
                        "fill": { "value": color },
                        "stroke": { "value": "black" }
                    },
                    "update": {
                        "fillOpacity": {
                            "signal": "scale('xscale', datum.rank) >= min(brush.x, brush.x + brush.width) && scale('xscale', datum.rank) <= max(brush.x, brush.x + brush.width) && scale('yscale', datum.score) >= min(brush.y, brush.y + brush.height) && scale('yscale', datum.score) <= max(brush.y, brush.y + brush.height)  ? 1 : brush.width && abs(brush.width) > 3 ? 0.3 : 1 "
                        },

                    }
                }
            }

        ],
        "signals": [
            {
                "name": "isMoving",  // Boolean to track if the mouse is down
                "value": true,
                "on": [
                    {
                        "events": "mousedown",
                        "update": "brush.width != 0 && brush.height != 0 && x() >= min(brush.x, brush.x + brush.width) && x() <= max(brush.x, brush.x + brush.width) && y() >= min(brush.y, brush.y + brush.height) && y() <= max(brush.y, brush.y + brush.height)"  // Set to true on mousedown
                    },
                    {
                        "events": "mouseup",
                        "update": "false"  // Set to false on mouseup
                    }
                ]
            },
            {
                "name": "startMoveX",  // Track initial X when drag starts
                "value": 0,
                "on": [
                    {
                        "events": "mousedown",
                        "update": "isMoving ? x() : startMoveX"
                    }
                ]
            },
            {
                "name": "startMoveY",  // Track initial Y when drag starts
                "value": 0,
                "on": [
                    {
                        "events": "mousedown",
                        "update": "isMoving ? y() : startMoveY"
                    }
                ]
            },
            {
                "name": "brushStartX",  // Track initial X when drag starts
                "value": 0,
                "on": [
                    {
                        "events": "mousedown",
                        "update": "isMoving ? brush.x : brushStartX"
                    }
                ]
            },
            {
                "name": "endY",  // Track initial Y when drag starts
                "value": 0,
                "on": [
                    {
                        "events": "mousedown",
                        "update": "isMoving ? brush.y : endY"
                    }
                ]
            },
            {
                "name": "brush",
                "value": {},
                "on": [
                    {
                        "events": "mousedown",
                        "update": "isMoving ? brush : {x: x(), y: y(), width: 0, height: 0}"
                    },
                    {
                        "events": "mousemove",
                        "update": "isMoving ?  {x: brushStartX + (x()-startMoveX), y: endY + (y() - startMoveY), width: brush.width, height: brush.height} : isBrushing ? {x: brush.x, y: brush.y, width: x()-brush.x, height: y() - brush.y} : brush" // Update brush size while brushing
                    },
                    {
                        "events": "mouseup",
                        "update": "brush" // Retain last brush position and size on mouseup
                    }
                ]
            },
            {
                "name": "isBrushing",  // Boolean to track if the mouse is down
                "value": false,
                "on": [
                    {
                        "events": "mousedown",
                        "update": "!isMoving"  // Set to true on mousedown
                    },
                    {
                        "events": "mouseup",
                        "update": "false"  // Set to false on mouseup
                    }
                ]
            },
            {
                "name": "brushedData",
                "value": {},
                "on": [
                    {
                        "events": "mouseup",
                        "update": "{x1:invert('xscale', brush.x), y1:invert('yscale', brush.y), x2:invert('xscale', brush.x + brush.width), y2:invert('yscale', brush.y + brush.height)}"
                    }
                ]
            },
            {
                "name": "clickPoint",
                "value": null,
                "on": [
                    { "events": "symbol:click", "update": "datum.rank" }
                ]
            }
        ],
    }


    return (
        <Vega
            spec={spec}
            actions={false}
            signalListeners={signalListeners}
        />
    );

}

export default ScatterPlot;