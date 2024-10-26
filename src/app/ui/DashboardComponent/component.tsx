import styles from "./component.module.scss";
import { Icon, Scrollable } from "@bbollen23/brutal-paper";
import { useDataStore } from "@/providers/data-store-provider";
import type { Publication } from "@/app/lib/definitions";
import { useState } from "react";
import { Chart } from '@/app/ui';


export type ChartType = 'scatterPlot' | 'barChart';

interface DashboardComponentProps {
    combineYears: boolean;
    type?: ChartType;
}

interface YearSectionProps {
    children: React.ReactNode;
    year: number;
    index: number
}

const DashboardComponent = ({ combineYears, type }: DashboardComponentProps): JSX.Element => {

    const publicationsSelected = useDataStore((state) => state.publicationsSelected);
    const selectedYears = useDataStore((state) => state.selectedYears);

    const [yearsCollapsed, setYearsCollapsed] = useState<boolean[]>(new Array(selectedYears.length).fill(false))


    const handleCollapseClick = (idx: number) => {
        setYearsCollapsed((prev) => {
            const updatedState = [...prev];
            updatedState[idx] = !prev[idx];
            return updatedState
        })
    }

    const YearSection = ({ children, index, year }: YearSectionProps) => {
        return (
            <div className={styles.yearSectionContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bp-theme-border-color)', margin: '10px 0px', paddingBottom: '5px' }}>
                    <div><h1 style={{ margin: 0, padding: 0 }}>{year}</h1></div>
                    <Icon size="sm" icon={yearsCollapsed[index] ? `bi bi-chevron-up` : `bi bi-chevron-down`} onClick={() => handleCollapseClick(index)} />
                </div>
                {yearsCollapsed[index] ? null : <div className={styles.dataContainer}>
                    {children}
                </div>}
            </div>
        )
    }


    if (combineYears) return (
        <Scrollable width="100%" height="calc(100vh - 340px)">
            <div className={styles.dataContainer} style={{ marginTop: '40px' }}>
                {publicationsSelected.map((publication: Publication) => {
                    return (
                        <Chart
                            key={`${type}-${publication.id}-${selectedYears.join('-')}`} publication={publication}
                            years={selectedYears}
                            type={type}
                        >
                        </Chart>
                    )
                })}
            </div>
        </Scrollable>
    )

    return (
        <Scrollable width="100%" height="calc(100vh - 340px)">
            {selectedYears.map((year: number, index: number) =>
                <YearSection key={`year-section-${year}`} index={index} year={year}>
                    {publicationsSelected.map((publication: Publication) => {
                        return (
                            <Chart
                                key={`${type}-${publication.id}-${year}`}
                                publication={publication}
                                years={[year]}
                                type={type}
                            >
                            </Chart>
                        )
                    })}
                </YearSection>
            )}
        </Scrollable>
    )
}

export default DashboardComponent;