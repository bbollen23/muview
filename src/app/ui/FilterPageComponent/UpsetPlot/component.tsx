'use client'
import React, { useState, useEffect } from 'react'
import { Vega } from "react-vega";
import { getCSSVariableValue } from '@/app/lib/getCSSVariableValue';
import { useTheme } from '@/providers/theme-provider';
import { useDataStore } from "@/providers/data-store-provider";
import { AlbumIdsSelected, AlbumIdsSelectedRanking, Publication, Filter } from '@/app/lib/definitions';
import { Modal, ModalContent, ModalHeader, Button, Icon, Tooltip, Scrollable } from '@bbollen23/brutal-paper';
import Link from 'next/link';
import { parseLabel } from '@/app/lib/parseLabel';
import styles from './component.module.scss';

interface UpsetData {
    setLabel: string;
    sets: number[];
    intersectionSize: number;
    albumIds: number[];
    x1: number;
    x2: number;
}

interface MatrixData {
    setLabel: string;
    x: number;
    visible: boolean;
}

type GroupList = Record<string, number[]>

interface GroupListData {
    label: string;
    count: number
}

interface ReadableLabelData {
    label: string;
    readableLabel: string;
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


const generateGroups = (selectedAlbumIds: AlbumIdsSelected, selectedAlbumIdsRankings: AlbumIdsSelectedRanking, consolidateGroups: boolean): GroupList => {

    const addToGroupList = (groupString: string, albumIds: number[]) => {
        if (groupList[groupString]) {
            groupList[groupString] = groupList[groupString].concat(albumIds);
        } else {
            groupList[groupString] = albumIds;
        }
    };


    const groupList: Record<string, number[]> = {};
    Object.values(selectedAlbumIds).forEach((pubIdRecord) => {
        Object.entries(pubIdRecord).forEach(([pubId, binnedAlbums]) => {
            const pubIdString = `${pubId}`;
            Object.entries(binnedAlbums).forEach(([bin, albumIds]) => {
                const groupString = consolidateGroups ? pubIdString : `${pubIdString}-${bin}`;
                addToGroupList(groupString, albumIds);
            })
        })
    });

    Object.values(selectedAlbumIdsRankings).forEach((pubIdRecord) => {
        Object.entries(pubIdRecord).forEach(([pubId, albumIds]) => {
            const groupString = consolidateGroups ? `${pubId}` : `${pubId}-brush`;
            addToGroupList(groupString, albumIds);
        })
    });
    return groupList;
}


const generateUpsetDataExclusive = (groupList: Record<string, number[]>, inclusive: boolean): UpsetData[] => {
    const keys = Object.keys(groupList);  // The keys of the groups (e.g., "2023-19-65,70", etc.)
    const numSets = keys.length;  // Number of sets
    const numIntersections = Math.pow(2, numSets);  // 2^numSets combinations
    const intersections: UpsetData[] = [];

    // Helper function to calculate the intersection of a specific combination of sets
    const calculateIntersection = (sets: number[]): number[] => {
        return sets.reduce((intersection: number[], currentSet, index) => {
            if (currentSet === 1) {

                // Intersect the current set with the accumulated intersection
                const setData = groupList[keys[index]];

                if (index === sets.indexOf(1)) return setData; // If the first time we hit a 1, then return the set data
                if (intersection.length === 0) return []; //If empty, finish and return.
                const newIntersection = intersection.filter(item => setData.includes(item))

                return newIntersection; // Perform intersection
            }

            return intersection;
        }, []);
    };

    // Keep track of elements already accounted for in larger intersections
    const accountedElements = new Set<number>();

    // Iterate over all possible intersections, starting from the largest combinations (highest number of 1s)
    for (let i = numIntersections - 1; i > 0; i--) {
        const binaryStr = i.toString(2).padStart(numSets, '0');
        const sets = binaryStr.split('').map(Number);  // Convert the binary string to an array of 1s and 0s
        let intersectingElements = calculateIntersection(sets);

        // Remove any elements already accounted for in larger intersections
        if (!inclusive) {
            intersectingElements = intersectingElements.filter(item => !accountedElements.has(item));
        }

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
                albumIds: intersectingElements,
                x1,
                x2
            });
            // Mark these elements as accounted for
            intersectingElements.forEach(item => accountedElements.add(item));
        }
    }
    return intersections;
};

const getReadableLabels = (groupList: Record<string, number[]>, publicationsSelected: Publication[], consolidateGroups: boolean) => {
    const readableLabels: ReadableLabelData[] = []
    Object.keys(groupList).forEach((label: string) => {
        const { pub_name, suffix } = parseLabel(label, publicationsSelected, consolidateGroups);

        readableLabels.push({
            label,
            readableLabel: consolidateGroups ? `${pub_name}` : suffix ? `${pub_name} - ${suffix}` : `${pub_name}`
        })
    })
    return readableLabels;
}

interface UpsetPlotProps {
    onHover: (filter: Filter) => void;
}

const UpsetPlot = ({ onHover }: UpsetPlotProps): JSX.Element => {
    // Grab theme
    const { theme } = useTheme();

    const selectedAlbumIds = useDataStore((state) => state.selectedAlbumIds);
    const selectedAlbumIdsRankings = useDataStore((state => state.selectedAlbumIdsRankings));
    const publicationsSelected = useDataStore((state) => state.publicationsSelected);
    const filterPlotSelectionColors = useDataStore((state) => state.filterPlotSelectionColors);
    const filterPlotBarColors = useDataStore((state) => state.filterPlotBarColors);
    const upsetConsolidate = useDataStore((state) => state.upsetConsolidate);
    const upsetInclusive = useDataStore((state) => state.upsetInclusive);
    const toggleConsolidate = useDataStore((state) => state.toggleConsolidate);
    const toggleInclusive = useDataStore((state) => state.toggleInclusive);

    const [groupListData, setGroupListData] = useState<GroupListData[]>([]);
    const [matrixData, setMatrixData] = useState<MatrixData[]>([]);
    const [upsetData, setUpsetData] = useState<UpsetData[]>([]);
    const [groupList, setGroupList] = useState<GroupList>({});
    const [readableLabelData, setReadableLabelData] = useState<ReadableLabelData[]>([])

    const [modalOpened, setModalOpened] = useState<boolean>(false);


    const toggleModal = () => {
        setModalOpened((prev) => !prev);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleHoverData = (name: string, value: any) => {
        if (value) {
            if (value.setLabel) {
                const splitLabel = value.setLabel.split('#');
                const newHoverState = Object.fromEntries(Object.keys(groupList).map(key => [key, false]))
                splitLabel.forEach((label: string) => {
                    newHoverState[label] = true
                })
                onHover({
                    id: value.setLabel,
                    groupLabels: splitLabel,
                    albumIds: value.albumIds,
                    type: 'upset-filter'
                });
            } else if (value.label) {
                onHover({
                    id: `${value.label}-single`,
                    groupLabels: [value.label],
                    albumIds: groupList[value.label],
                    type: 'upset-set-filter'
                })
            }
        }
    }

    const signalListeners = {
        "hoverData": handleHoverData
    };

    useEffect(() => {
        const _groupList = generateGroups(selectedAlbumIds, selectedAlbumIdsRankings, upsetConsolidate);
        const _groupListData = Object.entries(_groupList).map((entry) => {
            return {
                "label": entry[0],
                "count": entry[1].length
            }
        })

        const _upsetData = generateUpsetDataExclusive(_groupList, upsetInclusive);
        const _matrixData = generateMatrixData(_upsetData);
        const _readableLabelData = getReadableLabels(_groupList, publicationsSelected, upsetConsolidate);

        setUpsetData(_upsetData);
        setMatrixData(_matrixData);
        setGroupListData(_groupListData);
        setGroupList(_groupList);
        setReadableLabelData(_readableLabelData);
    }, [upsetInclusive, upsetConsolidate])

    const width = 650;
    const xSetsBandPadding = 0.2;
    const paddingRight = 40;
    const paddingLeft = 0;
    const paddingTop = 80;
    const paddingBottom = 70;

    const height = Math.max(((Object.keys(upsetData).length * 30) + 100 + paddingTop + paddingBottom), 200 + 100 + paddingTop + paddingBottom)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let spec: any = {};
    spec = {
        "$schema": "https://vega.github.io/schema/vega/v5.json",
        "width": width,
        "height": height,
        "data": [
            {
                "name": "upsetData",
                "values": upsetData,
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
                "values": matrixData
            },
            {
                "name": "setData",
                "values": groupListData
            },
            {
                "name": "labelData",
                "values": readableLabelData
            }
        ],
        "autosize": {
            "type": "none",
            "contains": "padding"
        },
        "padding": {
            "left": paddingLeft,
            "right": paddingRight,
            "top": paddingTop,
            "bottom": paddingBottom
        },

        "scales": [
            {
                "name": "x",
                "type": "linear",
                "domain": { "data": "upsetData", "field": "intersectionSize" },
                "nice": true,
                "range": [{ "signal": "width * 0.3" }, { "signal": "width" }]
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
                "padding": xSetsBandPadding
            },

            {
                "name": "xSets",
                "type": "band",
                "domain": { "data": "setData", "field": "label" },
                "range": [0, { "signal": "width * 0.3" }],
                "padding": xSetsBandPadding
            },
            {
                "name": "ySets",
                "type": "linear",
                "domain": { "data": "setData", "field": "count" },
                "range": [90, 0]
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
                "orient": "top",
                "scale": "x",
                "labelColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                "labelPadding": 10,
                "title": "Number of Albums In Intersection",  // Add the title property for the x-axis
                "titleColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
                "titlePadding": 10,
                "titleFontSize": 16,        // Set the font size
                "titleFont": "'Inconsolata', sans-serif",
                "offset": -89
            },
            // {
            //     "orient": "top",
            //     "scale": "xSets",
            //     "labelAngle": -45,
            //     "labels": false,
            //     "labelOffset": 15,
            //     "labelColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
            //     "labelPadding": 20,
            //     "labelFontSize": 12,
            //     "bandPosition": 0.5,
            //     "ticks": false,
            //     "titleColor": `${getCSSVariableValue('--bp-theme-text-color', theme)}`,
            //     "titlePadding": 10,
            //     "titleFontSize": 16,        // Set the font size
            //     "titleFont": "'Inconsolata', sans-serif"
            // },
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
                        "cornerRadiusTopRight": { "value": 4 },
                        "cornerRadiusBottomRight": { "value": 4 }

                    },
                    "update": {
                        "fill": {
                            "signal": `hoverData && hoverData.setLabel === datum.setLabel ? '${filterPlotSelectionColors[theme]}': '${filterPlotBarColors[theme]}'`
                        },
                    },
                },
            },
            {
                "type": "rect",
                "from": { "data": "setData" },
                "encode": {
                    "enter": {
                        "x": { "scale": "xSets", "field": "label", "offset": 0 },  // Removed band: true
                        "width": { "scale": "xSets", "band": 1 },  // Auto-size bar width to band
                        "y": { "scale": "ySets", "field": "count" },  // Use 'count' for height
                        "y2": { "scale": "ySets", "value": 0 },  // Set y2 at the bottom
                        "fill": { "value": filterPlotBarColors[theme] },
                        "cornerRadiusTopRight": { "value": 4 },
                        "cornerRadiusTopLeft": { "value": 4 }
                    },
                    "update": {
                        "fill": {
                            "signal": `hoverData && hoverData.setLabel && replace(hoverData.setLabel, datum.label, ' ') !== hoverData.setLabel ? '${filterPlotSelectionColors[theme]}': hoverData && hoverData.label === datum.label ? '${filterPlotSelectionColors[theme]}' : '${filterPlotBarColors[theme]}'`
                        },
                    },
                }
            },
            {
                "type": "rule",
                "from": { "data": "upsetData" },
                "encode": {
                    "enter": {
                        "x": { "scale": "xMatrix", "field": "x1", "band": 0.5 },
                        "y": { "scale": "y", "field": "setLabel", "band": 0.5 },
                        "x2": { "scale": "xMatrix", "field": "x2", "band": 0.5 },
                        "y2": { "scale": "y", "field": "setLabel", "band": 0.5 },
                        "stroke": { "value": filterPlotBarColors[theme] },
                        "strokeWidth": { "value": 1 },
                        "opacity": { "value": 1 }  // Temporarily set to 1 for debugging
                    },
                    "update": {
                        "stroke": {
                            "signal": `hoverData && hoverData.setLabel === datum.setLabel ? '${filterPlotSelectionColors[theme]}': '${filterPlotBarColors[theme]}'`
                        },
                    },

                }
            },
            {
                "type": "symbol",
                "from": { "data": "matrixData" },
                "encode": {
                    "enter": {
                        "x": { "scale": "xMatrix", "field": "x", "band": 0.5 },
                        "y": {
                            "scale": "y",
                            "field": "setLabel",
                            "band": 0.5
                        },
                        "size": { "value": 150 },
                        "fill": { "value": filterPlotBarColors[theme] },
                        "fillOpacity": { "signal": `datum.visible ? 1 : '${theme}' === 'light' ? 0.25 : 0.05` },
                        "stroke": { "value": "black" }
                    },
                    "update": {
                        "fill": {
                            "signal": `hoverData && hoverData.setLabel === datum.setLabel && datum.visible ? '${filterPlotSelectionColors[theme]}': hoverData && hoverData.label && datum.visible && scale('xSets', hoverData.label) === scale('xMatrix',datum.x) ? '${filterPlotSelectionColors[theme]}' : '${filterPlotBarColors[theme]}'`
                        },
                        "strokeWidth": {
                            "signal": ` datum.visible ? 2: 0`
                        },
                    },
                }
            },
            {
                "type": "text",
                "from": { "data": "upsetData" },
                "encode": {
                    "enter": {
                        "x": { "scale": "x", "field": "intersectionSize" },
                        "dx": { "value": 12 },
                        "y": { "scale": "y", "field": "setLabel" },
                        "dy": { "value": 20 },
                        "fontSize": { "value": 12 },
                        "text": { "field": "intersectionSize" },
                        "fill": { "value": `${getCSSVariableValue('--bp-theme-text-color', theme)}` },
                        "font": { "value": "'Inconsolata', sans-serif" }
                    }
                }
            },
            // {
            //     "type": "text",
            //     "from": { "data": "labelData" },
            //     "encode": {
            //         "enter": {
            //             // "dx": { "signal": "width" }, // Use x scale for the end position
            //             "x": { "scale": "xSets", "field": "label" },
            //             "dx": { "value": 12 }, // Use x scale for the end position
            //             "y": { "scale": "y", "value": 90 }, // Position vertically based on setLabel
            //             "dy": { "value": 0 }, // Adjust dy to vertically center the text (can be modified)
            //             "fontSize": { "value": 12 },
            //             "angle": { "value": -45 },
            //             "text": { "field": "readableLabel" },
            //             "fill": { "value": `${getCSSVariableValue('--bp-theme-text-color', theme)}` },
            //             "font": { "value": "'Inconsolata', sans-serif" }
            //         },
            //         "update": {
            //             "fontWeight": {
            //                 "signal": `hoverData && hoverData.setLabel && replace(hoverData.setLabel, datum.label, ' ') !== hoverData.setLabel ? 'bold': hoverData && hoverData.label === datum.label ? 'bold' : 'normal'`
            //             },
            //             "fontSize": {
            //                 "signal": `hoverData && hoverData.setLabel && replace(hoverData.setLabel, datum.label, ' ') !== hoverData.setLabel ? 10: hoverData && hoverData.label === datum.label ? 10 : 10`
            //             },
            //         },
            //     }
            // },
            // {
            //     "type": "image",
            //     "from": { "data": "labelData" },
            //     "encode": {
            //         "enter": {
            //             "opacity": { "value": 1 },
            //             "url": { "value": "http://localhost:3030/images/the-needle-drop.webp" },
            //             "x": { "scale": "xSets", "field": "label", "offset": -5 },
            //             "y": { "scale": "yText", "value": 0, "offset": 20 },
            //             "baseline": { "value": "bottom" },
            //             "strokeWidth": { "value": 2 },
            //             "stroke": { "value": "black" },
            //             // "dy": { "value": 20 },
            //             "width": { "value": 30 },
            //             "height": { "value": 30 },
            //             "aspect": { "value": true }
            //         }
            //     }
            // }
        ],
        "signals": [
            {
                "name": "hoverData",
                "value": null,
                "on": [
                    { "events": "rect:mouseover", "update": "datum", "force": true },
                    { "events": "symbol:mouseover", "update": "datum", "force": true },
                    { "events": "rule:mouseover", "update": "datum", "force": true },


                    // { "events": "rect:mouseout", "update": "null", "force": true }
                ]
            },
        ]
    }

    const ConsolidateIcon = () => {
        if (upsetConsolidate) return (
            <Tooltip content='Separate Groups' size='sm'>
                <Icon icon='bi bi-collection-fill' size='xs' onClick={toggleConsolidate} />
            </Tooltip>)

        return (
            <Tooltip content='Consolidate Groups' size='sm'>
                <Icon icon='bi bi-collection' size='xs' onClick={toggleConsolidate} />
            </Tooltip>
        )
    }

    const InclusiveIcon = () => {
        if (upsetInclusive) return (
            <Tooltip content='Use Exclusive Groups' size='sm'>
                <Icon icon='bi bi-box-fill' size='xs' onClick={toggleInclusive} />
            </Tooltip>)

        return (
            <Tooltip content='Use Inclusive Groups' size='sm'>
                <Icon icon='bi bi-box' size='xs' onClick={toggleInclusive} />
            </Tooltip>
        )
    }

    const SelectorIconComponent = () => {
        return <>
            <div className={styles.selectorIconContainer} style={{ height: `${paddingTop - 10}px` }}>
                {Object.keys(groupList).map((key: string, index: number) => {
                    //Total distance covered in this column
                    const dist = (width - paddingRight - paddingLeft) * 0.3;
                    //Total width of each bar without padding
                    const bandWidth = dist / Object.keys(groupList).length

                    const { pub_unique_name, type, bin } = parseLabel(key, publicationsSelected, upsetConsolidate);

                    let contentDisplay = <div></div>;

                    if (upsetConsolidate) {
                        contentDisplay = <></>
                    } else {
                        if (type === 'review') {
                            contentDisplay =
                                <div className={styles.selectorIconBinDisplay}>
                                    {bin?.split('-').map(entry => entry.includes('5') ? parseInt(entry) / 10 : Math.round(parseInt(entry) / 10)).join('-')}
                                </div>
                        } else {
                            contentDisplay =
                                <div className={styles.selectorIconRankingDisplay}>
                                    #
                                </div>
                        }
                    }
                    return (
                        <div
                            key={key}
                            className={styles.selectorIcon}
                            style={{
                                width: bandWidth,
                                top: paddingTop - 40,
                                left: paddingLeft + 10 + (bandWidth * index)
                            }}
                        >
                            {contentDisplay}
                            <img
                                style={{ boxSizing: 'border-box' }}
                                className='pub-icon'
                                src={`/images/${pub_unique_name}.webp`}
                                width={`${Math.min(30, bandWidth - 2)}px`}
                                height={`${Math.min(30, bandWidth - 2)}px`}
                            />

                        </div>

                    )
                })}
            </div>

        </>

    }

    if (Object.keys(groupList).length === 1) return (
        <div className={styles.minSelectorsContainer}>
            The UpSet Plot filtering requires at least 2 selections.
            <Link href="/dashboard">
                <Button style={{ marginTop: '20px' }} label="Go To Dashboard" />
            </Link>
        </div>
    )


    return (
        <>
            <div className={styles.optionsContainer}>
                <InclusiveIcon />
                <ConsolidateIcon />
                <Icon icon='bi bi-question-circle' onClick={toggleModal} size='xs' />
            </div>
            <SelectorIconComponent />
            <Scrollable width="100%" height="calc(100vh - 160px)">
                <Vega
                    spec={spec}
                    actions={false}
                    signalListeners={signalListeners}
                />
            </Scrollable>
            <Modal
                style={{ maxWidth: '700px' }}
                opened={modalOpened}
                setOpened={setModalOpened}
                closeOnOutside
                actions={
                    <>
                        <Button flat label='Close' onClick={toggleModal} />
                    </>
                }>                <ModalHeader
                    closeButton={true}
                    title='UpSet Plot Filtering'
                />
                <ModalContent style={{ marginBottom: '20px' }}>
                    <div className="flex-col gap-10">
                        <div>
                            <p>In MuView, we use an <a href='https://upset.app/' target='_blank' style={{ textDecoration: 'underline' }}>Upset Plot</a> to visualize the exclusive intersections of the data you have selected in the main dashboard. Our goal is to allow you to find Albums which lie in the intersection of multiple groups that you have selected. For example, the UpSet Plot allows you to filter your album list down to a set of albums which only respect the combinations that you&aspos;re interested in.
                            </p>
                            <p>Whenever you select a bar in one of the distributions or make a brush selection in the year-end rankings, you will see a respective &quot;selector&quot; in the UpSet plot. The matrix to the left of the bar chart indicates the selectors which are being intersected and the bar chart indicates how many albums are exclusive to that intersection.</p>
                            <p>The bar chart at the top indicates the sizes of the individual selectors you have chosen.</p>
                            <p>When hovering over any of the bars, you&apos;ll see the &quot;Current Hovered Data&quot; section reflect the dataset that you are hovering over. When you add your very first filter, the Albums List to the right will only include albums within the dataset you selected. All additional upset plot filters will be unioned with the existing album list. This means you can find albums that have specific scores on multiple publications instead.</p>
                        </div>
                    </div>
                </ModalContent>
            </Modal>
        </>

    );

}

export default UpsetPlot;