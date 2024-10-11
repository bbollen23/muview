'use client'
import React from 'react'
import { Vega } from "react-vega";
import { getCSSVariableValue } from '@/app/lib/getCSSVariableValue';
import { useTheme } from '@/providers/theme-provider';

interface TestScatterPlotProps {
    chartIndex: number
}


const chartColorSchemes =
    [
        "#2563EB", //blue 600
        "#65A30D", // lime 600
        "#C026D3", // Fuchsia 600
        "#0D9488", // teal 600
        "#0EA5E9", // sky 500
        "#E11D48", // rose 600
    ]


const TestScatterPlot = ({ chartIndex }: TestScatterPlotProps): JSX.Element => {

    const initialData = [
        { 'label': true, 'isNew': false, "ranking": 2, "score": 9 },
        { 'label': true, 'isNew': false, "ranking": 3, "score": 9.2 },
        { 'label': true, 'isNew': false, "ranking": 12, "score": 7.8 },
        { 'label': true, 'isNew': false, "ranking": 7, "score": 8.1 },
        { 'label': true, 'isNew': false, "ranking": 34, "score": 6.2 },
        { 'label': true, 'isNew': false, "ranking": 45, "score": 8.9 },
        { 'label': true, 'isNew': false, "ranking": 72, "score": 8.3 },

    ]


    const { theme } = useTheme();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spec: any = {
        "$schema": "https://vega.github.io/schema/vega/v5.json",
        "width": 450,
        "height": 275,
        "data": {
            "name": "table",
            "values": initialData
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
                "domain": { "data": "table", "field": "ranking" },
                "range": "width"
            },
            {
                "name": "yscale",
                "type": "linear",
                "round": true,
                "nice": true,
                "zero": true,
                "domain": { "data": "table", "field": "score" },
                "range": "height"
            }
        ],

        "axes": [
            {
                "orient": "bottom",
                "scale": "xscale",
                "labelColor": `${getCSSVariableValue('--theme-text-color', theme)}`,
                "labelPadding": 10,
                "title": "Year End Ranking",  // Add the title property for the x-axis
                "titleColor": `${getCSSVariableValue('--theme-text-color', theme)}`,
                "titlePadding": 10,
                "titleFontSize": 16,        // Set the font size
                "titleFont": "'Inconsolata', sans-serif",
                "offset": 10
            },
            {
                "orient": "left",
                "scale": "yscale",
                "labelColor": `${getCSSVariableValue('--theme-text-color', theme)}`,
                "labelPadding": 2,
                "title": "Original Score",  // Add the title property for the x-axis
                "titleColor": `${getCSSVariableValue('--theme-text-color', theme)}`,
                "titlePadding": 10,
                "titleFontSize": 16,        // Set the font size
                "titleFont": "'Inconsolata', sans-serif",
                "grid": true,
                "gridDash": [4, 4],
                "gridOpacity": 0.2,
                "gridColor": `${getCSSVariableValue('--theme-text-color', theme)}`,
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
                        "x": { "scale": "xscale", "field": "ranking" },
                        "y": { "scale": "yscale", "field": "score" },
                        "size": { "value": 100 },
                        "fill": { "value": `${chartColorSchemes[chartIndex % 6]}` },
                        "stroke": { "value": "black" }
                    },
                    "update": {

                        "fillOpacity": {
                            "signal": "scale('xscale', datum.ranking) >= min(brush.x, brush.x + brush.width) && scale('xscale', datum.ranking) <= max(brush.x, brush.x + brush.width) && scale('yscale', datum.score) >= min(brush.y, brush.y + brush.height) && scale('yscale', datum.score) <= max(brush.y, brush.y + brush.height)  ? 1 : brush.width && abs(brush.width) > 3 ? 0.3 : 1 "
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
                "name": "clickPoint",
                "value": null,
                "on": [
                    { "events": "symbol:click", "update": "datum.ranking" }
                ]
            }
        ],
    }


    return (
        <Vega
            spec={spec}
            actions={false} />
    );

}

export default TestScatterPlot;