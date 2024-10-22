'use client'
import React, { useState, useCallback, useMemo } from 'react'
import { useDataStore } from "@/providers/data-store-provider";
import { Filter } from '@/app/lib/definitions';
import styles from './component.module.scss';
import { Card, Button, Divider, Scrollable, Tabs, LoadingIcon } from '@bbollen23/brutal-paper';
import dynamic from "next/dynamic";
import { parseLabel } from '@/app/lib/parseLabel';


interface FilterComponentProps {
    filter: Filter,
    add: boolean
}

const FilterPageComponent = (): JSX.Element => {

    const publicationsSelected = useDataStore((state) => state.publicationsSelected);
    const selectedFilters = useDataStore((state) => state.selectedFilters);
    const addFilter = useDataStore((state) => state.addFilter);
    const removeFilter = useDataStore((state) => state.removeFilter);
    const upsetConsolidate = useDataStore((state) => state.upsetConsolidate);
    const chartColorScheme = useDataStore((state => state.chartColorScheme));

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
                <div className={styles.filterSelectorsTitle}> Selectors</div>
                <div className={styles.selectorRow}>
                    {filter.groupLabels.map((label: string, index: number) => {

                        return (
                            <div key={label} style={{ 'backgroundColor': chartColorScheme[index % 6] }} className="pill">
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
                <div className={styles.filterSelectorsTitle}>Selectors</div>
                <div className={styles.selectorRow}>
                    {filter.groupLabels.map((label: string) => {
                        const { pub_name, suffix, pub_id } = parseLabel(label, publicationsSelected, upsetConsolidate)
                        return (
                            <div
                                key={label}
                                style={{ 'backgroundColor': chartColorScheme[publicationsSelected.findIndex(item => item.id === parseInt(pub_id)) % 6] }}
                                className="pill"
                            >
                                {suffix ? `${pub_name} - ${suffix.replace(',', ' to ')}` : `${pub_name}`}
                            </div>
                        )
                    })}
                </div>
                <div className={styles.filterStatisticsTitle}>Statistics</div>
                <div className={styles.filterStatisticsContent}>{filter.type === 'upset-filter' ? 'Number of Albums In Intersection: ' : 'Number of Albums in Set: '} <b>{filter.albumIds?.length}</b></div>
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
        if (selectedFilters.length === 0) return <div className={styles.noFiltersSelected}>No Filters selected.</div>
        return (
            <>
                {selectedFilters.map((filter: Filter) => {
                    return (
                        <FilterComponent key={filter.id} filter={filter} add={false} />
                    )
                })}
            </>
        )
    }

    const LazyLoadingComponent = () => {
        return (
            <div className={styles.lazyLoadingComponentWrapper}>
                <div className={styles.lazyLoadingComponentContainer}>
                    <div className={styles.lazyLoadingComponentContent}>Loading</div>
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
        <div className={styles.filtersPageContainer}>
            <div>
                <Tabs tabData={tabsData} />
            </div>
            <div className={styles.hoveredDataContainer}>
                <div>
                    <h1 className={styles.currentHoveredDataTitle}>Current Hovered Data</h1>
                    <HoveredInfoComponent />
                    <h1 className={styles.chosenFiltersTitle}>Chosen Filters</h1>
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