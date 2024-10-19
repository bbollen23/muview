'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Vega } from "react-vega";
import { getCSSVariableValue } from '@/app/lib/getCSSVariableValue';
import { useTheme } from '@/providers/theme-provider';
import { useDataStore } from "@/providers/data-store-provider";
import { AlbumIdsSelected, AlbumIdsSelectedRanking, Publication, Filter } from '@/app/lib/definitions';
import styles from './component.module.scss';
import { Card, Button, Divider, Scrollable, Tabs, LoadingOverlay, LoadingIcon } from '@bbollen23/brutal-paper';
import { GenrePlot, UpsetPlot } from '@/app/ui';
import dynamic from "next/dynamic";





interface FilterComponentProps {
    filter: Filter,
    add: boolean
}

const pillColors = [
    '#2dd4bf', //teal 400,
    '#84cc16', // lime 500,
    '#d946ef', //fuchsia 500
    '#9d174d', //pink 800,
    '#fb7185', // rose 400,
    '#7c3aed', // purple 600
]

interface ReadableLabelData {
    label: string;
    readableLabel: string;
}

const getReadableLabel = (label: string, publicationsSelected: Publication[]) => {
    const labelSplit = label.split('-');
    const pubName = publicationsSelected.find((pub: Publication) => pub.id === parseInt(labelSplit[0]))?.name;

    const binOrScore = labelSplit[1];
    let suffix = '';
    if (binOrScore !== 'brush') {
        suffix = binOrScore.replace(',', ' to ');
    } else {
        suffix = 'Rankings'
    }
    return `${pubName} - ${suffix}`
}

const getReadableLabels = (groupList: Record<string, number[]>, publicationsSelected: Publication[]) => {
    const readableLabels: ReadableLabelData[] = []
    Object.keys(groupList).forEach((label: string) => {
        readableLabels.push({
            label,
            readableLabel: getReadableLabel(label, publicationsSelected)
        })
    })
    return readableLabels;
}


const FilterPageComponent = (): JSX.Element => {
    // Grab theme
    const { theme } = useTheme();

    const publicationsSelected = useDataStore((state) => state.publicationsSelected);
    const selectedFilters = useDataStore((state) => state.selectedFilters);
    const addFilter = useDataStore((state) => state.addFilter);
    const removeFilter = useDataStore((state) => state.removeFilter);

    const [hoveredInfo, setHoveredInfo] = useState<Filter | null>(null)


    const handleHoverData = useCallback((filter: Filter) => {
        setHoveredInfo(filter);
    }, [])


    const FilterComponent = ({ filter, add }: FilterComponentProps) => {
        if (filter.type === 'genre-filter') return (
            <Card
                size="sm"
                actionPosition='right'
                actions={
                    <Button
                        flat
                        disabled={add && selectedFilters.some(item => item.id === filter.id)}
                        label={add ? "Add As Filter" : "Remove filter"}
                        onClick={add ? () => addFilter(filter) : () => removeFilter(filter)}
                    />
                }
            >
                <div style={{ fontSize: '1rem', marginBottom: '10px', fontWeight: 'bold' }}>Selectors</div>
                <div className={styles.selectorRow}>
                    {filter.groupLabels.map((label: string, index: number) => {
                        return (
                            <div key={label} style={{ 'backgroundColor': pillColors[index % 6] }} className="pill">
                                {label}
                            </div>
                        )
                    })}
                </div>
            </Card>
        )
        return (
            <Card
                size="sm"
                actions={
                    <Button
                        flat
                        disabled={add && selectedFilters.some(item => item.id === filter.id)}
                        label={add ? "Add As Filter" : "Remove filter"}
                        onClick={add ? () => addFilter(filter) : () => removeFilter(filter)}
                    />
                }
            >
                <div style={{ fontSize: '1rem', marginBottom: '10px', fontWeight: 'bold' }}>Selectors</div>
                <div className={styles.selectorRow}>
                    {filter.groupLabels.map((label: string, index: number) => {
                        return (
                            <div key={label} style={{ 'backgroundColor': pillColors[index % 6] }} className="pill">
                                {getReadableLabel(label, publicationsSelected)}
                            </div>
                        )
                    })}
                </div>
                <div style={{ fontSize: '1rem', margin: '20px 0px 10px 0px', fontWeight: 'bold' }}>Statistics</div>
                <div style={{ fontSize: '0.9rem' }}>{filter.type === 'upset-filter' ? 'Number of Albums In Intersection: ' : 'Number of Albums in Set: '} <b>{filter.albumIds?.length}</b></div>
            </Card>
        )
    }

    const HoveredInfoComponent = () => {
        if (!hoveredInfo) return <></>
        return (
            <FilterComponent filter={hoveredInfo} add={true} />
        )
    }

    const SelectedFiltersComponent = () => {
        if (selectedFilters.length === 0) return <div style={{ marginLeft: '20px', marginTop: '20px' }}>No Filters selected.</div>
        return (
            <>
                {selectedFilters.map((filter: Filter) => {
                    return (
                        <FilterComponent filter={filter} add={false} />
                    )
                })}
            </>
        )
    }

    const LazyLoadingComponent = () => {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '200px' }}>
                    <div style={{ fontSize: '1.2rem' }}>Loading</div>
                    <LoadingIcon visible={true} />
                </div>
            </div>)
    }

    const DynamicUpsetPlot = dynamic(() => import('@/app/ui/FilterPageComponent/UpsetPlot/component'), {
        loading: () => <LazyLoadingComponent />,
        ssr: false
    })

    const DynamicGenrePlot = dynamic(() => import('@/app/ui/FilterPageComponent/GenrePlot/component'), {
        loading: () => <LazyLoadingComponent />,
        ssr: false
    })

    const tabsData = [
        {
            label: 'UpSet Plot Filtering', 'content': useMemo(() => <DynamicUpsetPlot onHover={handleHoverData} />, [])
        },
        { label: 'Genre Filtering', 'content': useMemo(() => <DynamicGenrePlot onHover={handleHoverData} />, []) }
    ]

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 500px', height: 'calc(100vh - 160px)' }}>
            <div>
                <Tabs tabData={tabsData} />
            </div>
            <div style={{ height: '100%', borderLeft: '1px solid var(--bp-theme-border-color)' }}>
                <div>
                    <h1 style={{ margin: 0, padding: 0, paddingLeft: '20px' }}>Current Hovered Data</h1>
                    <HoveredInfoComponent />
                    <h1 style={{ margin: 0, marginTop: '40px', padding: 0, paddingLeft: '20px' }}>Chosen Filters</h1>
                    <Divider />
                </div>
                <Scrollable height='calc(100vh - 450px)' width='100%'>
                    <SelectedFiltersComponent />
                </Scrollable>
            </div>


        </div>

    );

}

export default FilterPageComponent;