'use client'
import React, { useEffect } from 'react'
import { Vega } from "react-vega";
import { getCSSVariableValue } from '@/app/lib/getCSSVariableValue';
import { useTheme } from '@/providers/theme-provider';
import type { Publication } from '@/app/lib/definitions';
import { useDataStore } from "@/providers/data-store-provider";
import useSWR from 'swr';
import { LoadingIcon } from '@bbollen23/brutal-paper';
import { fetcher } from '@/app/lib/fetcher';


interface ScatterPlotProps {
    publication_id: number,
    years: number[]
}

interface BrushSelectionData {
    x1: number,
    x2: number,
    y1: number,
    y2: number
}


const ScatterPlot = ({ publication_id, years }: ScatterPlotProps): JSX.Element => {

    const publicationsSelected = useDataStore((state) => state.publicationsSelected);
    const chartColorScheme = useDataStore((state => state.chartColorScheme));
    const brushSelection = useDataStore((state => state.brushSelection))
    const addRankings = useDataStore((state) => state.addRankings);

    const { data, error, isLoading } = useSWR(`/api/rankings?publication_ids=${[publication_id]}&years=${years}`, fetcher)

    // const rankingData = rankings[publication_id];

    const color = chartColorScheme[publicationsSelected.findIndex(item => item.id === publication_id)]


    const { theme } = useTheme();

    useEffect(() => {
        if (data) {
            addRankings(data.newRankings, years);
        }
    }, [data])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBrushData = (name: string, value: any) => {
        console.log(value);
        const { x1, x2, y1, y2 } = value as BrushSelectionData;
        brushSelection(x1, x2, y1, y2, years, publication_id);
    }


    const signalListeners = {
        "brushedData": handleBrushData
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let spec: any = {};
    if (data) {
        spec = {
            "$schema": "https://vega.github.io/schema/vega/v5.json",
            "width": 450,
            "height": 275,
            "data": {
                "name": "table",
                "values": data.newRankings
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
    }


    if (isLoading) return (
        <div style={{ width: '450px', height: '275px', display: 'flex', flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '80px' }}>
                Loading<LoadingIcon visible={true} />
            </div>
        </div>)

    if (error) return <div>Oh no!</div>

    if (data && data.newRankings && data.newRankings.length == 0) return (
        <div style={{ width: '450px', height: '275px', display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ marginTop: '-80px' }}>
                There is no year-end ranking data for {publicationsSelected.find((pub: Publication) => pub.id === publication_id)?.name}.
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

export default ScatterPlot;