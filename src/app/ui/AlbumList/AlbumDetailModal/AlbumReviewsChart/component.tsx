import { Vega } from "react-vega";
import { getCSSVariableValue } from '@/app/lib/getCSSVariableValue';
import { useTheme } from '@/providers/theme-provider';
import { Publication } from '@/app/lib/definitions';
import { useState, useEffect } from 'react';
import { type AlbumReviewData } from '../component';

interface ReviewChartData {
    label?: string;
    score: number;
    color: string;
    opacity: number;
}



interface AlbumReviewsChartProps {
    reviews?: AlbumReviewData[];
    publicationsSelected: Publication[];
    chartColorScheme: string[];
}

interface AlbumMean {
    label: string,
    value: number
}
interface AlbumSpread {
    label: string,
    y1: number,
    y2: number
}

const AlbumReviewsChart = ({ reviews, publicationsSelected, chartColorScheme }: AlbumReviewsChartProps) => {

    const { theme } = useTheme();


    const [data, setData] = useState<ReviewChartData[] | null>(null);
    const [meanData, setMeanData] = useState<AlbumMean[] | null>(null);
    const [spreadData, setSpreadData] = useState<AlbumSpread[] | null>(null);

    useEffect(() => {
        if (reviews) {
            const reviewsData: ReviewChartData[] = reviews.map((review: AlbumReviewData) => {
                const pub_index = publicationsSelected.findIndex(item => item.id === review.publication_id)
                return {
                    label: review.name,
                    score: review.score,
                    color: pub_index === -1 ? 'steelblue' : chartColorScheme[pub_index % 6],
                    opacity: pub_index === -1 ? 0.6 : 1
                }
            })
            setData(reviewsData);

            const total = reviewsData.reduce((sum, item) => sum + parseInt(item.score.toString()), 0);
            const mean = total / reviewsData.length;

            // Step 2: Calculate the standard deviation
            const variance = reviewsData.reduce((sum, item) => sum + Math.pow(parseInt(item.score.toString()) - mean, 2), 0) / reviewsData.length;
            const stdDev = Math.sqrt(variance);

            setMeanData([
                {
                    label: 'Average Score',
                    value: parseFloat(mean.toFixed(2))
                }
            ]);

            setSpreadData([
                {
                    label: 'mean + 1 std dev',
                    y2: mean + stdDev,
                    y1: mean - stdDev
                }
            ])


        }
    }, [reviews])

    let spec = {};
    if (data) {
        spec = {
            "$schema": "https://vega.github.io/schema/vega/v5.json",
            "width": 625,
            "height": 250,
            "data": [
                {
                    "name": "reviews",
                    "values": data
                },
                {
                    "name": "mean",
                    "values": meanData
                },
                {
                    "name": "spread",
                    "values": spreadData
                }

            ],
            "autosize": {
                "type": "none",
                "contains": "padding"
            },
            "padding": {
                "left": 50,
                "right": 50,
                "top": 5,
                "bottom": 120
            },

            "scales": [
                {
                    "name": "x",
                    "type": "band",
                    "domain": { "data": "reviews", "field": "label" },
                    "range": "width",
                    "padding": 0.5,
                },
                {
                    "name": "y",
                    "type": "linear",
                    "domain": [0, 100],
                    "nice": true,
                    "range": "height"
                }
            ],

            "axes": [
                {
                    "orient": "bottom",
                    "scale": "x",
                    "labelAngle": "-45",
                    "labelAlign": "right",      // Aligns label horizontally to the right end
                    "labelBaseline": "middle",
                    "labelColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                    "title": "Publication",  // Add the title property for the x-axis
                    "titleColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                    "titlePadding": 10,
                    "titleFontSize": 16,        // Set the font size
                    "titleFont": "'Inconsolata', sans-serif"
                },
                {
                    "orient": "left",
                    "scale": "y",
                    "labelColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                    "labelPadding": 2,
                    "title": "Score",  // Add the title property for the x-axis
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
                    "from": { "data": "reviews" },
                    "encode": {
                        "enter": {
                            "x": { "scale": "x", "field": "label" },
                            "width": { "scale": "x", "band": "true" },
                            "y": { "scale": "y", "field": "score" },
                            "y2": { "scale": "y", "value": 0 },
                            "fill": { "field": "color" },
                            "stroke": { "value": `${getCSSVariableValue('--bp-theme-border-color', theme)}` },
                            "strokeWidth": { "value": 1 },
                            "opacity": { "field": "opacity" }
                        }
                    }
                },
                {
                    "type": "rule",
                    "from": { "data": "mean" },
                    "encode": {
                        "enter": {
                            "x": { "value": 0 },
                            "y": { "scale": "y", "field": "value", "band": 0.5 },
                            "x2": { "signal": "width" },
                            "stroke": { "value": 'orange' },
                            "strokeWidth": { "value": 2 },
                            "opacity": { "value": 1 }  // Temporarily set to 1 for debugging
                        },
                    }
                },
                {
                    "type": "text",
                    "from": { "data": "mean" },
                    "encode": {
                        "enter": {
                            "x": { "signal": "width", "offset": 3 },
                            "y": { "scale": "y", "field": "value", "offset": 3 },
                            "text": { "field": "value" },
                            "opacity": { "value": 1 },  // Temporarily set to 1 for debugging
                            "fill": { "value": `${getCSSVariableValue('--bp-theme-text-color', theme)}` }
                        },
                    }
                },
                {
                    "type": "rect",
                    "from": { "data": "spread" },
                    "encode": {
                        "enter": {
                            "x": { "value": 0 },
                            "width": { "signal": "width" },
                            "y": { "scale": "y", "field": "y1" },
                            "y2": { "scale": "y", "field": "y2" },
                            "fill": { "value": "orange" },
                            "opacity": { "value": 0.3 }
                        }
                    }
                },
            ]
        }
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Vega
                spec={spec}
                actions={false}
            />
        </div>
    )
}

export default AlbumReviewsChart;