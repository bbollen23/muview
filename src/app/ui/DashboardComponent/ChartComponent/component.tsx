import React, { useState } from 'react';

import type { Publication } from "@/app/lib/definitions";
import styles from "./component.module.scss";
import { Icon, IconDropdown, Tooltip } from '@bbollen23/brutal-paper';
import useSWR from 'swr';
import { LoadingIcon } from '@bbollen23/brutal-paper';
import { fetcher } from '@/app/lib/fetcher';
import clsx from 'clsx';
import { ChartType } from '../component';
import { ScatterPlot, BarChart } from '@/app/ui';
import { useDataStore } from '@/providers/data-store-provider';


export interface ChartProps {
    publication: Publication;
    years: number[];
    type?: ChartType;
}

const Chart = ({ publication, years, type }: ChartProps) => {

    const { data } = useSWR(`/api/pubYearStats?publication_id=${publication.id}&years=${years}`, fetcher)

    const clearBarSelection = useDataStore((state) => state.clearBarSelection);
    const selectAllBarSelection = useDataStore((state) => state.selectAllBarSelection);
    const toggleNoScoreRankHiddenState = useDataStore((state) => state.toggleNoScoreRankHiddenState);
    const noScoreRankHiddenState = useDataStore((state) => state.noScoreRankHiddenState);

    const [errorNumber, setErrorNumber] = useState<number>(0);

    const toggleHidden = () => {
        toggleNoScoreRankHiddenState(years, publication.id)
    }

    const handleChartMenuChange = (entry: string) => {
        if (entry === 'Clear All') {
            clearBarSelection(publication.id, years);
        } else if (entry === 'Select All') {
            selectAllBarSelection(publication.id, years);
        }
    }

    // If any are shown, show all when combined years.
    const isHidden = () => {
        for (const year of years) {
            if (noScoreRankHiddenState[year]) {
                if (noScoreRankHiddenState[year][publication.id] === false) {
                    return false
                }
            }
        }
        return true;
    }

    return (
        <div className={styles.chartContainer}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className={styles.header}>
                    <div className={styles.headerGroup}>
                        <img
                            className='pub-icon'
                            src={`/images/publications/${publication.unique_name}.webp`}
                            width="30px"
                            height="30px"
                        />
                        <div className={styles.publicationName}>
                            {publication.name}
                        </div>

                    </div>
                    {type === 'barChart' ?
                        <div className={styles.headerGroup}>

                            <div className={clsx(styles.singleStat, 'small-loading-icon')}>
                                <Tooltip size="sm" content="Number of Reviews">
                                    <Icon size="xs" type="none" icon='bi bi-file-earmark' dense />
                                </Tooltip>
                                {data ? <span style={{ fontSize: '0.8rem' }}>{data.newStats[0] ? data.newStats[0].number_of_reviews : 0}</span> : <LoadingIcon visible={true} />}
                            </div>
                            <div className={clsx(styles.singleStat, 'small-loading-icon')}>
                                <Tooltip size="sm" content="Average Score">
                                    <Icon size="xs" type="none" icon='bi bi-graph-up' dense />
                                </Tooltip>
                                {data ? <span style={{ fontSize: '0.8rem' }}>{data.newStats[0] ? data.newStats[0].avg_score : 'N/A'}</span> : <LoadingIcon visible={true} />}
                            </div>
                            <IconDropdown
                                size="sm"
                                icon='bi bi-three-dots'
                                onChange={handleChartMenuChange}
                                dropDownList={['Select All', 'Clear All']}
                            />
                        </div> :
                        <div className={styles.headerGroup}>
                            {errorNumber > 0 ? <div className={styles.singleStat}>
                                <Tooltip size="sm" content={`${isHidden() ? 'Show' : 'Hide'} ${errorNumber} ${errorNumber > 1 ? 'albums' : 'album'} without an original score`}>
                                    <div className={styles.error} onClick={toggleHidden}>
                                        <Icon size="xs" type="none" icon={isHidden() ? "bi bi-eye-slash" : "bi bi-eye"} dense />
                                        <span>{errorNumber}</span>

                                    </div>
                                </Tooltip>
                            </div> : null}
                        </div>
                    }

                </div>
                <div style={{ alignSelf: 'center' }}>
                    {type === 'scatterPlot' ? <ScatterPlot hidden={isHidden()} years={years} publication_id={publication.id} setErrorNumber={setErrorNumber} /> : <BarChart years={years} publication_id={publication.id} />}
                </div>
            </div>

        </div>
    )
}

export default Chart;