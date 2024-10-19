import { BarChart } from "@/app/ui";
import styles from "./component.module.scss";
import { Icon, Scrollable } from "@bbollen23/brutal-paper";
import { useDataStore } from "@/providers/data-store-provider";
import type { Publication } from "@/app/lib/definitions";
import { useState } from "react";


interface ReviewDistributionComponentProps {
    combineYears: boolean;
}

interface YearSectionProps {
    children: React.ReactNode;
    year: number;
    index: number
}

interface ChartProps {
    publication: Publication;
    years: number[];
}

const ReviewDistributionComponent = ({ combineYears }: ReviewDistributionComponentProps): JSX.Element => {

    const publicationsSelected = useDataStore((state) => state.publicationsSelected);
    const selectedYears = useDataStore((state) => state.selectedYears);

    const [barsCollapsed, setBarsCollapsed] = useState<boolean[]>(new Array(selectedYears.length).fill(false));


    const handleCollapseClick = (idx: number) => {
        setBarsCollapsed((prev) => {
            const updatedState = [...prev];
            updatedState[idx] = !prev[idx];
            return updatedState
        })
    }

    const YearSection = ({ children, index, year }: YearSectionProps) => {
        return (
            <div key={`${year}-${index}-bar`} className={styles.yearSectionContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bp-theme-border-color)', margin: '10px 0px', paddingBottom: '5px' }}>
                    <div><h1 style={{ margin: 0, padding: 0 }}>{year}</h1></div>
                    <Icon size="sm" icon={barsCollapsed[index] ? `bi bi-chevron-up` : `bi bi-chevron-down`} onClick={() => handleCollapseClick(index)} />
                </div>
                {barsCollapsed[index] ? null : <div className={styles.dataContainer}>
                    {children}
                </div>}
            </div>
        )
    }



    const Chart = ({ publication, years }: ChartProps) => {
        return (
            <div key={publication.id} className={styles.chartContainer}>
                <div>
                    <div className={styles.header}>
                        <Icon icon="bi bi-house" />
                        <div className={styles.publicationName}>
                            {publication.name}
                        </div>
                    </div>
                    <BarChart years={years} publication_id={publication.id} />
                </div>
            </div>
        )
    }

    if (combineYears) return (
        <Scrollable width="100%" height="calc(100vh - 340px)">
            <div className={styles.dataContainer} style={{ marginTop: '40px' }}>
                {publicationsSelected.map((publication: Publication) => {
                    return <Chart publication={publication} years={selectedYears} />
                })}
            </div>
        </Scrollable>
    )

    return (
        <Scrollable width="100%" height="calc(100vh - 340px)">
            {selectedYears.map((year: number, barIdx: number) =>
                <YearSection index={barIdx} year={year}>
                    {publicationsSelected.map((publication: Publication) => {
                        return <Chart publication={publication} years={[year]} />
                    })}
                </YearSection>
            )}
        </Scrollable>
    )
}

export default ReviewDistributionComponent;