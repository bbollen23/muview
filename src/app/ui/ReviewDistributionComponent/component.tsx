import { BarChart } from "@/app/ui";
import styles from "./component.module.scss";
import { Icon, Scrollable } from "@bbollen23/brutal-paper";
import { useDataStore } from "@/providers/data-store-provider";
import type { Publication } from "@/app/lib/definitions";
import { useState } from "react";


interface ReviewDistributionComponentProps {
    combineYears?: boolean;
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


    return (
        <Scrollable width="100%" height="calc(100vh - 240px)">
            {selectedYears.map((year: number, barIdx: number) =>
                <div key={`${year}-${barIdx}-bar`} className={styles.yearSectionContainer}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bp-theme-border-color)', margin: '10px 0px', paddingBottom: '5px' }}>
                        <div><h1 style={{ margin: 0, padding: 0 }}>{year}</h1></div>
                        <Icon size="sm" icon={barsCollapsed[barIdx] ? `bi bi-chevron-up` : `bi bi-chevron-down`} onClick={() => handleCollapseClick(barIdx)} />
                    </div>
                    {barsCollapsed[barIdx] ? null : <div className={styles.dataContainer}>
                        {publicationsSelected.map((publication: Publication) => {
                            return (
                                <div key={publication.id} className={styles.chartContainer}>
                                    <div>
                                        <div className={styles.header}>
                                            <Icon icon="bi bi-house" />
                                            <div className={styles.publicationName}>
                                                {publication.name}
                                            </div>
                                        </div>
                                        <BarChart year={year} publication_id={publication.id} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>}
                </div>
            )}


        </Scrollable>
    )
}

export default ReviewDistributionComponent;