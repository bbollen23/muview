import React from 'react';

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

    // Needs to have stepSize so that we can calculate all bins
    // const [stepSize, setStepSize] = useState<number | null>(null);

    const handleChartMenuChange = (entry: string) => {
        if (entry === 'Clear All') {
            clearBarSelection(publication.id, years);
        } else if (entry === 'Select All') {
            selectAllBarSelection(publication.id, years);
        }
    }

    return (
        <div className={styles.chartContainer}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className={styles.header}>
                    <div className={styles.headerGroup}>
                        <img
                            className='pub-icon'
                            src={`/images/${publication.unique_name}.webp`}
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
                                {data ? <span style={{ fontSize: '0.8rem' }}>{data.newStats[0].number_of_reviews}</span> : <LoadingIcon visible={true} />}
                            </div>
                            <div className={clsx(styles.singleStat, 'small-loading-icon')}>
                                <Tooltip size="sm" content="Average Score">
                                    <Icon size="xs" type="none" icon='bi bi-graph-up' dense />
                                </Tooltip>
                                {data ? <span style={{ fontSize: '0.8rem' }}>{data.newStats[0].avg_score}</span> : <LoadingIcon visible={true} />}
                            </div>
                            <IconDropdown
                                size="sm"
                                icon='bi bi-three-dots'
                                onChange={handleChartMenuChange}
                                dropDownList={['Select All', 'Clear All']}
                            />
                        </div> : null}

                </div>
                <div style={{ alignSelf: 'center' }}>
                    {type === 'scatterPlot' ? <ScatterPlot years={years} publication_id={publication.id} /> : <BarChart years={years} publication_id={publication.id} />}
                </div>
            </div>

        </div>
    )
}

export default Chart;