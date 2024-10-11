'use client'
import React, { useState } from 'react'
import { Vega } from "react-vega";
import { getCSSVariableValue } from '@/app/lib/getCSSVariableValue';
import { useTheme } from '@/providers/theme-provider';

interface TestBarChartProps {
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

const cubicEaseOut = (t: number) => {
    return 1 - Math.pow(1 - t, 3); // This gives a curve that starts fast and slows down
};

// const handleClick = (name: any, value: any) => {
//     console.log('hello')
// };

// const signalListeners = { clickBar: handleClick };


const TestBarChart = ({ chartIndex }: TestBarChartProps): JSX.Element => {

    const { theme } = useTheme();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [randomData, setRandomData] = useState<any>(null);

    const initialData = [
        { 'label': true, 'isNew': false, "category": "0-0.5", "value": 2 },
        { 'label': true, 'isNew': false, "category": "0.6-1", "value": 12 },
        { 'label': true, 'isNew': false, "category": "1.1-1.5", "value": 15 },
        { 'label': true, 'isNew': false, "category": "1.6-2", "value": 20 },
        { 'label': true, 'isNew': false, "category": "2.1-2.5", "value": 18 },
        { 'label': true, 'isNew': false, "category": "2.6-3", "value": 21 },
        { 'label': true, 'isNew': false, "category": "3.1-3.5", "value": 31 },
        { 'label': true, 'isNew': false, "category": "3.6-4", "value": 41 },
        { 'label': true, 'isNew': false, "category": "4.1-4.5", "value": 50 },
        { 'label': true, 'isNew': false, "category": "4.6-5", "value": 60 },
        { 'label': true, 'isNew': false, "category": "5.1-5.5", "value": 58 },
        { 'label': true, 'isNew': false, "category": "5.6-6", "value": 81 },
        { 'label': true, 'isNew': false, "category": "6.1-6.5", "value": 84 },
        { 'label': true, 'isNew': false, "category": "6.6-7", "value": 78 },
        { 'label': true, 'isNew': false, "category": "7.1-7.5", "value": 81 },
        { 'label': true, 'isNew': false, "category": "7.6-8", "value": 64 },
        { 'label': true, 'isNew': false, "category": "8.1-8.5", "value": 32 },
        { 'label': true, 'isNew': false, "category": "8.6-9", "value": 12 },
        { 'label': true, 'isNew': false, "category": "9.1-9.5", "value": 4 },
        { 'label': true, 'isNew': false, "category": "9.6-10", "value": 3 },
    ]

    const handleClick = () => {
        generateRandomSubset();
        requestAnimationFrame(animateBars)
    };

    const signalListeners = { "clickBar": handleClick };

    const [data, setData] = useState(initialData);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spec: any = {
        "$schema": "https://vega.github.io/schema/vega/v5.json",
        "width": 450,
        "height": 275,
        "data": {
            "name": "table",
            "values": data
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
                "type": "band",
                "domain": { "data": "table", "field": "category" },
                "range": "width",
                "padding": 0.3,
            },
            {
                "name": "yscale",
                "type": "linear",
                "domain": { "data": "table", "field": "value" },
                "nice": true,
                "range": "height"
            }
        ],

        "axes": [
            {
                "orient": "bottom",
                "scale": "xscale",
                "labelAngle": -45,
                "labelColor": `${getCSSVariableValue('--theme-text-color', theme)}`,
                "labelPadding": 10,
                "title": "Score",  // Add the title property for the x-axis
                "titleColor": `${getCSSVariableValue('--theme-text-color', theme)}`,
                "titlePadding": 10,
                "titleFontSize": 16,        // Set the font size
                "titleFont": "'Inconsolata', sans-serif"
            },
            {
                "orient": "left",
                "scale": "yscale",
                "labelColor": `${getCSSVariableValue('--theme-text-color', theme)}`,
                "labelPadding": 2,
                "title": "Number of Albums",  // Add the title property for the x-axis
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
                    "enter": {
                        "x": { "scale": "xscale", "field": "category" },
                        "width": { "scale": "xscale", "band": 1 },
                        "y": { "scale": "yscale", "field": "value" },
                        "y2": { "scale": "yscale", "value": 0 },
                        "fill": { "value": '#0C0A09' },
                        "stroke": { "value": "#0C0A09" }
                    },
                    "update": {
                        "fill": [
                            {
                                "test": "datum.isNew === true",
                                "value": "#FDBA74"
                            },
                            {
                                "value": chartColorSchemes[chartIndex % 6]
                            }
                        ],
                    }

                }
            },
            {
                "type": "text",
                "from": { "data": "table" },
                "encode": {
                    "enter": {
                        "x": { "scale": "xscale", "field": "category", "band": 0.5 },  // Center the text on the bar
                        "y": { "scale": "yscale", "field": "value", "offset": -5 },
                        "text": { "field": "value" },
                        "align": { "value": "center" },
                        "baseline": { "value": "bottom" },
                        "fill": { "value": `${getCSSVariableValue('--theme-text-color', theme)}` },
                        "fontSize": { "value": 12 },
                    },
                    "update": {
                        "opacity": { "signal": "datum.label ? 1 : 0" },
                        "fontSize": { "signal": "datum.isNew ? 10 : 12 " }  // Control opacity based on hasLabel
                    }
                }
            }
        ],
        "signals": [
            {
                "name": "hoveredData",
                "value": null,
                "on": [
                    { "events": "rect:mouseover", "update": "datum" },
                    { "events": "rect:mouseout", "update": "null" }
                ]
            },
            {
                "name": "clickBar",
                "value": null,
                "on": [
                    { "events": "rect:click", "update": "datum.category" }
                ]
            }

        ]
    }

    const generateRandomSubset = () => {

        const subsetSize = Math.ceil(Math.random() * 20);
        const originalData = [...initialData];
        const shuffled = originalData.sort(() => 0.5 - Math.random());
        const selectedSubset = shuffled.slice(0, subsetSize);

        // Modify the selected subset: reduce value and set isNew to true
        const newSubset = selectedSubset.map(entry => {
            const reducedValue = Math.floor(Math.random() * entry.value);  // Generate a random value less than original
            if (reducedValue > 0) {
                return {
                    ...entry,
                    value: reducedValue,
                    isNew: true
                };
            }

        }).filter(entry => entry !== undefined);
        setRandomData(newSubset);
    }

    const addData = (scale: number) => {
        if (randomData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tempNewData = randomData.map((entry: any) => { return { ...entry, "value": entry.value * scale, "label": false } })
            setData([
                ...initialData,
                ...tempNewData
            ])
        }
    }

    let start: DOMHighResTimeStamp | null = null;
    const duration = 500;

    // Add data using scale
    const animateBars = (timestamp: DOMHighResTimeStamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;

        const t = progress / duration;
        const scale = cubicEaseOut(t);

        addData(scale);

        if (progress < duration) {
            requestAnimationFrame(animateBars);
        } else {
            // Finish. When input is 1, adds marks
            addData(1);
        }
    }

    return (
        <Vega
            spec={spec}
            actions={false}
            signalListeners={signalListeners}
        />
    );

}

export default TestBarChart;